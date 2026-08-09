const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const challans = await prisma.challan.findMany();
  console.log(challans.map(c => ({ no: c.challanNumber, status: c.status })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
