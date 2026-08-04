import { unstable_rethrow } from "next/navigation";
import { type z } from "zod";
import { createRequestCookies } from "./cookies";
import { InvalidRequestError, normalizeFormData, parseSchema } from "./input";
import * as request from "./request";
import type * as types from "./typings";

export function defineAction<
  const Body extends z.ZodType | undefined = undefined,
  const Cookies extends types.CookieBindings | undefined = undefined,
  const Response = undefined,
  const Errors extends types.ErrorDefinitions | undefined = undefined,
>(definition: types.ActionDefinition<Body, Cookies, Response, Errors>): types.Action<Body, Response, Errors>;
export function defineAction(definition: types.RuntimeDefinition) {
  return async (body?: unknown) => {
    try {
      const rawBody = body instanceof FormData ? normalizeFormData(body) : body;
      const parsedBody = definition.body ? await parseSchema(definition.body, rawBody) : {};
      const cookieContext = await createRequestCookies(definition.cookies);

      if (!cookieContext) {
        return request.invalidRequest;
      }

      const context = {
        body: parsedBody,
        cookies: cookieContext.cookies,
        respond: request.createRespond(definition.response),
        errors: request.createErrorFunctions(definition.errors, (error) => ({ error })),
      };
      const outcome = await request.executeHandler(() => definition.handler(context as never));
      await cookieContext.commit();

      if (outcome.type === "error") {
        return outcome.value;
      }

      if (request.isDefinedResponse(outcome.value)) {
        return outcome.value.value;
      }

      if (outcome.value === undefined && !("response" in definition)) {
        return undefined;
      }

      throw new Error("Action handlers must return respond().");
    } catch (error) {
      if (error instanceof InvalidRequestError) {
        return request.invalidRequest;
      }

      unstable_rethrow(error);
      console.error("Unhandled server action error:", error);
      return request.internalError;
    }
  };
}
