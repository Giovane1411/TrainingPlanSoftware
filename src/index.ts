
import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
//import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyApiReference from "@scalar/fastify-api-reference";
//import { fromNodeHeaders } from "better-auth/node";
import Fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import z from "zod/v4";

import { auth } from "./lib/auth.js";



const app = Fastify({
  logger: true,
});

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Bootcamp Treinos API',
      description: 'API para o bootcamp de treinos do FSC',
      version: '1.0.0',
    },
    servers: [{
      description: "Localhost",
      url: "http://localhost:3000",
    }],
  },
  transform: jsonSchemaTransform,
});

 
//await app.register(fastifySwaggerUI, {
//  routePrefix: '/docs',
//});

await app.register(fastifyCors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration:{
    sources: [{
      title: "Bootcamp Treinos API",
      slug: "bootcamp-treinos-api",
      url: "/swagger.json",
    },
  {
    title: "Auth API",
    slug: "auth-api",
    url: "/api/auth/open-api/generate-schema",

  },],
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  }
});


app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Declare a route

app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
        description: 'Hello World',
        tags: ['hello'],
        response: {
            200: z.object({
                message: z.string(),
            }),    
        },        
    },
    handler: () => {
        return { 
            message: "teste" 
        };
    },
  });

  const WeekDay = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
// Começa criando a rota para workout plans
app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/workout-plans",
  schema: {
    body: z.object({
      name: z.string().trim().min(1, {message: "Name is required" }),

      workoutDays: z.array(
        z.object({
          name: z.string().trim().min(1), // exemplo: superiores
          weekDay: z.enum(WeekDay), // usando nativeEnum para enums do TypeScript
          isRest: z.boolean().default(false), // se é dia de descanso
          estimatedDurationInSeconds: z.number().min(1),

          exercises: z.array (
            z.object({
              name: z.string().trim().min(1),
              order: z.number().min(0),
              sets: z.number().min(1),
              repts: z.number().min(1),
              restTimeInSeconds: z.number().min(1),
            }),
          ),
        }),
      ),
    }),
  },
});

// Register authentication endpoint
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);
      
      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      // Process authentication request
      const response = await auth.handler(req);
      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ 
        error: "Internal authentication error",
        code: "AUTH_FAILURE"
      });
    }
  }
});

// Run the server!
try {
 await app.listen({ port: Number(process.env.PORT) || 3000 })
} catch (err) {
 app.log.error(err)
 process.exit(1)
}