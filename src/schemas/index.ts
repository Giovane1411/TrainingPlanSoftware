// Este importe é a biblioteca Zod, que é usada para criar schemas de validação de dados. Ela permite definir regras para os dados e validar se os dados fornecidos atendem a regra.
import z from 'zod/v4';

import { WeekDay } from "../generated/prisma/enums.js"

// O objetivo deste schema é validar os dados relacionados a um exercício de treino.
export const WorkoutExerciseSchema = z.object({
    name: z.string().trim().min(1), // O nome do exercício deve ser em string e é obrigatório.
    order: z.number().int().min(0), // A ordem do exercício
    sets: z.number().int().min(1), // O número de séries deve ser um número inteiro e no mínimo 1.
    reps: z.number().int().min(1), // O número de repetição deve ser um número inteiro e no mínimo 1.
    restTimeInSeconds: z.number().int().min(1) // O tempo de descanso entra as séries deve ser um número inteiro e no mínimo 1 segundo.   
})

export const WorkoutDaySchema = z.object({
    name: z.string().trim().min(1), // O nome do dia de treino deve ser em string e é obrigatório.
    weekDay: z.enum(WeekDay), // O dia da semana deve ser um dos valores específicos.
    isRest: z.boolean().default(false), // Indica se é um dia de descanso, por padrã é falso, depois o usuário informará se é descanso.
    estimatedDurationInSeconds: z.number().int().min(1), // Por ora, vou colocar, mas não está no schema.prisma.
    coverImageUrl: z.string().optional(), // A URL da imagem do dia de treino é opcional, mas se for fornecida, deve ser uma string.
    exercises: z.array(WorkoutExerciseSchema) // A lista de exercícios deve ser um array de objetos que seguem o schema WorkoutExerciseSchema.    
})

export const WorkoutPlanSchema = z.object({
    name: z.string().trim().min(1), // O nome do plano de treino deve ser em string e é obrigatório.
    isActive: z.boolean().default(true), // Indica se o plano de treino está ativo, por padrão o projeto terá um plano de treino, por isso do true como padrão.   
    workoutDays: z.array(WorkoutDaySchema) // A lista de dias de treino do plano.
})

// Esse export serve para receber a requisição URL pelo usuário e verificar o workoutPlanID e workoutDayId para verificar o ID que estou recebendo para não corromper os dados
// Entrada de dados sendo validada 
export const WorkoutSessionParamsSchema = z.object({
    workoutPlanId: z.string().uuid(), // O ID do plano de treino deve ser uma string no format UUID e é obrigatório.
    workoutDayId: z.string().uuid() // o ID do dia de treino deve ser uma string no formato UUID e é obrigatório.
})

// Aqui estou validando o formato que app mobile vai receber o id da sessão do treino para poder referenciar nas próximas ações, como encerrar um treino, adicionar treino. 
// Ou seja, basicamente API está retornando o ID de uma sessão de Treino do dia
// Para que possa cronometrar, concluir o exercício
// Saída de dados sendo validada
export const WorkoutSessionResponseSchema = z.object({
    id: z.string().uuid()
})

// Aqui estou fazendo um schema para validar as mensagem de erros para fins de padronização
export const ErrorSchema = z.object({
    error: z.string().trim(),
    code: z.string().trim() 
})