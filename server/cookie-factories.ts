import { add, type Duration } from "date-fns";
import { type NextRequest, type NextResponse } from "next/server";
import { z } from "zod";
import { signJwt, verifyJwt } from "@/server/jwt";

function createCookie<Schema extends z.ZodType>(schema: Schema, {
  name,
  duration,
  deserialize,
  serialize,
}: {
  name: string;
  duration?: Duration;
  deserialize: (value: string) => unknown | Promise<unknown>;
  serialize: (value: z.output<Schema>, expires: Date | undefined) => string | Promise<string>;
}) {
  return {
    name,
    async set(cookieStore: Pick<NextResponse["cookies"], "set">, value: z.output<Schema>) {
      const expires = duration && add(new Date(), duration);
      cookieStore.set({
        name,
        value: await serialize(value, expires),
        expires,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    },
    async get<AllowMissing extends boolean = false>(
      cookieStore: Pick<NextRequest["cookies"], "get">,
      { allowMissing }: { allowMissing?: AllowMissing } = {},
    ): Promise<AllowMissing extends true ? z.output<Schema> | undefined : z.output<Schema>> {
      const value = cookieStore.get(name)?.value;

      if (value === undefined) {
        if (allowMissing) {
          return undefined as AllowMissing extends true ? z.output<Schema> | undefined : z.output<Schema>;
        }

        throw new Error(`Missing ${name} cookie.`);
      }

      try {
        const parsed = schema.safeParse(await deserialize(value));

        if (parsed.success) {
          return parsed.data as AllowMissing extends true ? z.output<Schema> | undefined : z.output<Schema>;
        }
      } catch {
        throw new Error(`Invalid ${name} cookie.`);
      }

      throw new Error(`Invalid ${name} cookie.`);
    },
    clear(cookieStore: Pick<NextResponse["cookies"], "set">) {
      cookieStore.set({
        name,
        value: "",
        expires: new Date(0),
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    },
  };
}

export function defineJwtCookie<Schema extends z.ZodType>({ schema, ...options }: {
  name: string;
  duration: Duration;
  schema: Schema;
}) {
  return createCookie(schema, {
    ...options,
    deserialize: async (token) => (await verifyJwt(token)).value,
    serialize: async (value, expires) => {
      return signJwt({ value }, expires);
    },
  });
}
