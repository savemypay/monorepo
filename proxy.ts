import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_authenticated";
const PUBLIC_ROUTES = ["/login"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = request.cookies.get(ADMIN_COOKIE)?.value === "1";

  if (!isPublicPath(pathname) && !isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isAuthed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/deals/:path*",
    "/vendors/:path*",
    "/customers/:path*",
    "/payments/:path*",
    "/analytics/:path*",
    "/support/:path*",
    "/content/:path*",
    "/audit-logs/:path*",
    "/admins/:path*",
    "/settings/:path*",
    "/profile/:path*",
  ],
};
