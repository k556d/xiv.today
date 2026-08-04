import { type Duration } from "date-fns";
import { z } from "zod";
import { defineCookie } from "@xiv-today/next-request";
import { signJwt, verifyJwt } from "@/server/jwt";

export function defineJwtCookie<Schema extends z.ZodType>({ schema, ...options }: {
  name: string;
  duration: Duration;
  schema: Schema;
}) {
  return defineCookie({
    ...options,
    schema,
    deserialize: async (token) => (await verifyJwt(token)).value,
    serialize: async (value, expires) => signJwt({ value }, expires),
  });
}
