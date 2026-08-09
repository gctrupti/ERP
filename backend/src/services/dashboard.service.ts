import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dashboardService = {
  getKPIs: async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      challanGroups,
      todaysFollowups,
      lowStockProducts,
      inventoryValueRaw,
      recentChallans,
      lowStockItems,
      categoryGroups,
      recentConfirmedChallans
    ] = await Promise.all([
      prisma.customer.count({ where: { isDeleted: false } }),
      prisma.customer.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.challan.groupBy({ by: ['status'], _count: true }),
      prisma.followup.findMany({ 
        where: { date: { gte: startOfToday, lte: endOfToday } },
        include: { user: { select: { name: true } } },
        take: 5
      }),
      prisma.product.count({
        where: { isDeleted: false, currentStock: { lte: prisma.product.fields.minStock } } // Note: prisma fields filter support varies, may need raw or map
      }),
      prisma.$queryRaw<[{ totalValue: number }]>
        `SELECT SUM("currentStock" * "unitPrice") as "totalValue" FROM "Product" WHERE "isDeleted" = false`,
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } }, items: true }
      }),
      prisma.product.findMany({
        where: { isDeleted: false, currentStock: { lte: prisma.product.fields.minStock } },
        take: 5
      }),
      prisma.product.groupBy({
        by: ['categoryId'],
        _count: true,
        where: { isDeleted: false }
      }),
      prisma.challan.findMany({
        where: { status: 'Confirmed' },
        orderBy: { createdAt: 'desc' },
        take: 7,
        select: { createdAt: true, totalQuantity: true }
      })
    ]);

    const challanStats = { Total: 0, Draft: 0, Confirmed: 0, Cancelled: 0 };
    challanGroups.forEach(g => {
      challanStats.Total += g._count;
      if (g.status === 'Draft') challanStats.Draft = g._count;
      if (g.status === 'Confirmed') challanStats.Confirmed = g._count;
      if (g.status === 'Cancelled') challanStats.Cancelled = g._count;
    });

    const categoryNames = await prisma.category.findMany({
      where: { id: { in: categoryGroups.map(g => g.categoryId) } },
      select: { id: true, name: true }
    });

    const categoryMix = categoryGroups.map(g => ({
      category: categoryNames.find(c => c.id === g.categoryId)?.name || 'Unknown',
      units: g._count
    }));

    const salesTrend = recentConfirmedChallans.map(c => ({
      label: c.createdAt.toISOString().split('T')[0],
      challans: c.totalQuantity
    })).reverse();

    return {
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts,
      todaysFollowups: todaysFollowups.map(f => ({
        id: f.id,
        customerId: f.customerId,
        date: f.date.toISOString(),
        note: f.note,
        createdBy: f.user?.name || 'System',
        outcome: 'PENDING'
      })),
      inventoryValue: inventoryValueRaw[0]?.totalValue || 0,
      challans: challanStats,
      recentChallans: recentChallans.map(c => ({
        id: c.id,
        challanNo: c.challanNumber,
        customerName: c.customer.name,
        totalQuantity: c.totalQuantity,
        totalValue: c.items.reduce((sum, item) => sum + (item.quantity * item.productPrice), 0),
        status: c.status,
        createdAt: c.createdAt
      })),
      lowStockItems,
      categoryMix,
      salesTrend
    };
  }
};
