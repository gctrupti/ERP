import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting dummy data seed...');

  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@nexora.co' } });
  if (!adminUser) {
    console.log('Admin user not found, run standard seed first.');
    return;
  }

  // 1. Categories
  const categoryNames = ["Packaging", "Stationery", "Hardware", "Consumables", "Electricals"];
  const categories = [];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(category);
  }

  // 2. Warehouses
  const warehouseNames = ["Pune Central", "Nashik Hub", "Mumbai Dock"];
  const warehouses = [];
  for (const name of warehouseNames) {
    const wh = await prisma.warehouse.upsert({
      where: { name },
      update: {},
      create: { name, location: name.split(' ')[0] },
    });
    warehouses.push(wh);
  }

  // 3. Customers
  const customersData = [
    { name: 'Acme Corp', type: 'DISTRIBUTOR', status: 'ACTIVE', businessName: 'Acme Wholesale' },
    { name: 'Global Tech', type: 'WHOLESALER', status: 'ACTIVE', businessName: 'Global Tech Solutions' },
    { name: 'Local Shop', type: 'RETAILER', status: 'ACTIVE', businessName: 'Ramesh General Store' },
    { name: 'Metro Mart', type: 'RETAILER', status: 'ACTIVE', businessName: 'Metro Mart Pvt Ltd' },
    { name: 'Future Enterprises', type: 'LEAD', status: 'PROSPECT', businessName: 'Future Inc' },
    { name: 'Nexus Logistics', type: 'DISTRIBUTOR', status: 'INACTIVE', businessName: 'Nexus' }
  ];

  const customers = [];
  for (let i = 0; i < customersData.length; i++) {
    const c = customersData[i];
    const customer = await prisma.customer.create({
      data: {
        name: c.name,
        businessName: c.businessName,
        type: c.type,
        status: c.status,
        mobile: `987654321${i}`,
        email: `contact${i}@${c.name.replace(' ', '').toLowerCase()}.com`,
        address: `123 ${c.name} street, City`,
        gstNumber: `27AABCU9603R1Z${i}`
      }
    });
    customers.push(customer);
  }

  // 4. Follow ups
  await prisma.followup.create({
    data: {
      customerId: customers[0].id,
      userId: adminUser.id,
      note: 'Discuss Q3 pricing contract',
      date: new Date()
    }
  });
  await prisma.followup.create({
    data: {
      customerId: customers[4].id,
      userId: adminUser.id,
      note: 'Send product catalog',
      date: new Date()
    }
  });

  // 5. Products
  const productsData = [
    { name: 'Heavy Duty Box', cat: 0, price: 120.0, stock: 500, minStock: 100 },
    { name: 'Bubble Wrap 50m', cat: 0, price: 350.0, stock: 80, minStock: 100 }, // Low stock
    { name: 'A4 Paper Rim', cat: 1, price: 180.0, stock: 1200, minStock: 200 },
    { name: 'Gel Pens Box', cat: 1, price: 60.0, stock: 45, minStock: 50 }, // Low stock
    { name: 'Hammer 500g', cat: 2, price: 250.0, stock: 150, minStock: 20 },
    { name: 'Wrench Set', cat: 2, price: 890.0, stock: 30, minStock: 15 },
    { name: 'Printer Ink Black', cat: 3, price: 450.0, stock: 200, minStock: 50 },
    { name: 'LED Bulb 9W', cat: 4, price: 90.0, stock: 800, minStock: 100 },
    { name: 'Extension Board', cat: 4, price: 320.0, stock: 120, minStock: 50 },
    { name: 'Cardboard Tubes', cat: 0, price: 40.0, stock: 10, minStock: 200 }, // Extremely low
  ];

  const products = [];
  let skuCounter = 1000;
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        sku: `SKU${skuCounter++}`,
        categoryId: categories[p.cat].id,
        warehouseId: warehouses[p.cat % warehouses.length].id,
        unitPrice: p.price,
        currentStock: p.stock,
        minStock: p.minStock,
      }
    });
    products.push(product);
  }

  // 6. Challans
  const challansData = [
    { cIdx: 0, status: 'Confirmed', items: [{ pIdx: 0, qty: 100 }, { pIdx: 1, qty: 10 }] },
    { cIdx: 1, status: 'Confirmed', items: [{ pIdx: 2, qty: 50 }, { pIdx: 3, qty: 5 }] },
    { cIdx: 2, status: 'Draft', items: [{ pIdx: 4, qty: 2 }] },
    { cIdx: 3, status: 'Confirmed', items: [{ pIdx: 7, qty: 200 }] },
    { cIdx: 0, status: 'Cancelled', items: [{ pIdx: 8, qty: 10 }] }
  ];

  let challanNumber = 10000;
  for (const cData of challansData) {
    let totalQty = 0;
    for (const i of cData.items) totalQty += i.qty;

    const challan = await prisma.challan.create({
      data: {
        challanNumber: `CHL-${challanNumber++}`,
        customerId: customers[cData.cIdx].id,
        status: cData.status,
        totalQuantity: totalQty,
        createdBy: adminUser.id,
      }
    });

    for (const i of cData.items) {
      const p = products[i.pIdx];
      await prisma.challanItem.create({
        data: {
          challanId: challan.id,
          productId: p.id,
          productName: p.name,
          productSku: p.sku,
          productPrice: p.unitPrice,
          quantity: i.qty,
        }
      });
    }
  }

  console.log('Dummy data seeded successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
