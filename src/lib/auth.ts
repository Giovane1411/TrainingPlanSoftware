// Aqui estou importando a biblioteca do better-auth localizado no PNPM
import {betterAuth} from "better-auth"
//Permite salvar os dados de autenticação, tokens, sessão no banco de dados
import {prismaAdapter} from "better-auth/adapters/prisma"
// Permite ser documentado a rota de autenticação usando openAPI
import {openAPI} from "better-auth/plugins"

// Aqui eu estou importando o prisma do arquivo db.ts
// Aqui já está configurado para usar o adaptador do prisma
// Aqui está ativa a conexão com o banco de dados
import { prisma } from "./db.js"


// Basicamente aqui eu estou configurando as regras do betterAuth,
// Estou dizendo que quero usar o email e senha para autenticação,
// Estou dizendo que quero usar o prismaAdapter para salvar os dados de autenticação no banco de dados.
export const auth = betterAuth({
  
  trustedOrigins: ["http://localhost:3000"], // <- Aqui você pode adicionar as origens confiáveis para redirecionamento após login/logout, etc.

  emailAndPassword:{
    enabled: true, // Habilita o login com email e senha
  },
  
  database: prismaAdapter(prisma, {
    provider: "postgresql", // <- Especifica o tipo do banco de dados, neste caso PostgreSQL
  }),

  plugins: [openAPI()],// <- Habilita a geração de documentação OpenAPI para as rotas de autenticação

})