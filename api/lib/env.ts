import "dotenv/config";

// Log limited SMTP/env diagnostics immediately after dotenv loads
console.log({
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
  SMTP_PASS_LENGTH: process.env.SMTP_PASS?.length,
  NODE_ENV: process.env.NODE_ENV,
  ENV_FILE_LOADED: true,
});

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
  investorJwtSecret: process.env.INVESTOR_JWT_SECRET ?? "",
};
