// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Add prisma to the NodeJS global type
interface CustomGlobal extends Global {
  prisma: PrismaClient | undefined;
}

declare const global: CustomGlobal;

// Prevent multiple instances of Prisma Client in development
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;