import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { userRepository } from '../repositories/user.repository';

const prisma = new PrismaClient();

export const inventoryService = {
  getMovements: async (page: number, limit: number, search?: string, type?: string) => {
    const skip = (page - 1) * limit;
    
    const conditions: any[] = [];
    if (search) {
      conditions.push({
        OR: [
          { product: { name: { contains: search } } },
          { reason: { contains: search } },
          { createdBy: { contains: search } }
        ]
      });
    }
    if (type && type.toLowerCase() !== 'all') {
      conditions.push({ type: type.toUpperCase() });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({ skip, take: limit, where, include: { product: true }, orderBy: { createdAt: 'desc' } }),
      prisma.stockMovement.count({ where })
    ]);

    const mappedData = data.map(m => ({
      id: m.id,
      productId: m.productId,
      productName: m.product.name,
      sku: m.product.sku,
      quantity: m.quantity,
      type: m.type,
      reason: m.reason,
      createdBy: m.createdBy,
      createdAt: m.createdAt.toISOString()
    }));

    return { data: mappedData, total, page, totalPages: Math.ceil(total / limit) };
  },

  adjustStock: async (userId: string, data: { productId: string, quantity: number, type: 'IN' | 'OUT', reason: string, createdBy: string }) => {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product || product.isDeleted) throw new AppError('Product not found', 404);

      let newStock = product.currentStock;
      const quantity = Number(data.quantity);
      if (data.type === 'IN') newStock += quantity;
      else if (data.type === 'OUT') newStock -= quantity;

      if (newStock < 0) throw new AppError('Stock cannot be negative', 400);

      const updated = await tx.product.update({
        where: { id: data.productId },
        data: { currentStock: newStock }
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          quantity: Number(data.quantity),
          type: data.type,
          reason: data.reason,
          createdBy: data.createdBy || userId
        }
      });
      return { product: updated, movement, logDetails: `Adjusted stock for ${product.sku} by ${data.type} ${data.quantity}` };
    });

    await userRepository.logActivity(userId, 'INVENTORY_ADJUST', result.logDetails);
    return { product: result.product, movement: result.movement };
  }
};
