import type { PoolConfig } from "pg";

export function getDatabaseConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/adr";
  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  return {
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  };
}
