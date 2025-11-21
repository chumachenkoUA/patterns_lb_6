import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for Prisma client');
}

const adapter = new PrismaMariaDb(databaseUrl);

export const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
  adapter,
});

export type PrismaClientType = typeof prisma;
