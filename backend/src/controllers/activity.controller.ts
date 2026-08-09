import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const activityController = {
  getRecentLogs: async (req: Request, res: Response) => {
    try {
      const logs = await prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, role: { select: { name: true } } } } }
      });
      
      const formatted = logs.map(l => ({
        id: l.id,
        user: l.user.name,
        role: l.user.role.name,
        action: l.action,
        module: l.details || 'System',
        timestamp: l.createdAt
      }));

      res.json({ success: true, data: formatted });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
