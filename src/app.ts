import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import { ensureUsersTable } from './database/bootstrap';
import { prisma } from './database/prismaClient';
const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  await prisma.$connect();
  await ensureUsersTable();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

void startServer();

export default app;
