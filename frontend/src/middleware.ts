import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE_API_URL } from "./api";

const protectedRoutes = [
  "/dashboard",
  "/home",
  "/conversations",
  "/",
  "/verify-required",
];
const publicRoutes = ["/signin", "/signup", "/"];

const checkUserIsVerified = async (access_token: string) => {
  const response = await fetch(
    new URL("/api/auth/user-is-verified", BASE_API_URL),
    {
      headers: {
        cookie: `access_token=${access_token}`, // Forward cookie manually
      },
    },
  );
  if (!response.ok) {
    return false;
  }
  return true;
};

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get("access_token")?.value;

  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  if (cookie && path !== "/verify-email") {
    const verified = await checkUserIsVerified(cookie);
    if (verified && path == "/verify-required") {
      return NextResponse.redirect(new URL("/conversations", req.nextUrl));
    }
    if (!verified && path !== "/verify-required") {
      // Redirect to verify-required if not verified
      return NextResponse.redirect(new URL("/verify-required", req.nextUrl));
    }
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
