import { Request, Response } from 'express';
import {
  deleteUserByPublicId,
  getAllUsers,
  getUserByPublicId,
  updateUserByPublicId,
} from '../services/user.service';
import { UserRole } from '../types/user';

export const listUsersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const role = req.query.role as UserRole | undefined;
    const users = await getAllUsers(role);
    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getUserController = async (
  req: Request<{ publicId: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByPublicId(req.params.publicId);
    res.status(200).json({ user });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};

export const deleteUserController = async (
  req: Request<{ publicId: string }>,
  res: Response
): Promise<void> => {
  try {
    await deleteUserByPublicId(req.params.publicId);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateUserController = async (
  req: Request<{ publicId: string }, unknown, Partial<{ name: string; email: string; role: UserRole }>>,
  res: Response
): Promise<void> => {
  try {
    const user = await updateUserByPublicId(req.params.publicId, req.body);
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
