import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.idSequence.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, value: 0 },
  });
  console.log("IdSequence inicializado (value=0)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
