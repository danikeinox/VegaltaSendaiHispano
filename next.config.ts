import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { normalizeSiteUrl } from "./src/lib/site-origin";

const appUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL) ||
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
  "https://www.vegalta.es";
const isDev = process.env.NODE_ENV !== "production";

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://challenges.cloudflare.com",
].join(" ");

const ContentSecurityPolicy = `
  default-src 'self';
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://i.ytimg.com https://www.youtube.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://pay.google.com https://fra.cloud.appwrite.io https://challenges.cloudflare.com;
  frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://challenges.cloudflare.com;
  frame-ancestors 'none';
  object-src 'none';
  manifest-src 'self';
  worker-src 'self';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

/** Stricter target policy — report-only until Next.js inline scripts migrate to nonces. */
const ContentSecurityPolicyReportOnly = `
  default-src 'self';
  script-src 'self' https://challenges.cloudflare.com;
  style-src 'self';
  img-src 'self' data: blob: https://i.ytimg.com https://www.youtube.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://pay.google.com https://fra.cloud.appwrite.io https://challenges.cloudflare.com;
  frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://challenges.cloudflare.com;
  frame-ancestors 'none';
  object-src 'none';
  manifest-src 'self';
  worker-src 'self';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: ContentSecurityPolicyReportOnly,
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/:locale/carnet/:path*",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "Referrer-Policy"),
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/:locale/recuperar/:path*",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "Referrer-Policy"),
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/api/wallet/:path*",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "Referrer-Policy"),
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_URL: appUrl,
    NEXT_PUBLIC_REGISTRATION_DISABLED:
      process.env.REGISTRATION_DISABLED ?? "true",
    NEXT_PUBLIC_WALLETS_ENABLED: process.env.WALLETS_ENABLED ?? "false",
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
