import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineCookie } from "./cookies";
import {
  executeRequest,
  normalizeEntries,
} from "./request";

describe("normalizeEntries", () => {
  const schema = z.object({
    name: z.string(),
    tags: z.array(z.string()),
  });

  it("normalizes schema array fields for every cardinality", () => {
    expect(normalizeEntries(schema, [["name", "test"]])).toEqual({
      name: "test",
      tags: [],
    });
    expect(normalizeEntries(schema, [
      ["name", "test"],
      ["tags", "one"],
    ])).toEqual({ name: "test", tags: ["one"] });
    expect(normalizeEntries(schema, [
      ["name", "test"],
      ["tags", "one"],
      ["tags", "two"],
    ])).toEqual({ name: "test", tags: ["one", "two"] });
  });

  it("recognizes wrapped array input schemas", () => {
    const wrappedSchema = z.object({
      optional: z.array(z.string()).optional(),
      transformed: z.array(z.string()).transform((values) => values.length),
    });

    expect(normalizeEntries(wrappedSchema, [])).toEqual({
      optional: [],
      transformed: [],
    });
  });

  it("rejects duplicate scalar fields", () => {
    expect(() => normalizeEntries(schema, [
      ["name", "one"],
      ["name", "two"],
    ])).toThrow("provided more than once");
  });

  it("rejects file fields", () => {
    const data = new FormData();
    data.append("name", new Blob(["file"]), "file.txt");

    expect(() => normalizeEntries(schema, data.entries())).toThrow("File uploads are not accepted");
  });

  it("rejects fields that accept both scalar and array input", () => {
    const ambiguousSchema = z.object({
      value: z.union([z.string(), z.array(z.string())]),
    });

    expect(() => normalizeEntries(ambiguousSchema, [])).toThrow("both scalar and array");
  });
});

describe("executeRequest", () => {
  const sessionCookie = defineCookie({
    name: "session",
    schema: z.object({ userId: z.string() }),
    deserialize: (value) => JSON.parse(value),
    serialize: (value) => JSON.stringify(value),
  });

  it("provides parsed inputs and resolves a callback response", async () => {
    const definition = {
      body: z.object({ name: z.string() }),
      cookies: {
        session: { cookie: sessionCookie, access: "read" },
      },
      response: (message: string) => ({ message }),
    } as const;
    const result = await executeRequest(definition, ({ body, cookies, respond }) => {
      return respond(`${body.name}:${cookies.session.value.userId}`);
    }, {
      body: { name: "character" },
      cookies: { session: JSON.stringify({ userId: "user" }) },
    });

    expect(result).toMatchObject({
      type: "response",
      response: { message: "character:user" },
    });
  });

  it("always provides empty body and query objects", async () => {
    const result = await executeRequest({}, ({ body, query, respond }) => {
      expect(body).toEqual({});
      expect(query).toEqual({});
      return respond();
    }, { cookies: {} });

    expect(result).toMatchObject({ type: "response", response: undefined });
  });

  it("allows implicit completion when enabled without a response definition", async () => {
    const result = await executeRequest({}, async ({ body, query }) => {
      expect(body).toEqual({});
      expect(query).toEqual({});
    }, { cookies: {} }, 303, true);

    expect(result).toMatchObject({ type: "response", response: undefined });
  });

  it("distinguishes required and optional readable cookies", async () => {
    const requiredDefinition = {
      cookies: {
        session: { cookie: sessionCookie, access: "read" },
      },
    } as const;
    const optionalDefinition = {
      cookies: {
        session: { cookie: sessionCookie, access: "read", optional: true },
      },
    } as const;

    expect(await executeRequest(requiredDefinition, ({ respond }) => respond(), { cookies: {} })).toBeUndefined();
    expect(await executeRequest(optionalDefinition, ({ cookies, respond }) => {
      expect(cookies.session.value).toBeUndefined();
      return respond();
    }, { cookies: {} })).toMatchObject({ type: "response" });
  });

  it("exposes only write operations for write cookies", async () => {
    const definition = {
      cookies: {
        session: { cookie: sessionCookie, access: "write" },
      },
    } as const;
    const result = await executeRequest(definition, ({ cookies, respond }) => {
      cookies.session.set({ userId: "user" });
      cookies.session.clear();
      return respond();
    }, { cookies: {} });

    expect(result?.cookieMutations).toEqual([
      { type: "set", definition: sessionCookie, value: { userId: "user" } },
      { type: "clear", definition: sessionCookie },
    ]);
  });

  it("keeps a read-write cookie value immutable after writes", async () => {
    const definition = {
      cookies: {
        session: { cookie: sessionCookie, access: "read-write" },
      },
    } as const;
    await executeRequest(definition, ({ cookies, respond }) => {
      const original = cookies.session.value;
      cookies.session.set({ userId: "next" });
      expect(cookies.session.value).toBe(original);
      return respond();
    }, {
      cookies: { session: JSON.stringify({ userId: "current" }) },
    });
  });

  it("resolves raw and callback errors thrown explicitly", async () => {
    const definition = {
      errors: {
        raw: { error: { code: "raw-error", message: "Raw error." } },
        callback: (value: string) => ({
          error: { code: "callback-error", message: `Callback ${value}.` },
        }),
      },
    } as const;
    const rawResult = await executeRequest(definition, ({ errors }) => {
      throw errors.raw();
    }, { cookies: {} });
    const callbackResult = await executeRequest(definition, ({ errors }) => {
      throw errors.callback("value");
    }, { cookies: {} });

    expect(rawResult).toMatchObject({
      type: "error",
      error: { error: { code: "raw-error", message: "Raw error." } },
    });
    expect(callbackResult).toMatchObject({
      type: "error",
      error: { error: { code: "callback-error", message: "Callback value." } },
    });
  });

  it("returns redirects explicitly", async () => {
    const result = await executeRequest({}, ({ redirect }) => {
      return redirect("https://example.com/next", 303);
    }, { cookies: {} });

    expect(result).toMatchObject({
      type: "redirect",
      location: "https://example.com/next",
      status: 303,
    });
  });
});
