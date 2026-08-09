import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const settingsController = {
  updateNotifications: async (req: Request, res: Response) => {
    try {
      // Hardcode the first admin user for simplicity, since we don't have full JWT user injection in req.user yet.
      // In a real scenario: const userId = req.user.id;
      const adminUser = await prisma.user.findFirst({ where: { email: 'admin@nexora.co' } });
      if (!adminUser) return res.status(401).json({ success: false });

      const { notifyLowStock, notifyFollowUps, notifyChallans, notifySystem } = req.body;
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          notifyLowStock: Boolean(notifyLowStock),
          notifyFollowUps: Boolean(notifyFollowUps),
          notifyChallans: Boolean(notifyChallans),
          notifySystem: Boolean(notifySystem)
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
