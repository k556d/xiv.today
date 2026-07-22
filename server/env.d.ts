declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    DATABASE_URL: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    SMTP_FROM: string;
    SMTP_HOST: string;
    SMTP_PASSWORD: string;
    SMTP_PORT: string;
    SMTP_SECURE: string;
    SMTP_USERNAME: string;
    VERCEL_URL: string;
  }
}
