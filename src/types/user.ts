export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserSafe {
  id: number;
  publicId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
