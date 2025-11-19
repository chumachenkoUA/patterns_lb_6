require('dotenv').config();
const express = require('express');
const userRoutes = require('./src/routes/user.routes');
const {
  notFoundHandler,
  errorHandler,
} = require('./src/middleware/error.middleware');
const { ALLOWED_ROLES } = require('./src/config/roles');
const prisma = require('./src/database/prismaClient');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'User CRUD API',
    endpoints: {
      users: '/api/users',
      roles: ALLOWED_ROLES,
    },
  });
});

app.get('/status', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        service: 'solid-users-service',
        db: 'connected',
        roles: ALLOWED_ROLES,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/users', userRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database', error);
    process.exit(1);
  }
};

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
