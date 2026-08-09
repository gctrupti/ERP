import { Request, Response, NextFunction } from 'express';
import { reportsService } from '../services/reports.service';

export const reportsController = {
  getOperationalReports: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await reportsService.getOperationalReports();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
};
