export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserSafe {
  id: number;
  publicId: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
