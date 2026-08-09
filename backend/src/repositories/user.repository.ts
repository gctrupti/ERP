import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userRepository = {
  logActivity: async (userId: string, action: string, details: string) => {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        entity: 'User', // default entity
        entityId: userId
      }
    });
  }
};
