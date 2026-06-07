// Aqui estou importando o adaptador do Prisma para PostgreSQL
import {PrismaPg} from "@prisma/adapter-pg"

// Aqui eu estou importando do Prisma Client,é o que vai perimiter eu fazer o CRUD no banco de dados
import {PrismaClient} from "../generated/prisma/client.js"

// Aqui estou pegando a string de conexão do banco de dados a partir das variáveis de ambiente
const connectionString = process.env.DATABASE_URL

// Aqui estou criando uma instância do adaptador do Prisma para PostgreSQL usando a url do banco de dados
const adapter = new PrismaPg({connectionString})

// Aqui estou implementando o padrão singleton para o Prisma Client, garantindo que haja apenas uma conexão.
// Se houver valor na variável global chamada "prisma", eu uso ela.
// Caso contrário, eu crio uma nova instância do Prisma Client usando o adaptador que eu criei.
// Verifico se o ambiente de execução é diferente de "production"
// Se for diferente, eu armazeno a instância do Prisma Client na variável global "prisma"
// Não usamos no ambiente de produção pois o servidor não fica reiniciando constantemente
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({adapter})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma