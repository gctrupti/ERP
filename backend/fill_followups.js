const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fillFollowUpDates() {
  const customers = await prisma.customer.findMany({
    where: { followUpDate: null }
  });

  console.log(`Found ${customers.length} customers with empty followUpDate. Filling...`);

  let days = 1;
  for (const customer of customers) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + days);
    
    await prisma.customer.update({
      where: { id: customer.id },
      data: { followUpDate: nextWeek }
    });
    days += 2; // stagger the dates
  }

  console.log('Successfully filled empty follow-up dates!');
  await prisma.$disconnect();
}

fillFollowUpDates().catch(console.error);
