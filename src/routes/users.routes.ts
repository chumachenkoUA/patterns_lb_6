import { Router } from 'express';
import {
  deleteUserController,
  getUserController,
  listUsersController,
  updateUserController,
} from '../controllers/users.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.get('/', authMiddleware, requireRole(['ADMIN', 'SUPER_ADMIN']), listUsersController);
router.get('/:publicId', authMiddleware, requireRole(['ADMIN', 'SUPER_ADMIN']), getUserController);
router.put('/:publicId', authMiddleware, requireRole(['ADMIN', 'SUPER_ADMIN']), updateUserController);
router.delete('/:publicId', authMiddleware, requireRole(['ADMIN', 'SUPER_ADMIN']), deleteUserController);

export default router;
