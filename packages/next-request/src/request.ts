import {
  type ErrorToken,
  type RedirectToken,
  type ResponseToken,
  type RuntimeHandler,
} from "./typings";

export const responseMarker = Symbol("response");
export const redirectMarker = Symbol("redirect");
export const errorMarker = Symbol("error");

export const invalidRequest = {
  error: {
    code: "invalid-request",
    message: "Invalid request.",
  },
} as const;

export const internalError = {
  error: {
    code: "internal-error",
    message: "An unexpected error occurred.",
  },
} as const;

export function createRespond(response: unknown) {
  return (...params: unknown[]) => ({
    [responseMarker]: true,
    value: typeof response === "function" ? response(...params) : response,
  } as const);
}

export function createErrorFunctions(
  definitions: Record<string, unknown> | undefined,
  format: (error: unknown) => unknown,
) {
  return Object.fromEntries(Object.entries(definitions ?? {}).map(([name, definition]) => [
    name,
    (...params: unknown[]) => ({
      [errorMarker]: true,
      value: format(typeof definition === "function" ? definition(...params) : definition),
    } as const),
  ]));
}

export function createRedirect(location: string | URL, status: number) {
  return { [redirectMarker]: true, location, status } as const;
}

export async function executeHandler(handler: RuntimeHandler) {
  try {
    return { type: "result", value: await handler() } as const;
  } catch (error) {
    if (!isDefinedError(error)) {
      throw error;
    }

    return { type: "error", value: error.value } as const;
  }
}

export function isDefinedResponse(value: unknown): value is ResponseToken<unknown> {
  return typeof value === "object" && value !== null && responseMarker in value;
}

export function isDefinedRedirect(value: unknown): value is RedirectToken {
  return typeof value === "object" && value !== null && redirectMarker in value;
}

function isDefinedError(value: unknown): value is ErrorToken<unknown> {
  return typeof value === "object" && value !== null && errorMarker in value;
}
