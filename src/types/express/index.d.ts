import type { JwtPayloadWithRole } from '../auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadWithRole;
    }
  }
}

export {};
