import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

const globalForPrisma = globalThis as typeof globalThis & {
  prismaClient?: ReturnType<typeof createPrismaClient>;
};

export function getPrismaClient() {
  if (!globalForPrisma.prismaClient) {
    globalForPrisma.prismaClient = createPrismaClient();
  }

  return globalForPrisma.prismaClient;
}
