import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN_KEY } from "@/lib/cookies";

const intlMiddleware = createMiddleware(routing);

// Protected routes (require valid JWT token in cookies)
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/checkout",
  "/orders",
  "/settings",
  "/tickets",
  "/admin",
];

/**
 * Validates JWT token structure and expiration timestamp
 */
function isTokenValid(token: string | undefined): boolean {
  if (!token || typeof token !== "string") return false;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return false;

  const parts = trimmed.split(".");
  if (parts.length !== 3) return false;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr);

    if (payload && typeof payload.exp === "number") {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp <= nowInSeconds) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Process i18n routing
  const response = intlMiddleware(request);

  // Extract route path without locale prefix (e.g. /ar/profile -> /profile)
  const pathnameWithoutLocale =
    pathname.replace(/^\/(?:en|ar)(?=\/|$)/, "") || "/";

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const hasValidToken = isTokenValid(token);
  const hasRefreshToken = Boolean(request.cookies.get("refreshToken")?.value);

  // Let the client use the httpOnly refresh token when the access token expires.
  if (isProtectedRoute && !hasValidToken && !hasRefreshToken) {
    const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
    const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    const redirectResponse = NextResponse.redirect(loginUrl);
    if (token) {
      redirectResponse.cookies.delete(AUTH_TOKEN_KEY);
    }
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static, _next/image
     * - favicon.ico, logo.png, icons, images, public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
