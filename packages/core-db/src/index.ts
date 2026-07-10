import * as client from "./generated/prisma/client";

// Export types and values
export type PrismaClient = client.PrismaClient;
export const PrismaClient = client.PrismaClient;

// Export Prisma namespace/types/values
export import Prisma = client.Prisma;
