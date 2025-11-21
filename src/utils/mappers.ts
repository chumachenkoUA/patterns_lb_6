import { User } from '@prisma/client';
import { UserSafe } from '../types/user';

export const toSafeUser = (user: User): UserSafe => ({
  id: user.id,
  publicId: user.publicId,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
