import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { dashboardService } from '../services/dashboard.service';

export const inventoryController = {
  getDashboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kpis = await dashboardService.getKPIs();
      res.json({ success: true, data: kpis });
    } catch (error) { next(error); }
  },

  getMovements: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const type = req.query.type as string;

      const result = await inventoryService.getMovements(page, limit, search, type);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  adjustStock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await inventoryService.adjustStock(req.user!.userId, req.body);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
};
