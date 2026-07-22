import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_T9reP8QGKBjO@ep-gentle-heart-atmgvqsf.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@etusl.com" },
    update: {},
    create: {
      email: "admin@etusl.com",
      password: hashedPassword,
      name: "System Administrator",
      role: "admin",
    },
  });

  console.log("Default admin user created:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
