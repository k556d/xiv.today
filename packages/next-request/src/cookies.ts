import { add } from "date-fns";
import { cookies as getRequestCookies } from "next/headers";
import { type z } from "zod";
import type * as types from "./typings";

export function defineCookie<Schema extends z.ZodType>({
  options,
  ...definition
}: types.CookieDefinition<Schema>): types.Cookie<z.output<Schema>> {
  const cookieOptions: types.CookieOptions = {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...options,
  };

  return {
    name: definition.name,
    async get(store) {
      const value = store.get(definition.name)?.value;

      if (value === undefined) {
        return undefined;
      }

      return definition.schema.parseAsync(await definition.deserialize(value));
    },
    async set(store, value) {
      const expires = definition.duration && add(new Date(), definition.duration);
      store.set({
        ...cookieOptions,
        name: definition.name,
        value: await definition.serialize(value, expires),
        expires,
      });
    },
    clear(store) {
      store.set({
        ...cookieOptions,
        name: definition.name,
        value: "",
        expires: new Date(0),
      });
    },
  };
}

export async function createRequestCookies<Bindings extends types.CookieBindings | undefined>(bindings: Bindings) {
  const cookieStore = await getRequestCookies();
  const entries = Object.entries(bindings ?? {}) as [string, types.CookieBinding][];
  const mutations = new Map<object, types.CookieMutation>();
  const cookies: Record<string, unknown> = {};

  for (const [name, binding] of entries) {
    let value: unknown;

    if (binding.access !== "write") {
      value = await binding.cookie.get(cookieStore);
      if (value === undefined && !binding.optional) {
        return undefined;
      }
    }

    cookies[name] = {
      ...(binding.access !== "write" ? { value } : {}),
      ...(binding.access !== "read" ? {
        set: (nextValue: unknown) => {
          mutations.set(binding.cookie, {
            type: "set",
            cookie: binding.cookie,
            value: nextValue,
          });
        },
        clear: () => {
          mutations.set(binding.cookie, {
            type: "clear",
            cookie: binding.cookie,
          });
        },
      } : {}),
    };
  }

  return {
    cookies: cookies as types.CookieHandles<Bindings>,
    async commit() {
      for (const mutation of mutations.values()) {
        if (mutation.type === "set") {
          await mutation.cookie.set(cookieStore, mutation.value);
        } else {
          mutation.cookie.clear(cookieStore);
        }
      }
    },
  };
}
