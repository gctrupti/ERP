import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = ['Admin', 'Sales', 'Warehouse', 'Accounts'];
  const roleMap: Record<string, string> = {};

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleMap[roleName] = role.id;
  }

  const defaultPassword = process.env.DEFAULT_PASSWORD || 'DEMO1234';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  const users = [
    { email: 'admin@nexora.co', name: 'Administrator', role: 'Admin' },
    { email: 'sales@nexora.co', name: 'Sales Executive', role: 'Sales' },
    { email: 'warehouse@nexora.co', name: 'Warehouse Lead', role: 'Warehouse' },
    { email: 'accounts@nexora.co', name: 'Accounts', role: 'Accounts' }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        roleId: roleMap[u.role],
        requiresPasswordChange: true
      }
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
