import { prisma } from './prismaClient';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../config/env';

const DEFAULT_PASSWORD = 'ChangeMe123!';

export const ensureUsersTable = async (): Promise<void> => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      public_id CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('USER', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);

  const [passwordHashColumn] = await prisma.$queryRawUnsafe<Array<{ count: number }>>(`
    SELECT COUNT(*) AS count
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'password_hash'
  `);

  if (Number(passwordHashColumn?.count || 0) === 0) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users
      ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER email
    `);
  }

  // Clean up legacy plain-text password column if it still exists
  const [passwordColumn] = await prisma.$queryRawUnsafe<Array<{ count: number }>>(`
    SELECT COUNT(*) AS count
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'password'
  `);

  if (Number(passwordColumn?.count || 0) > 0) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users
      DROP COLUMN password
    `);
  }

  const [{ count: missingPasswords = 0 } = {}] = await prisma.$queryRawUnsafe<
    Array<{ count: number }>
  >(`
    SELECT COUNT(*) AS count
    FROM users
    WHERE password_hash IS NULL OR password_hash = ''
  `);

  if (Number(missingPasswords) > 0) {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await prisma.$executeRaw`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE password_hash IS NULL OR password_hash = ''
    `;
    console.warn(
      `[BOOTSTRAP] Backfilled password_hash for ${missingPasswords} user(s) using default password. Change them immediately.`
    );
  }
};

// Simple guard to ensure env is loaded; JWT_SECRET import keeps dotenv executed.
void JWT_SECRET;
