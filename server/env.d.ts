declare namespace NodeJS {
  interface ProcessEnv {
    AUTH_SECRET: string;
    DATABASE_URL: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
  }
}
