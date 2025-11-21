import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';
import type { LoginInput, RegisterInput } from '../types/auth-service-types';

export async function registerController(
  req: Request<unknown, unknown, RegisterInput>,
  res: Response
): Promise<void> {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function loginController(
  req: Request<unknown, unknown, LoginInput>,
  res: Response
): Promise<void> {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
