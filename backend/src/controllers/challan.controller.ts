import { Request, Response, NextFunction } from 'express';
import { challanService } from '../services/challan.service';
import PDFDocument from 'pdfkit';

export const challanController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const result = await challanService.getAll(page, limit, search, status);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challan = await challanService.getById(req.params.id);
      res.json({ success: true, data: challan });
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challan = await challanService.createDraft(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: challan });
    } catch (error) { next(error); }
  },

  confirm: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challan = await challanService.confirmChallan(req.user!.userId, req.params.id);
      res.json({ success: true, data: challan });
    } catch (error) { next(error); }
  },

  cancel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challan = await challanService.cancelChallan(req.user!.userId, req.params.id);
      res.json({ success: true, data: challan });
    } catch (error) { next(error); }
  },

  exportPdf: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challan = await challanService.getById(req.params.id);
      
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Challan-${challan.challanNo}.pdf`);
      
      doc.pipe(res);

      // Header
      doc.fontSize(20).text('Nexora ERP', { align: 'center' });
      doc.fontSize(12).text('Sales Challan / Invoice', { align: 'center' });
      doc.moveDown();

      // Challan Info
      doc.fontSize(10).text(`Challan No: ${challan.challanNo}`);
      doc.text(`Date: ${new Date(challan.createdAt).toLocaleDateString()}`);
      doc.text(`Status: ${challan.status}`);
      doc.text(`Created By: ${challan.createdBy}`);
      doc.moveDown();

      // Customer Info
      doc.text(`Customer: ${challan.customerName}`);
      doc.moveDown();

      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('SKU', 50, tableTop);
      doc.text('Product Name', 150, tableTop);
      doc.text('Qty', 350, tableTop);
      doc.text('Unit Price', 400, tableTop);
      doc.text('Total', 480, tableTop);
      
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.font('Helvetica');
      
      let y = doc.y + 15;
      
      // Items
      challan.items.forEach(item => {
        doc.text(item.sku, 50, y);
        doc.text(item.productName, 150, y);
        doc.text(item.quantity.toString(), 350, y);
        doc.text('$' + item.unitPrice.toFixed(2), 400, y);
        doc.text('$' + (item.quantity * item.unitPrice).toFixed(2), 480, y);
        y += 20;
      });
      
      doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
      y += 15;

      // Totals
      doc.font('Helvetica-Bold');
      doc.text('Total Quantity:', 350, y);
      doc.text(challan.totalQuantity.toString(), 480, y);
      y += 20;
      doc.text('Total Value:', 350, y);
      doc.text('$' + challan.totalValue.toFixed(2), 480, y);
      
      doc.end();
    } catch (error) { next(error); }
  }
};
