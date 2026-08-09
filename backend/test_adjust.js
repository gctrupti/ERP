const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdjust() {
  try {
    const product = await prisma.product.findFirst({ where: { isDeleted: false } });
    if (!product) return console.log('No products');

    const user = await prisma.user.findFirst();

    console.log('Testing adjust stock transaction...');
    const result = await prisma.$transaction(async (tx) => {
      let newStock = product.currentStock + 1;
      
      const updated = await tx.product.update({
        where: { id: product.id },
        data: { currentStock: newStock }
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: 1,
          type: 'IN',
          reason: 'Purchase received',
          createdBy: 'Test User'
        }
      });

      // Simulating logActivity
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'INVENTORY_ADJUST',
          details: 'Adjusted stock',
          entity: 'User',
          entityId: user.id
        }
      });

      return { updated, movement };
    });
    console.log('Success:', result.movement.id);
  } catch (err) {
    console.error('Error during transaction:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testAdjust();
