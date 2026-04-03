import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// prevent multiple instance due to nodemon
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
