const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateMovements() {
  const products = await prisma.product.findMany({ where: { isDeleted: false } });
  if (products.length === 0) return console.log('No products found.');

  const users = await prisma.user.findMany({ include: { role: true } });
  if (users.length === 0) return console.log('No users found.');

  const admin = users.find(u => u.role.name === 'ADMIN') || users[0];
  const sales = users.find(u => u.role.name === 'SALES') || users[0];
  const warehouse = users.find(u => u.role.name === 'WAREHOUSE') || users[0];

  const movements = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const isOut = Math.random() > 0.3; // 70% chance of stock out
    
    const quantity = isOut ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 300) + 50;
    const type = isOut ? 'OUT' : 'IN';
    const reason = isOut ? 'Sales challan' : 'Purchase received';
    
    // CreatedBy is stored as a string in the DB (e.g. "John Doe (Sales Executive)")
    let createdByStr = '';
    if (isOut) createdByStr = `${sales.name} (Sales Executive)`;
    else createdByStr = `${warehouse.name} (Warehouse Lead)`;

    const date = new Date(now);
    date.setHours(date.getHours() - Math.floor(Math.random() * 72)); // Spread over last 3 days

    movements.push({
      productId: product.id,
      quantity,
      type,
      reason,
      createdBy: createdByStr,
      createdAt: date
    });
  }

  // Sort by date ascending so it looks like a ledger
  movements.sort((a, b) => a.createdAt - b.createdAt);

  await prisma.stockMovement.createMany({ data: movements });
  console.log(`Successfully generated ${movements.length} dummy stock movements!`);
  
  await prisma.$disconnect();
}

generateMovements().catch(console.error);
