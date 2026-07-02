import dotenv from "dotenv";
dotenv.config();

import { prisma } from "./src/lib/db";

async function main() {
  const templates = await prisma.template.findMany({});
  console.log("Current templates in DB:");
  console.log(JSON.stringify(templates, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
