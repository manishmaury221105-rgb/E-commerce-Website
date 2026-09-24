import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

function getResolvedDatabaseUrl(): string {
  // If a custom remote DATABASE_URL is explicitly set (e.g. Postgres, Neon, PlanetScale, Supabase)
  if (
    process.env.DATABASE_URL &&
    process.env.DATABASE_URL.trim() !== "" &&
    !process.env.DATABASE_URL.includes("dev.db")
  ) {
    return process.env.DATABASE_URL;
  }

  // Handle Vercel / AWS Lambda Serverless Environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    
    try {
      const isTmpValid = fs.existsSync(tmpDbPath) && fs.statSync(tmpDbPath).size > 1000;
      
      if (!isTmpValid) {
        const potentialSources = [
          path.join(process.cwd(), "prisma", "dev.db"),
          path.join(process.cwd(), "dev.db"),
          path.join("/var", "task", "prisma", "dev.db"),
          path.join("/var", "task", "dev.db"),
          path.join(__dirname, "prisma", "dev.db"),
          path.join(__dirname, "..", "prisma", "dev.db"),
          path.resolve("./prisma/dev.db"),
        ];

        let copied = false;
        for (const source of potentialSources) {
          if (fs.existsSync(source) && fs.statSync(source).size > 1000) {
            fs.copyFileSync(source, tmpDbPath);
            copied = true;
            break;
          }
        }

        if (!copied && !fs.existsSync(tmpDbPath)) {
          fs.writeFileSync(tmpDbPath, "");
        }
      }
      return `file:${tmpDbPath}`;
    } catch (err) {
      console.warn("Could not copy database to /tmp:", err);
      return `file:${tmpDbPath}`;
    }
  }

  // Local development fallback
  return process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
    ? process.env.DATABASE_URL
    : "file:./dev.db";
}

const resolvedDbUrl = getResolvedDatabaseUrl();
process.env.DATABASE_URL = resolvedDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

