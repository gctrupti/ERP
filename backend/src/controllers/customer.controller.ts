import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';

export const customerController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const type = req.query.type as string;

      const result = await customerService.getAllCustomers(page, limit, search, status, type);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      res.json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.createCustomer(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.updateCustomer(req.user!.userId, req.params.id, req.body);
      res.json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await customerService.deleteCustomer(req.user!.userId, req.params.id);
      res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) { next(error); }
  },

  addFollowUp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const followup = await customerService.addFollowUp(req.user!.userId, req.params.id, req.body);
      res.status(201).json({ success: true, data: followup });
    } catch (error) { next(error); }
  }
};
