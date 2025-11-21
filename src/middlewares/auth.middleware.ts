import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import type { JwtPayloadWithRole } from '../types/auth';
/// <reference path="../types/express/index.d.ts" />

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers['authorization'];

  if (!header) {
    res.status(401).json({ error: 'Authorization header required' });
    return;
  }

  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    res.status(401).json({ error: 'Invalid auth format' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayloadWithRole;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};
