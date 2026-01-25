import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
  // ✅ Change this line
import pkg from 'pg';
import { PrismaClient } from "../generated/prisma/client.js";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;  