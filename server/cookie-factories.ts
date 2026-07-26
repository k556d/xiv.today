import { add, type Duration } from "date-fns";
import { z } from "zod";
import { signJwt, verifyJwt } from "@/server/jwt";

export type CookieOptions = {
  domain?: string;
  httpOnly?: boolean;
  partitioned?: boolean;
  path?: string;
  priority?: "low" | "medium" | "high";
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

export type CookieDefinition<Schema extends z.ZodType = z.ZodType> = {
  name: string;
  schema: Schema;
  duration?: Duration;
  options: CookieOptions;
  deserialize(value: string): unknown | Promise<unknown>;
  serialize(value: z.output<Schema>, expires: Date | undefined): string | Promise<string>;
};

export function defineCookie<Schema extends z.ZodType>({
  options,
  ...definition
}: Omit<CookieDefinition<Schema>, "options"> & { options?: CookieOptions }): CookieDefinition<Schema> {
  return {
    ...definition,
    options: {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      ...options,
    },
  };
}

export async function deserializeCookie<Schema extends z.ZodType>(
  definition: CookieDefinition<Schema>,
  value: string,
): Promise<z.output<Schema>> {
  return definition.schema.parseAsync(await definition.deserialize(value));
}

export async function serializeCookie<Schema extends z.ZodType>(
  definition: CookieDefinition<Schema>,
  value: z.output<Schema>,
) {
  const expires = definition.duration && add(new Date(), definition.duration);

  return {
    ...definition.options,
    name: definition.name,
    value: await definition.serialize(value, expires),
    expires,
  };
}

export function clearCookie(definition: CookieDefinition) {
  return {
    ...definition.options,
    name: definition.name,
    value: "",
    expires: new Date(0),
  };
}

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
