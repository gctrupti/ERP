import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const reportsService = {
  getOperationalReports: async () => {
    // 1. Inventory Summary by Warehouse
    const warehouses = await prisma.warehouse.findMany({
      include: { products: { where: { isDeleted: false } } }
    });

    const inventory = warehouses.map(w => {
      let units = 0;
      let value = 0;
      let lowStock = 0;
      
      w.products.forEach(p => {
        units += p.currentStock;
        value += (p.currentStock * p.unitPrice);
        if (p.currentStock <= p.minStock) lowStock++;
      });

      return {
        warehouse: w.name,
        products: w.products.length,
        units,
        value,
        lowStock
      };
    });

    // 2. Customer Summary by Segment
    const customers = await prisma.customer.findMany({ where: { isDeleted: false } });
    
    // Group by type
    const customerSegments: Record<string, { count: number, active: number }> = {};
    customers.forEach(c => {
      const type = c.type || 'Unknown';
      if (!customerSegments[type]) {
        customerSegments[type] = { count: 0, active: 0 };
      }
      customerSegments[type].count++;
      if (c.status.toLowerCase() === 'active') {
        customerSegments[type].active++;
      }
    });

    const formattedCustomers = Object.entries(customerSegments).map(([type, stats]) => ({
      type,
      count: stats.count,
      active: stats.active
    }));

    // 3. Sales Summary by Challan Status
    const challans = await prisma.challan.findMany({
      include: { items: true }
    });

    const salesStatus: Record<string, { count: number, quantity: number, value: number }> = {};
    challans.forEach(c => {
      const status = c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase(); // Normalize
      if (!salesStatus[status]) {
        salesStatus[status] = { count: 0, quantity: 0, value: 0 };
      }
      
      salesStatus[status].count++;
      salesStatus[status].quantity += c.totalQuantity;
      
      const value = c.items.reduce((sum, item) => sum + (item.quantity * item.productPrice), 0);
      salesStatus[status].value += value;
    });

    const sales = Object.entries(salesStatus).map(([status, stats]) => ({
      status,
      count: stats.count,
      quantity: stats.quantity,
      value: stats.value
    }));

    return {
      inventory,
      customers: formattedCustomers,
      sales
    };
  }
};
