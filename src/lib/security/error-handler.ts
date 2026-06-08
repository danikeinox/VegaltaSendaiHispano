import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { Dictionary } from "@/i18n/types";
import { corsHeaders } from "@/lib/security/cors";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function handleApiError(
  error: unknown,
  request?: Request,
  apiMessages?: Dictionary["api"]
): NextResponse {
  const headers = corsHeaders(request);
  const messages = apiMessages ?? {
    validationError: "Datos de entrada no válidos",
    internalError: "Error interno del servidor",
  };

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode, headers }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: messages.validationError,
        code: "VALIDATION_ERROR",
        details: error.flatten().fieldErrors,
      },
      { status: 400, headers }
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]", error);
  } else {
    console.error("[API Error] Internal server error");
  }

  return NextResponse.json(
    { error: messages.internalError, code: "INTERNAL_ERROR" },
    { status: 500, headers }
  );
}

export function jsonSuccess<T>(
  data: T,
  status = 200,
  request?: Request
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(request),
  });
}
