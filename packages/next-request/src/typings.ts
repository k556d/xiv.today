import { type Duration } from "date-fns";
import { type cookies as getRequestCookies } from "next/headers";
import { type NextRequest } from "next/server";
import { type z } from "zod";

declare const responseMarker: unique symbol;

declare const redirectMarker: unique symbol;

declare const errorMarker: unique symbol;

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
  options?: CookieOptions;
  deserialize(value: string): unknown | Promise<unknown>;
  serialize(value: z.output<Schema>, expires: Date | undefined): string | Promise<string>;
};

export type Cookie<Value> = {
  readonly name: string;
  get(store: CookieStore): Promise<Value | undefined>;
  set(store: CookieStore, value: Value): Promise<void>;
  clear(store: CookieStore): void;
};

export type CookieStore = Awaited<ReturnType<typeof getRequestCookies>>;

type AnyCookie = Cookie<unknown>;

export type CookieBinding<CookieType extends AnyCookie = AnyCookie> =
  | {
      cookie: CookieType;
      access: "read";
      optional?: true;
    }
  | {
      cookie: CookieType;
      access: "write";
      optional?: never;
    }
  | {
      cookie: CookieType;
      access: "read-write";
      optional?: true;
    };

export type CookieBindings = Record<string, CookieBinding>;

type CookieValue<Binding extends CookieBinding> = Binding["cookie"] extends Cookie<infer Value>
  ? Value
  : never;

type ReadCookie<Binding extends CookieBinding> = {
  readonly value: Binding extends { optional: true }
    ? CookieValue<Binding> | undefined
    : CookieValue<Binding>;
};

type WriteCookie<Binding extends CookieBinding> = {
  set(value: CookieValue<Binding>): void;
  clear(): void;
};

type CookieHandle<Binding extends CookieBinding> = Binding extends { access: "read" }
  ? ReadCookie<Binding>
  : Binding extends { access: "write" }
    ? WriteCookie<Binding>
    : ReadCookie<Binding> & WriteCookie<Binding>;

export type CookieHandles<Bindings> = Bindings extends CookieBindings
  ? { [Name in keyof Bindings]: CookieHandle<Bindings[Name]> }
  : Record<PropertyKey, never>;

export type CookieMutation =
  | { type: "set"; cookie: AnyCookie; value: unknown }
  | { type: "clear"; cookie: AnyCookie };

type ErrorDefinition = {
  code: string;
  message: string;
  [key: string]: unknown;
};

export type Factory<Value> = (...params: never[]) => Value;

export type ErrorDefinitions = Record<string, ErrorDefinition | Factory<ErrorDefinition>>;

type BodyInput<Body> = Body extends z.ZodType ? z.input<Body> : never;

type BodyOutput<Body> = Body extends z.ZodType
  ? z.output<Body>
  : Record<PropertyKey, never>;

type ResponseValue<Response> = Response extends Factory<infer Value> ? Value : Response;

type Resolved<Value> = Value extends Factory<infer Result> ? Result : Value;

type ActionErrorValue<Value> = { error: Resolved<Value> };

type ActionErrorValues<Errors> = {
  [Name in keyof Errors]: ActionErrorValue<Errors[Name]>;
}[keyof Errors];

export type ResponseToken<Value> = {
  [responseMarker]: true;
  value: Value;
};

export type RedirectToken = {
  [redirectMarker]: true;
  location: string | URL;
  status: number;
};

export type ErrorToken<Value> = {
  [errorMarker]: true;
  value: Value;
};

type Respond<Response> = Response extends (...params: infer Params) => infer Value
  ? (...params: Params) => ResponseToken<Value>
  : () => ResponseToken<Response>;

type ActionErrorFunction<Error> = Error extends (...params: infer Params) => infer Value
  ? (...params: Params) => ErrorToken<ActionErrorValue<Value>>
  : () => ErrorToken<ActionErrorValue<Error>>;

type ActionErrorFunctions<Errors> = {
  [Name in keyof Errors]: ActionErrorFunction<Errors[Name]>;
};

type RequestContext<Body, Cookies, Response, ErrorFunctions> = {
  body: BodyOutput<Body>;
  cookies: CookieHandles<Cookies>;
  respond: Respond<Response>;
  errors: ErrorFunctions;
};

type ActionHandler<Body, Cookies, Response, Errors> = (
  context: RequestContext<Body, Cookies, Response, ActionErrorFunctions<Errors>>,
) => ResponseToken<ResponseValue<Response>>
  | ([Response] extends [undefined] ? void : never)
  | Promise<ResponseToken<ResponseValue<Response>> | ([Response] extends [undefined] ? void : never)>;

export type ActionDefinition<Body, Cookies, Response, Errors> = {
  body?: Body;
  cookies?: Cookies;
  response?: Response;
  errors?: Errors;
  handler: ActionHandler<Body, Cookies, Response, Errors>;
};

type ActionResult<Response, Errors> = ResponseValue<Response>
  | ActionErrorValues<Errors>
  | typeof import("./request").invalidRequest
  | typeof import("./request").internalError;

export type Action<Body, Response, Errors> = Body extends z.ZodType
  ? (body: BodyInput<Body> | FormData) => Promise<ActionResult<Response, Errors>>
  : () => Promise<ActionResult<Response, Errors>>;

export type RouteResult<Body = unknown> = {
  status: number;
  body: Body;
};

export type RouteErrorDefinition = ErrorDefinition & { status: number };

export type RouteErrorDefinitions = Record<string, RouteErrorDefinition | Factory<RouteErrorDefinition>>;

type RouteErrorValue<Value> = Resolved<Value> extends infer Error extends RouteErrorDefinition
  ? {
      status: Error["status"];
      body: { error: Omit<Error, "status"> };
    }
  : never;

type RouteErrorFunction<Error> = Error extends (...params: infer Params) => infer Value
  ? (...params: Params) => ErrorToken<RouteErrorValue<Value>>
  : () => ErrorToken<RouteErrorValue<Error>>;

type RouteErrorFunctions<Errors> = {
  [Name in keyof Errors]: RouteErrorFunction<Errors[Name]>;
};

type RedirectStatus = 301 | 302 | 303 | 307 | 308;

type RouteContext<Body, Query, Cookies, Response, Errors> = RequestContext<
  Body,
  Cookies,
  Response,
  RouteErrorFunctions<Errors>
> & {
  query: BodyOutput<Query>;
  redirect(location: string | URL, status?: RedirectStatus): RedirectToken;
};

type RouteHandler<Body, Query, Cookies, Response, Errors> = (
  context: RouteContext<Body, Query, Cookies, Response, Errors>,
) => ResponseToken<ResponseValue<Response>>
  | RedirectToken
  | Promise<ResponseToken<ResponseValue<Response>> | RedirectToken>;

export type RouteDefinition<Body, Query, Cookies, Response, Errors> = {
  body?: Body;
  query?: Query;
  cookies?: Cookies;
  response?: Response;
  errors?: Errors;
  handler: RouteHandler<Body, Query, Cookies, Response, Errors>;
};

export type Route = (request: NextRequest) => Promise<Response>;

export type RuntimeDefinition = {
  body?: z.ZodType;
  query?: z.ZodType;
  cookies?: CookieBindings;
  response?: unknown;
  errors?: Record<string, unknown>;
  handler(context: never): unknown;
};

export type RuntimeHandler = () => unknown;
