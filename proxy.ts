import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const legacyProductionHost = "writingfaith.vercel.app";
const canonicalHost = "www.writingfaith.com.au";

/**
 * Keep the generated production alias from becoming a second public origin.
 * Preview deployment hosts are deliberately left alone for Vercel's QA flow.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  if (host !== legacyProductionHost) return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.protocol = "https:";
  destination.host = canonicalHost;
  destination.port = "";
  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: "/:path*",
};
