import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('test1234!', 12);

  await prisma.user.upsert({
    where: { email: 'test@beesvat.com' },
    update: {},
    create: {
      email: 'test@beesvat.com',
      passwordHash: hashedPassword,
      nickname: '테스트 사용자',
      role: 'user',
    },
  });

  console.error('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
