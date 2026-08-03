import { cookies as getRequestCookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import {
  clearCookie,
  serializeCookie,
} from "@/server/cookie-factories";
import {
  containsBinary,
  type ErrorBody,
  executeRequest,
  type Handler,
  invalidRequest,
  internalError,
  normalizeEntries,
  type RouteRedirect,
  type RequestDefinition,
  type RouteResult,
  validateRequestSchema,
} from "@/server/request";

type RouteResponseCallback = (...params: never[]) => RouteResult | Promise<RouteResult>;
type RouteError = RouteResult<ErrorBody>;
type RouteErrorCallback = (...params: never[]) => RouteError | Promise<RouteError>;
type RouteDefinition = Omit<RequestDefinition, "response" | "errors"> & {
  response?: RouteResult | RouteResponseCallback;
  errors?: Record<string, RouteError | RouteErrorCallback>;
};

export function createRoute<Definition extends RouteDefinition>(
  definition: Definition,
  handler: Handler<Definition, RouteRedirect>,
) {
  validateRequestSchema(definition.body);
  validateRequestSchema(definition.query);

  return async function routeHandler(request: Request): Promise<Response> {
    try {
      const cookieStore = await getRequestCookies();
      const body = definition.body ? await readBody(request, definition.body) : undefined;
      const query = definition.query
        ? normalizeInputEntries(definition.query, new URL(request.url).searchParams.entries())
        : undefined;
      const cookieValues = Object.fromEntries(Object.entries(definition.cookies ?? {})
        .filter(([, binding]) => binding.access !== "write")
        .map(([name, binding]) => [name, cookieStore.get(binding.cookie.name)?.value]));
      const executed = await executeRequest(definition, handler, { body, query, cookies: cookieValues });

      if (!executed) {
        return Response.json(invalidRequest, { status: 400 });
      }

      for (const mutation of executed.cookieMutations) {
        cookieStore.set(mutation.type === "set"
          ? await serializeCookie(mutation.definition, mutation.value)
          : clearCookie(mutation.definition));
      }

      if (executed.type === "redirect") {
        return Response.redirect(new URL(executed.location, request.url), executed.status);
      }

      const result = executed.type === "error" ? executed.error : executed.response;
      if (!result) {
        throw new Error("Route handlers must define a response before calling respond().");
      }

      return Response.json(result.body, { status: result.status });
    } catch (error) {
      if (error instanceof RequestInputError) {
        return Response.json(invalidRequest, { status: 400 });
      }

      unstable_rethrow(error);
      console.error("Unhandled route handler error:", error);
      return Response.json(internalError, { status: 500 });
    }
  };
}

class RequestInputError extends Error {}

function normalizeInputEntries(
  schema: NonNullable<RequestDefinition["body"]>,
  entries: Iterable<[string, FormDataEntryValue | string]>,
) {
  try {
    return normalizeEntries(schema, entries);
  } catch {
    throw new RequestInputError();
  }
}

async function readBody(request: Request, schema: NonNullable<RequestDefinition["body"]>) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();

  try {
    if (contentType === "application/json") {
      const body: unknown = await request.json();

      if (containsBinary(body)) {
        throw new RequestInputError();
      }

      return body;
    }

    if (contentType === "multipart/form-data" || contentType === "application/x-www-form-urlencoded") {
      return normalizeInputEntries(schema, (await request.formData()).entries());
    }
  } catch (error) {
    if (error instanceof RequestInputError) {
      throw error;
    }

    throw new RequestInputError();
  }

  throw new RequestInputError();
}
