import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const protectedRoutes = ["/dashboard", "/home", "/conversations", "/"];
const publicRoutes = ["/signin", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get("access_token")?.value;

  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  if (
    isPublicRoute &&
    cookie &&
    !req.nextUrl.pathname.startsWith("/conversations")
  ) {
    return NextResponse.redirect(new URL("/conversations", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
