import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { getDatabaseConfig } from "../src/lib/auth/database";

const adapter = new PrismaPg(getDatabaseConfig());

const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    console.log("ADMIN_EXISTS");
    return;
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_BOOTSTRAP_EMAIL y ADMIN_BOOTSTRAP_PASSWORD son obligatorios si no existe ADMIN.");
    process.exitCode = 2;
    return;
  }
  if (password.length < 12) {
    console.error("ADMIN_BOOTSTRAP_PASSWORD debe tener al menos 12 caracteres.");
    process.exitCode = 3;
    return;
  }

  const userId = randomUUID();
  const hashedPassword = await hashPassword(password);
  await prisma.user.create({
    data: {
      id: userId,
      name: "Administrador",
      email,
      emailVerified: true,
      role: "ADMIN",
      accounts: {
        create: {
          id: randomUUID(),
          accountId: userId,
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });
  console.log("ADMIN_CREATED");
}

main()
  .catch((error) => {
    console.error("BOOTSTRAP_ADMIN_FAILED", error instanceof Error ? error.message : "unknown");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
