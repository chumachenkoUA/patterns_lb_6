import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../database/prismaClient';
import { UserSafe, UserRole } from '../types/user';
import { toSafeUser } from '../utils/mappers';

const prismaClient: PrismaClient = prisma;

export const getAllUsers = async (role?: UserRole): Promise<UserSafe[]> => {
  const where: Prisma.UserWhereInput = role ? { role } : {};
  const users = await prismaClient.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return users.map(toSafeUser);
};

export const getUserByPublicId = async (publicId: string): Promise<UserSafe> => {
  const user = await prismaClient.user.findUnique({ where: { publicId } });
  if (!user) {
    throw new Error('User not found');
  }
  return toSafeUser(user);
};

export const deleteUserByPublicId = async (publicId: string): Promise<void> => {
  await prismaClient.user.delete({ where: { publicId } });
};

export const updateUserByPublicId = async (
  publicId: string,
  data: Partial<Pick<Prisma.UserUpdateInput, 'name' | 'email' | 'role'>>
): Promise<UserSafe> => {
  const updated = await prismaClient.user.update({
    where: { publicId },
    data,
  });
  return toSafeUser(updated);
};
