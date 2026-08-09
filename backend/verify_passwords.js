const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['admin@nexora.co', 'sales@nexora.co', 'warehouse@nexora.co', 'accounts@nexora.co'] } }
  });
  
  for (const user of users) {
    const isValid = await bcrypt.compare('DEMO1234', user.password);
    console.log(`${user.email}: DEMO1234 is ${isValid ? 'valid' : 'INVALID'}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
