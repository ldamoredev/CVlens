import { randomUUID } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { buildContentSecurityPolicy } from "./server/security/csp";

export function proxy(request: NextRequest): NextResponse {
  const nonce = Buffer.from(randomUUID()).toString("base64");
  const policy = buildContentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === "development",
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|health|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
