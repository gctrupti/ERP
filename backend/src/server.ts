import app from './app';
import { env } from './config/env';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log('Backend server running on http://localhost:' + PORT);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
