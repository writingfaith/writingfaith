import type { NextConfig } from "next";

/**
 * Content-Security-Policy for reader-facing routes.
 *
 * `script-src` includes 'unsafe-inline' because Next.js emits inline
 * bootstrap scripts (and we render inline JSON-LD); external script origins
 * remain blocked, which is the bulk of the protection. Moving to per-request
 * nonces (Next 16 CSP guide, proxy-based) is a possible future tightening.
 * `/studio` is excluded below — Sanity Studio manages a large dependency
 * surface and must never be lockable by our policy; it still gets the
 * non-CSP headers.
 */
// React's dev tooling requires eval(); it is never used in production.
const scriptSrc =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://cdn.sanity.io data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.api.sanity.io https://*.sanity.io wss://*.api.sanity.io",
  "frame-ancestors 'self'", // the Studio's presentation tool iframes the site (same origin)
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Everything gets the baseline security headers.
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // CSP on reader-facing routes only (not /studio, see above).
        source: "/((?!studio).*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
