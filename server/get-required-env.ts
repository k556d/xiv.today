export function getRequiredEnv(name: Extract<keyof NodeJS.ProcessEnv, string>) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
