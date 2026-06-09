import type { NextRequest } from "next/server";
import { handleSiteRequest } from "@/lib/site-proxy";

export function proxy(request: NextRequest) {
  return handleSiteRequest(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
