import { unstable_rethrow } from "next/navigation";
import { type NextRequest } from "next/server";
import { type z } from "zod";
import { createRequestCookies } from "./cookies";
import { InvalidRequestError, parseBody, parseSchema } from "./input";
import * as request from "./request";
import type * as types from "./typings";

export function defineRoute<
  const Body extends z.ZodType | undefined = undefined,
  const Query extends z.ZodType | undefined = undefined,
  const Cookies extends types.CookieBindings | undefined = undefined,
  const Response extends types.RouteResult | types.Factory<types.RouteResult> | undefined = undefined,
  const Errors extends types.RouteErrorDefinitions | undefined = undefined,
>(definition: types.RouteDefinition<Body, Query, Cookies, Response, Errors>): types.Route;
export function defineRoute(definition: types.RuntimeDefinition) {
  return async function routeHandler(incomingRequest: NextRequest) {
    try {
      const rawBody = definition.body ? await parseBody(incomingRequest) : undefined;
      const rawQuery = definition.query
        ? Object.fromEntries(incomingRequest.nextUrl.searchParams)
        : undefined;
      const [parsedBody, parsedQuery] = await Promise.all([
        definition.body ? parseSchema(definition.body, rawBody) : {},
        definition.query ? parseSchema(definition.query, rawQuery) : {},
      ]);
      const cookieContext = await createRequestCookies(definition.cookies);

      if (!cookieContext) {
        return Response.json(request.invalidRequest, { status: 400 });
      }

      const context = {
        body: parsedBody,
        query: parsedQuery,
        cookies: cookieContext.cookies,
        respond: request.createRespond(definition.response),
        errors: request.createErrorFunctions(definition.errors, (error) => {
          const { status, ...body } = error as types.RouteErrorDefinition;
          return { status, body: { error: body } };
        }),
        redirect: (location: string | URL, status = 307) => request.createRedirect(location, status),
      };
      const outcome = await request.executeHandler(() => definition.handler(context as never));
      await cookieContext.commit();

      if (outcome.type === "error") {
        return toResponse(outcome.value as types.RouteResult);
      }

      if (request.isDefinedRedirect(outcome.value)) {
        return Response.redirect(
          new URL(outcome.value.location, incomingRequest.url),
          outcome.value.status,
        );
      }

      if (request.isDefinedResponse(outcome.value)) {
        return toResponse(outcome.value.value as types.RouteResult);
      }

      throw new Error("Route handlers must return respond() or redirect().");
    } catch (error) {
      if (error instanceof InvalidRequestError) {
        return Response.json(request.invalidRequest, { status: 400 });
      }

      unstable_rethrow(error);
      console.error("Unhandled route handler error:", error);
      return Response.json(request.internalError, { status: 500 });
    }
  };
}

function toResponse(result: types.RouteResult | undefined) {
  if (!result) {
    throw new Error("Route handlers must define a response before calling respond().");
  }

  return Response.json(result.body, { status: result.status });
}
