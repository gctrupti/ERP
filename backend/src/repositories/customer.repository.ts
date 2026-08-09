import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

export const customerRepository = {
  findMany: async (params: { skip?: number, take?: number, where?: Prisma.CustomerWhereInput, orderBy?: Prisma.CustomerOrderByWithRelationInput }) => {
    return prisma.customer.findMany({
      ...params,
      where: { ...params.where, isDeleted: false },
    });
  },
  count: async (where?: Prisma.CustomerWhereInput) => {
    return prisma.customer.count({ where: { ...where, isDeleted: false } });
  },
  findById: async (id: string) => {
    return prisma.customer.findFirst({
      where: { id, isDeleted: false },
      include: {
        followups: { 
          orderBy: { date: 'desc' },
          include: { user: { select: { name: true } } }
        }
      }
    });
  },
  findByEmailOrMobile: async (email?: string, mobile?: string) => {
    return prisma.customer.findFirst({
      where: {
        isDeleted: false,
        OR: [
          ...(email ? [{ email }] : []),
          ...(mobile ? [{ mobile }] : [])
        ]
      }
    });
  },
  create: async (data: Prisma.CustomerCreateInput) => {
    return prisma.customer.create({ data });
  },
  update: async (id: string, data: Prisma.CustomerUpdateInput) => {
    return prisma.customer.update({ where: { id }, data });
  },
  softDelete: async (id: string) => {
    return prisma.customer.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }
};
