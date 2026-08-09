// @ts-nocheck
import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { userRepository } from '../repositories/user.repository';

const prisma = new PrismaClient();

export const challanService = {
  getAll: async (page: number = 1, limit: number = 10, search?: string, status?: string) => {
    const skip = (page - 1) * limit;
    const conditions: Prisma.ChallanWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { challanNumber: { contains: search } },
          { customer: { name: { contains: search } } }
        ]
      });
    }

    if (status && status.toLowerCase() !== 'all') {
      conditions.push({
        OR: [
          { status: status },
          { status: status.toUpperCase() },
          { status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() }
        ]
      });
    }

    const where: Prisma.ChallanWhereInput = conditions.length > 0 ? { AND: conditions } : {};
    const [data, total] = await Promise.all([
      prisma.challan.findMany({ skip, take: limit, where, include: { customer: true, items: true }, orderBy: { createdAt: 'desc' } }),
      prisma.challan.count({ where })
    ]);
    const mappedData = data.map(c => ({
      id: c.id,
      challanNo: c.challanNumber,
      customerId: c.customerId,
      customerName: c.customer.name,
      status: c.status.toUpperCase(),
      items: c.items,
      totalQuantity: c.totalQuantity,
      totalValue: c.items.reduce((sum, item) => sum + (item.quantity * item.productPrice), 0),
      createdBy: c.createdBy,
      createdAt: c.createdAt.toISOString(),
      notes: ''
    }));
    return { data: mappedData, total, page, totalPages: Math.ceil(total / limit) };
  },

  getById: async (id: string) => {
    const challan = await prisma.challan.findUnique({ where: { id }, include: { customer: true, items: true } });
    if (!challan) throw new AppError('Challan not found', 404);

    let createdByName = challan.createdBy;
    const user = await prisma.user.findUnique({ where: { id: challan.createdBy } });
    if (user) {
      // Create a nice label like "Trupti G C (Administrator)"
      createdByName = `${user.name} (${user.role === 'Admin' ? 'Administrator' : user.role})`;
    }

    return {
      id: challan.id,
      challanNo: challan.challanNumber,
      customerId: challan.customerId,
      customerName: challan.customer.name,
      status: challan.status.toUpperCase(),
      items: challan.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.productSku,
        unitPrice: item.productPrice,
        quantity: item.quantity
      })),
      totalQuantity: challan.totalQuantity,
      totalValue: challan.items.reduce((sum, item) => sum + (item.quantity * item.productPrice), 0),
      createdBy: createdByName,
      createdAt: challan.createdAt.toISOString(),
      notes: challan.notes || ''
    };
  },

  createDraft: async (userId: string, data: { customerId: string, items: { productId: string, quantity: number }[] }) => {
    // Generate Challan Number
    const count = await prisma.challan.count();
    const challanNumber = `CHL-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(count+1).padStart(4, '0')}`;
    
    let totalQuantity = 0;
    const challanItems = [];

    // Fetch product snapshots
    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
      
      challanItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productPrice: product.unitPrice,
        quantity: item.quantity
      });
      totalQuantity += item.quantity;
    }

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        status: 'Draft',
        totalQuantity,
        createdBy: userId,
        items: {
          create: challanItems
        }
      },
      include: { items: true }
    });

    await userRepository.logActivity(userId, 'CREATE_CHALLAN', `Created draft challan ${challanNumber}`);
    return challan;
  },

  confirmChallan: async (userId: string, challanId: string) => {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({ 
        where: { id: challanId }, 
        include: { items: true } 
      });

      if (!challan) throw new AppError('Challan not found', 404);
      if (challan.status !== 'Draft') throw new AppError('Only Draft challans can be confirmed', 400);

      // Validate inventory and deduct
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.currentStock < item.quantity) {
          throw new AppError(`Insufficient stock for ${item.productName}`, 400);
        }

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: product.currentStock - item.quantity }
        });

        // Log movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: 'OUT',
            reason: `Challan Confirmed - ${challan.challanNumber}`,
            createdBy: userId
          }
        });
      }

      // Update status
      const updatedChallan = await tx.challan.update({
        where: { id: challanId },
        data: { status: 'Confirmed' }
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          entity: 'Challan',
          entityId: challanId,
          action: 'CONFIRM',
          details: JSON.stringify({ challanNumber: challan.challanNumber, items: challan.items }),
          userId: userId
        }
      });

      return updatedChallan;
    });
  },
  
  cancelChallan: async (userId: string, challanId: string) => {
    const challan = await prisma.challan.findUnique({ where: { id: challanId } });
    if (!challan) throw new AppError('Challan not found', 404);
    if (challan.status !== 'Draft') throw new AppError('Only Draft challans can be cancelled', 400);

    const cancelled = await prisma.challan.update({
      where: { id: challanId },
      data: { status: 'Cancelled' }
    });

    await userRepository.logActivity(userId, 'CANCEL_CHALLAN', `Cancelled challan ${challan.challanNumber}`);
    return cancelled;
  }
};
