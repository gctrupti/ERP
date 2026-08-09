import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { userRepository } from '../repositories/user.repository';

const prisma = new PrismaClient();

export const productService = {
  getAll: async (page: number, limit: number, search?: string, category?: string, warehouse?: string, stock?: string) => {
    const skip = (page - 1) * limit;
    
    const conditions: Prisma.ProductWhereInput[] = [];
    conditions.push({ isDeleted: false });

    if (category && category.toLowerCase() !== 'all') {
      conditions.push({ category: { name: category } });
    }

    if (warehouse && warehouse.toLowerCase() !== 'all') {
      conditions.push({ warehouse: { name: warehouse } });
    }

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } }
        ]
      });
    }

    const where: Prisma.ProductWhereInput = { AND: conditions };

    let data = await prisma.product.findMany({
      where,
      include: { category: true, warehouse: true },
      orderBy: { createdAt: 'desc' }
    });

    if (stock && stock === 'LOW') {
      data = data.filter(p => p.currentStock <= p.minStock);
    }

    const total = data.length;
    const paginatedData = data.slice(skip, skip + limit);

    const mappedData = paginatedData.map(p => ({
      ...p,
      category: p.category.name,
      warehouse: p.warehouse.name,
      minimumStock: p.minStock
    }));

    return { data: mappedData, total, page, totalPages: Math.ceil(total / limit) };
  },

  getById: async (id: string) => {
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: { category: true, warehouse: true }
    });
    if (!product) throw new AppError('Product not found', 404);
    
    return {
      ...product,
      category: product.category.name,
      warehouse: product.warehouse.name,
      minimumStock: product.minStock
    };
  },

  create: async (userId: string, frontendData: any) => {
    const existing = await prisma.product.findUnique({ where: { sku: frontendData.sku } });
    if (existing && !existing.isDeleted) throw new AppError('Product SKU must be unique', 400);

    const category = await prisma.category.upsert({
      where: { name: frontendData.category },
      update: {},
      create: { name: frontendData.category }
    });

    const warehouse = await prisma.warehouse.upsert({
      where: { name: frontendData.warehouse },
      update: {},
      create: { name: frontendData.warehouse }
    });

    const product = await prisma.product.create({
      data: {
        name: frontendData.name,
        sku: frontendData.sku,
        unitPrice: Number(frontendData.unitPrice),
        minStock: Number(frontendData.minimumStock),
        currentStock: Number(frontendData.currentStock || 0),
        category: { connect: { id: category.id } },
        warehouse: { connect: { id: warehouse.id } }
      }
    });

    await userRepository.logActivity(userId, 'CREATE_PRODUCT', `Created product ${product.sku}`);
    return product;
  },

  update: async (userId: string, id: string, frontendData: any) => {
    const existing = await prisma.product.findFirst({ where: { id, isDeleted: false } });
    if (!existing) throw new AppError('Product not found', 404);

    if (frontendData.sku && frontendData.sku !== existing.sku) {
      const duplicate = await prisma.product.findUnique({ where: { sku: frontendData.sku } });
      if (duplicate && !duplicate.isDeleted) throw new AppError('Product SKU must be unique', 400);
    }

    const category = await prisma.category.upsert({
      where: { name: frontendData.category },
      update: {},
      create: { name: frontendData.category }
    });

    const warehouse = await prisma.warehouse.upsert({
      where: { name: frontendData.warehouse },
      update: {},
      create: { name: frontendData.warehouse }
    });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: frontendData.name,
        sku: frontendData.sku,
        unitPrice: Number(frontendData.unitPrice),
        minStock: Number(frontendData.minimumStock),
        currentStock: Number(frontendData.currentStock || 0),
        category: { connect: { id: category.id } },
        warehouse: { connect: { id: warehouse.id } }
      }
    });

    await userRepository.logActivity(userId, 'UPDATE_PRODUCT', `Updated product ${id}`);
    return updated;
  },

  softDelete: async (userId: string, id: string) => {
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    await userRepository.logActivity(userId, 'DELETE_PRODUCT', `Soft deleted product ${id}`);
  }
};
