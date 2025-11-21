/// <reference path="../types/express/index.d.ts" />
import { NextFunction, Request, Response } from 'express';

export function requireRole(roles: Array<'USER' | 'ADMIN' | 'SUPER_ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    next();
  };
}
