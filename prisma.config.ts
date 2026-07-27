import "dotenv/config";
import { defineConfig } from "prisma/config";

const getUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  if (process.env.POSTGRES_HOST) {
    const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT = '5432', POSTGRES_DB } = process.env;
    console.log('URL', `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`);
    return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;
  }
  return undefined;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/seed.ts",
  },
  datasource: {
    url: getUrl() || "",
  },
});
