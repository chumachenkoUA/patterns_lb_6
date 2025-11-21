import type { JwtPayload } from 'jsonwebtoken';

export interface JwtPayloadWithRole extends JwtPayload {
  sub: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}
