import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../prismaClient';
import type {
  RegisterInput,
  LoginInput,
  UserSafe,
} from '../types/auth-service-types';
import type { JwtPayloadWithRole } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const toSafeUser = (user: {
  id: number;
  publicId: string;
  name: string;
  email: string;
  role: UserSafe['role'];
  createdAt: Date;
  updatedAt: Date;
}): UserSafe => ({
  id: user.id,
  publicId: user.publicId,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export async function registerUser(input: RegisterInput): Promise<UserSafe> {
  const { email, password, name, role = 'USER' } = input;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
    },
  });

  return toSafeUser(user);
}

export async function loginUser(
  input: LoginInput
): Promise<{ token: string; user: UserSafe }> {
  const { email, password } = input;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new Error('Invalid email or password');
  }

  const payload: JwtPayloadWithRole = {
    sub: user.publicId,
    role: user.role,
  };

  const signOptions: SignOptions = {
    expiresIn: (JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
  };
  const token = jwt.sign(payload, JWT_SECRET, signOptions);

  return { token, user: toSafeUser(user) };
}
