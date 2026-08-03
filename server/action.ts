import { cookies as getRequestCookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import {
  clearCookie,
  serializeCookie,
} from "@/server/cookie-factories";
import {
  containsBinary,
  type ActionRedirect,
  type ErrorBody,
  type ErrorValues,
  executeRequest,
  type Handler,
  invalidRequest,
  internalError,
  normalizeEntries,
  type RequestDefinition,
  type ResponseValue,
  validateRequestSchema,
} from "@/server/request";

type ErrorCallback = (...params: never[]) => ErrorBody | Promise<ErrorBody>;
type ActionDefinition = Omit<RequestDefinition, "query" | "errors"> & {
  query?: never;
  errors?: Record<string, ErrorBody | ErrorCallback>;
};
type ActionBody<Definition extends ActionDefinition> = Definition["body"] extends z.ZodType
  ? z.input<Definition["body"]> | FormData
  : never;
type Action<Definition extends ActionDefinition> = Definition["body"] extends z.ZodType
  ? (body: ActionBody<Definition>) => Promise<ResponseValue<Definition> | ErrorValues<Definition> | typeof invalidRequest | typeof internalError>
  : () => Promise<ResponseValue<Definition> | ErrorValues<Definition> | typeof invalidRequest | typeof internalError>;

export function defineAction<const Definition extends ActionDefinition>(definition: Definition) {
  validateRequestSchema(definition.body);

  return {
    handle(handler: Handler<Definition, ActionRedirect, true>) {
      return createAction(definition, handler);
    },
  };
}

function createAction<Definition extends ActionDefinition>(
  definition: Definition,
  handler: Handler<Definition, ActionRedirect, true>,
) {
  const action = async (body?: ActionBody<Definition>) => {
    try {
      let normalizedBody: unknown = body;

      if (definition.body && body instanceof FormData) {
        try {
          normalizedBody = normalizeEntries(definition.body, body.entries());
        } catch {
          return invalidRequest;
        }
      } else if (containsBinary(body)) {
        return invalidRequest;
      }

      const cookieStore = await getRequestCookies();
      const cookieValues = Object.fromEntries(Object.entries(definition.cookies ?? {})
        .filter(([, binding]) => binding.access !== "write")
        .map(([name, binding]) => [name, cookieStore.get(binding.cookie.name)?.value]));
      const executed = await executeRequest(definition, handler, {
        body: normalizedBody,
        cookies: cookieValues,
      }, 303, true);

      if (!executed) {
        return invalidRequest;
      }

      for (const mutation of executed.cookieMutations) {
        cookieStore.set(mutation.type === "set"
          ? await serializeCookie(mutation.definition, mutation.value)
          : clearCookie(mutation.definition));
      }

      if (executed.type === "error") {
        return executed.error;
      }

      if (executed.type === "redirect") {
        redirect(String(executed.location));
      }

      return executed.response;
    } catch (error) {
      unstable_rethrow(error);
      console.error("Unhandled server action error:", error);
      return internalError;
    }
  };

  return action as Action<Definition>;
}
