import { z } from "zod";

export class InvalidRequestError extends Error {}

export async function parseSchema<Schema extends z.ZodType>(schema: Schema, value: unknown) {
  const result = await schema.safeParseAsync(value);

  if (!result.success) {
    throw new InvalidRequestError();
  }

  return result.data;
}

export async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.startsWith("application/json")) {
    try {
      return await request.json() as unknown;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new InvalidRequestError();
      }

      throw error;
    }
  }

  if (
    contentType.startsWith("multipart/form-data")
    || contentType.startsWith("application/x-www-form-urlencoded")
  ) {
    let formData: FormData;

    try {
      formData = await request.formData();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new InvalidRequestError();
      }

      throw error;
    }

    return normalizeFormData(formData);
  }

  throw new InvalidRequestError();
}

export function normalizeFormData(formData: FormData) {
  const values = new Map<string, FormDataEntryValue | FormDataEntryValue[]>();

  for (const [name, value] of formData.entries()) {
    const current = values.get(name);

    if (current === undefined) {
      values.set(name, value);
    } else if (Array.isArray(current)) {
      current.push(value);
    } else {
      values.set(name, [current, value]);
    }
  }

  return Object.fromEntries(values);
}

export function coerceArray<Schema extends z.ZodType>(schema: Schema) {
  return z.union([schema, z.array(schema)]).transform((value) => Array.isArray(value) ? value : [value]);
}
