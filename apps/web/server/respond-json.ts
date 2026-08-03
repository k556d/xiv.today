import { NextResponse } from "next/server";

type JsonResponse = {
  body: Record<string, unknown>;
  status: number;
};

export function respondJson<Params extends object>(
  definition: JsonResponse | ((params: Params) => JsonResponse),
  params?: Params,
) {
  const response = typeof definition === "function" ? definition(params as Params) : definition;
  return NextResponse.json(response.body, { status: response.status });
}
