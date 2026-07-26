import { z } from "zod";
import {
  type CookieDefinition,
  deserializeCookie,
} from "@/server/cookie-factories";

type AnyObjectSchema = z.ZodObject<z.ZodRawShape>;
type AnyCookieDefinition = CookieDefinition<z.ZodType>;
type MaybePromise<Value> = Value | Promise<Value>;
type Callback = (...params: never[]) => unknown;
type ResponseDefinition = unknown | Callback;
type ErrorDefinitions = Record<string, unknown | Callback>;

const responseMarker = Symbol("response");
const redirectMarker = Symbol("redirect");
const errorMarker = Symbol("error");

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

export type ErrorBody = {
  error: {
    code: string;
    message: string;
    [key: string]: unknown;
  };
};

export type RouteResult<Body = unknown> = {
  status: number;
  body: Body;
};

export type CookieBinding<Definition extends AnyCookieDefinition = AnyCookieDefinition> =
  | {
      cookie: Definition;
      access: "read";
      optional?: true;
    }
  | {
      cookie: Definition;
      access: "write";
      optional?: never;
    }
  | {
      cookie: Definition;
      access: "read-write";
      optional?: true;
    };

type AnyCookieBinding = CookieBinding<AnyCookieDefinition>;

export type RequestDefinition = {
  body?: AnyObjectSchema;
  query?: AnyObjectSchema;
  cookies?: Record<string, AnyCookieBinding>;
  response?: ResponseDefinition;
  errors?: ErrorDefinitions;
};

type EmptyObject = Record<PropertyKey, never>;
type SchemaOutput<Schema> = Schema extends z.ZodType ? z.output<Schema> : EmptyObject;
type CookieValue<Binding> = Binding extends CookieBinding<infer Definition>
  ? z.output<Definition["schema"]>
  : never;
type OptionalCookieValue<Binding> = Binding extends { optional: true }
  ? CookieValue<Binding> | undefined
  : CookieValue<Binding>;

type ReadCookie<Binding> = {
  readonly value: OptionalCookieValue<Binding>;
};

type WriteCookie<Binding> = {
  set(value: CookieValue<Binding>): void;
  clear(): void;
};

type CookieHandle<Binding> = Binding extends { access: "read" }
  ? ReadCookie<Binding>
  : Binding extends { access: "write" }
    ? WriteCookie<Binding>
    : Binding extends { access: "read-write" }
      ? ReadCookie<Binding> & WriteCookie<Binding>
      : never;

type CookieHandles<Definition extends RequestDefinition> = Definition["cookies"] extends Record<string, AnyCookieBinding>
  ? { [Name in keyof Definition["cookies"]]: CookieHandle<Definition["cookies"][Name]> }
  : EmptyObject;

type Resolved<Value> = Value extends (...params: never[]) => infer Result ? Awaited<Result> : Value;
type DefinitionResponse<Definition extends RequestDefinition> = Definition extends { response: infer Response }
  ? Response
  : undefined;

export type ResponseValue<Definition extends RequestDefinition> = Resolved<DefinitionResponse<Definition>>;

export type ErrorValues<Definition extends RequestDefinition> = Definition["errors"] extends ErrorDefinitions
  ? { [Name in keyof Definition["errors"]]: Resolved<Definition["errors"][Name]> }[keyof Definition["errors"]]
  : never;

export type DefinedResponse<Response = unknown> = {
  [responseMarker]: true;
  params: unknown[];
  response?: Resolved<Response>;
};

export type DefinedRedirect = {
  [redirectMarker]: true;
  location: string | URL;
  status: number;
};

export type RedirectStatus = 301 | 302 | 303 | 307 | 308;
export type ActionRedirect = (location: string | URL) => DefinedRedirect;
export type RouteRedirect = (location: string | URL, status?: RedirectStatus) => DefinedRedirect;
type RedirectFunction = (...params: never[]) => DefinedRedirect;

export type DefinedError<Error = unknown> = {
  [errorMarker]: true;
  name: string;
  params: unknown[];
  error?: Resolved<Error>;
};

type Respond<Definition extends RequestDefinition> = DefinitionResponse<Definition> extends (...params: infer Params) => unknown
  ? (...params: Params) => DefinedResponse<DefinitionResponse<Definition>>
  : () => DefinedResponse<DefinitionResponse<Definition>>;

type ErrorFunction<Error> = Error extends (...params: infer Params) => unknown
  ? (...params: Params) => DefinedError<Error>
  : () => DefinedError<Error>;

type ErrorFunctions<Definition extends RequestDefinition> = Definition["errors"] extends ErrorDefinitions
  ? { [Name in keyof Definition["errors"]]: ErrorFunction<Definition["errors"][Name]> }
  : EmptyObject;

export type HandlerContext<
  Definition extends RequestDefinition,
  Redirect extends RedirectFunction = RouteRedirect,
> = {
  body: SchemaOutput<Definition["body"]>;
  query: SchemaOutput<Definition["query"]>;
  cookies: CookieHandles<Definition>;
  respond: Respond<Definition>;
  errors: ErrorFunctions<Definition>;
  redirect: Redirect;
};

export type Handler<
  Definition extends RequestDefinition,
  Redirect extends RedirectFunction = RouteRedirect,
> = (
  context: HandlerContext<Definition, Redirect>,
) => MaybePromise<DefinedResponse<DefinitionResponse<Definition>> | DefinedRedirect>;

export type CookieMutation =
  | { type: "set"; definition: AnyCookieDefinition; value: unknown }
  | { type: "clear"; definition: AnyCookieDefinition };

type ZodInternals = z.ZodType & {
  _zod: {
    def: {
      type: string;
      innerType?: z.ZodType;
      in?: z.ZodType;
      options?: z.ZodType[];
    };
  };
};

function acceptsArray(schema: z.ZodType): boolean {
  const { def } = (schema as ZodInternals)._zod;

  if (def.type === "array") {
    return true;
  }

  if (["optional", "nullable", "default", "prefault", "nonoptional", "readonly", "catch"].includes(def.type) && def.innerType) {
    return acceptsArray(def.innerType);
  }

  if (def.type === "pipe" && def.in) {
    return acceptsArray(def.in);
  }

  if (def.type === "union" && def.options) {
    const options = new Set(def.options.map(acceptsArray));

    if (options.size > 1) {
      throw new Error("Request fields cannot accept both scalar and array input.");
    }

    return options.has(true);
  }

  return false;
}

export function validateRequestSchema(schema: AnyObjectSchema | undefined) {
  for (const fieldSchema of Object.values(schema?.shape ?? {})) {
    acceptsArray(fieldSchema as z.ZodType);
  }
}

export function normalizeEntries(
  schema: AnyObjectSchema,
  entries: Iterable<[string, FormDataEntryValue | string]>,
) {
  const values = new Map<string, unknown>();
  const shape = schema.shape;

  for (const [name, fieldSchema] of Object.entries(shape)) {
    if (acceptsArray(fieldSchema as z.ZodType)) {
      values.set(name, []);
    }
  }

  for (const [name, value] of entries) {
    if (typeof value !== "string") {
      throw new Error("File uploads are not accepted.");
    }

    const fieldSchema = shape[name];
    const isArray = fieldSchema ? acceptsArray(fieldSchema as z.ZodType) : false;

    if (isArray) {
      (values.get(name) as string[]).push(value);
    } else if (values.has(name)) {
      throw new Error(`Request field ${name} was provided more than once.`);
    } else {
      values.set(name, value);
    }
  }

  return Object.fromEntries(values);
}

export function containsBinary(value: unknown, seen = new Set<object>()): boolean {
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }

  if (!value || typeof value !== "object" || seen.has(value)) {
    return false;
  }

  seen.add(value);
  return Object.values(value).some((entry) => containsBinary(entry, seen));
}

export type RawRequest = {
  body?: unknown;
  query?: unknown;
  cookies: Record<string, string | undefined>;
};

export type ExecutedRequest<Definition extends RequestDefinition> =
  | {
      type: "response";
      response: ResponseValue<Definition>;
      cookieMutations: CookieMutation[];
    }
  | {
      type: "error";
      error: ErrorValues<Definition>;
      cookieMutations: CookieMutation[];
    }
  | {
      type: "redirect";
      location: string | URL;
      status: number;
      cookieMutations: CookieMutation[];
    };

export async function executeRequest<
  Definition extends RequestDefinition,
  Redirect extends RedirectFunction = RouteRedirect,
>(
  definition: Definition,
  handler: Handler<Definition, Redirect>,
  rawRequest: RawRequest,
  defaultRedirectStatus = 307,
): Promise<ExecutedRequest<Definition> | undefined> {
  const [body, query, parsedCookies] = await Promise.all([
    definition.body?.safeParseAsync(rawRequest.body),
    definition.query?.safeParseAsync(rawRequest.query),
    parseCookies(definition.cookies, rawRequest.cookies),
  ]);

  if (body && !body.success || query && !query.success || parsedCookies === undefined) {
    return undefined;
  }

  const cookieMutations: CookieMutation[] = [];
  const cookies = createCookieHandles(definition.cookies, parsedCookies, cookieMutations) as CookieHandles<Definition>;
  const errors = Object.fromEntries(Object.keys(definition.errors ?? {}).map((name) => [
    name,
    (...params: unknown[]) => ({ [errorMarker]: true, name, params }),
  ])) as ErrorFunctions<Definition>;
  const context: HandlerContext<Definition, Redirect> = {
    body: body?.data ?? Object.create(null),
    query: query?.data ?? Object.create(null),
    cookies,
    respond: ((...params: unknown[]) => ({ [responseMarker]: true, params })) as Respond<Definition>,
    errors,
    redirect: ((location: string | URL, status = defaultRedirectStatus) => ({
      [redirectMarker]: true,
      location,
      status,
    })) as unknown as Redirect,
  } as HandlerContext<Definition, Redirect>;

  let result: DefinedResponse<DefinitionResponse<Definition>> | DefinedRedirect;

  try {
    result = await handler(context);
  } catch (error) {
    if (!isDefinedError(error)) {
      throw error;
    }

    const errorDefinition = definition.errors?.[error.name];
    if (errorDefinition === undefined) {
      throw new Error(`Undefined request error ${error.name}.`);
    }

    const resolvedError = typeof errorDefinition === "function"
      ? await (errorDefinition as (...params: unknown[]) => unknown)(...error.params)
      : errorDefinition;

    return {
      type: "error",
      error: resolvedError as ErrorValues<Definition>,
      cookieMutations,
    };
  }

  if (isDefinedRedirect(result)) {
    return {
      type: "redirect",
      location: result.location,
      status: result.status,
      cookieMutations,
    };
  }

  if (!isDefinedResponse(result)) {
    throw new Error("Request handlers must return respond() or redirect().");
  }

  const responseDefinition = definition.response;
  const response = typeof responseDefinition === "function"
    ? await (responseDefinition as (...params: unknown[]) => unknown)(...result.params)
    : responseDefinition;

  return {
    type: "response",
    response: response as ResponseValue<Definition>,
    cookieMutations,
  };
}

function isDefinedError(value: unknown): value is DefinedError {
  return typeof value === "object" && value !== null && errorMarker in value;
}

function isDefinedResponse(value: unknown): value is DefinedResponse {
  return typeof value === "object" && value !== null && responseMarker in value;
}

function isDefinedRedirect(value: unknown): value is DefinedRedirect {
  return typeof value === "object" && value !== null && redirectMarker in value;
}

async function parseCookies(
  bindings: RequestDefinition["cookies"],
  values: Record<string, string | undefined>,
) {
  const parsed: Record<string, unknown> = {};

  try {
    await Promise.all(Object.entries(bindings ?? {}).map(async ([name, binding]) => {
      if (binding.access === "write") {
        return;
      }

      const value = values[name];
      if (value === undefined) {
        if (!binding.optional) {
          throw new Error("Missing cookie.");
        }

        parsed[name] = undefined;
        return;
      }

      parsed[name] = await deserializeCookie(binding.cookie, value);
    }));
  } catch {
    return undefined;
  }

  return parsed;
}

function createCookieHandles(
  bindings: RequestDefinition["cookies"],
  values: Record<string, unknown>,
  mutations: CookieMutation[],
) {
  return Object.fromEntries(Object.entries(bindings ?? {}).map(([name, binding]) => {
    const handle: Record<string, unknown> = {};

    if (binding.access !== "write") {
      Object.defineProperty(handle, "value", {
        enumerable: true,
        value: values[name],
        writable: false,
      });
    }

    if (binding.access !== "read") {
      handle.set = (value: unknown) => mutations.push({ type: "set", definition: binding.cookie, value });
      handle.clear = () => mutations.push({ type: "clear", definition: binding.cookie });
    }

    return [name, handle];
  }));
}
