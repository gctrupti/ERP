// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';

export const productController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const warehouse = req.query.warehouse as string;
      const stock = req.query.stock as string;

      const result = await productService.getAll(page, limit, search, category, warehouse, stock);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.getById(req.params.id);
      res.json({ success: true, data: product });
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.create(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.update(req.user!.userId, req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await productService.softDelete(req.user!.userId, req.params.id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) { next(error); }
  }
};
