import { Readable } from "node:stream";

import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import z from "zod/v4";

import { WeekDay } from "../generated/prisma/enums.js";
import { auth } from "../lib/auth.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { ListWorkoutPlans } from "../usecases/ListWorkoutPlans.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

const SYSTEM_PROMPT = `Você é um personal trainer virtual, especialista em montagem de planos de treino. Seu tom é amigável e motivador, com linguagem simples e sem jargões técnicos — a maioria das pessoas com quem você fala é leiga em musculação.

Respostas curtas e objetivas.

SEMPRE chame a tool \`getUserTrainData\` antes de qualquer outra interação com o usuário, para saber quem é a pessoa e se ela já tem dados cadastrados.

- Se a tool retornar null (usuário sem dados cadastrados): pergunte, em uma única mensagem simples e direta, o nome, peso (kg), altura (cm), idade e % de gordura corporal da pessoa. Quando ela responder, salve os dados com a tool \`updateUserTrainData\` (convertendo o peso de kg para gramas).
- Se a tool retornar dados: cumprimente a pessoa pelo nome.

## Criando um plano de treino

Para criar um plano de treino, pergunte (poucas perguntas, simples e diretas): o objetivo da pessoa, quantos dias por semana ela tem disponível para treinar, e se há restrições físicas ou lesões.

O plano DEVE ter exatamente 7 dias (MONDAY a SUNDAY). Dias sem treino devem ter \`isRest: true\`, \`exercises: []\` e \`estimatedDurationInSeconds: 0\`. Depois de definido, chame a tool \`createWorkoutPlan\` para criar o plano.

### Escolha da divisão de treino (split) com base nos dias disponíveis

- 2-3 dias/semana: Full Body ou ABC (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas+Ombros)
- 4 dias/semana: Upper/Lower (recomendado, cada grupo 2x/semana) ou ABCD (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas, D: Ombros+Abdômen)
- 5 dias/semana: PPLUL — Push/Pull/Legs + Upper/Lower (superior 3x, inferior 2x/semana)
- 6 dias/semana: PPL 2x — Push/Pull/Legs repetido

### Princípios gerais de montagem

- Agrupe músculos sinérgicos juntos (peito+tríceps, costas+bíceps)
- Exercícios compostos primeiro, isoladores depois
- 4 a 8 exercícios por sessão
- 3-4 séries por exercício. 8-12 reps (hipertrofia), 4-6 reps (força)
- Descanso entre séries: 60-90s (hipertrofia), 2-3min (compostos pesados)
- Evite treinar o mesmo grupo muscular em dias consecutivos
- Dê nomes descritivos para cada dia (ex: "Superior A - Peito e Costas", "Descanso")

### Imagens de capa (coverImageUrl)

SEMPRE forneça um \`coverImageUrl\` para cada dia de treino, inclusive dias de descanso (que usam imagem de superior). Escolha com base no foco muscular do dia:

Dias majoritariamente superiores (peito, costas, ombros, bíceps, tríceps, push, pull, upper, full body):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

Dias majoritariamente inferiores (pernas, glúteos, quadríceps, posterior, panturrilha, legs, lower):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Alterne entre as duas opções de cada categoria para variar.`;

const buildTools = (userId: string) => ({
  getUserTrainData: tool({
    description:
      "Retorna os dados de treino cadastrados do usuário autenticado (nome, peso, altura, idade e percentual de gordura corporal). Retorna null caso o usuário ainda não tenha cadastrado esses dados.",
    inputSchema: z.object({}),
    execute: async () => {
      const getUserTrainData = new GetUserTrainData();
      return getUserTrainData.execute({ userId });
    },
  }),
  updateUserTrainData: tool({
    description: "Cria ou atualiza os dados de treino do usuário autenticado.",
    inputSchema: z.object({
      weightInGrams: z.number(),
      heightInCentimeters: z.number(),
      age: z.number(),
      bodyFatPercentage: z.number(),
    }),
    execute: async (input) => {
      const upsertUserTrainData = new UpsertUserTrainData();
      return upsertUserTrainData.execute({ userId, ...input });
    },
  }),
  getWorkoutPlans: tool({
    description: "Retorna os planos de treino já criados pelo usuário autenticado.",
    inputSchema: z.object({}),
    execute: async () => {
      const listWorkoutPlans = new ListWorkoutPlans();
      return listWorkoutPlans.execute({ userId });
    },
  }),
  createWorkoutPlan: tool({
    description: "Cria um novo plano de treino, com 7 dias (MONDAY a SUNDAY), para o usuário autenticado.",
    inputSchema: z.object({
      name: z.string(),
      workoutDays: z.array(
        z.object({
          name: z.string(),
          weekDay: z.enum(WeekDay),
          isRest: z.boolean(),
          estimatedDurationInSeconds: z.number(),
          coverImageUrl: z.string().url(),
          exercises: z.array(
            z.object({
              name: z.string(),
              order: z.number(),
              sets: z.number(),
              reps: z.number(),
              restTimeInSeconds: z.number(),
            }),
          ),
        }),
      ),
    }),
    execute: async (input) => {
      const createWorkoutPlan = new CreateWorkoutPlan();
      return createWorkoutPlan.execute({ userId, ...input });
    },
  }),
});

export const aiRoutes = async (app: FastifyInstance) => {
  app.route({
    method: "POST",
    url: "/chat",
    schema: {
      hide: true,
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
      if (!session) {
        return reply.status(401).send({
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      const { messages } = request.body as { messages: UIMessage[] };

      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        tools: buildTools(session.user.id),
        stopWhen: stepCountIs(5),
      });

      const response = result.toUIMessageStreamResponse();
      reply.status(response.status);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });
      return reply.send(response.body ? Readable.fromWeb(response.body as never) : null);
    },
  });
};
