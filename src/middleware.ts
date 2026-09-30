import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/api/v1/admin/login",
  "/api/v1/user/auth/register",
  "/api/v1/user/auth/login",

  "/api/v1/bidding/entry",
];

const ALLOWED_ORIGIN = "http://localhost:5173";

function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);

  response.headers.set("Access-Control-Allow-Credentials", "true");

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  return response;
}

export async function middleware(req: NextRequest) {
  // ==============================
  // CORS PREFLIGHT
  // ==============================

  if (req.method === "OPTIONS") {
    return setCorsHeaders(
      new NextResponse(null, {
        status: 204,
      }),
    );
  }

  try {
    const { pathname } = req.nextUrl;

    // ==============================
    // PUBLIC ROUTES
    // ==============================

    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (isPublicPath) {
      return setCorsHeaders(NextResponse.next());
    }

    // ==============================
    // PUBLIC BIDDING DETAILS
    // ==============================

    const isPublicBiddingDetails =
      pathname.startsWith("/api/v1/bidding/") &&
      req.method === "GET" &&
      pathname !== "/api/v1/bidding/entry";

    if (isPublicBiddingDetails) {
      return setCorsHeaders(NextResponse.next());
    }

    // ==============================
    // DETERMINE ROUTE TYPE
    // ==============================

    const isAdminRoute = pathname.startsWith("/api/v1/admin");

    const isUserRoute = pathname.startsWith("/api/v1/user");

    const isBiddingRoute = pathname.startsWith("/api/v1/bidding");

    // ==============================
    // NOT PROTECTED
    // ==============================

    if (!isAdminRoute && !isUserRoute && !isBiddingRoute) {
      return setCorsHeaders(NextResponse.next());
    }

    // ==============================
    // COOKIE NAME
    // ==============================

    let cookieName = "user_token";

    if (isAdminRoute) {
      cookieName = "token";
    }

    if (isUserRoute) {
      cookieName = "user_token";
    }

    if (isBiddingRoute) {
      cookieName = "user_token";
    }

    // ==============================
    // GET TOKEN
    // ==============================

    const token = req.cookies.get(cookieName)?.value;

    if (!token) {
      return setCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "Token not found",
          },
          {
            status: 401,
          },
        ),
      );
    }

    // ==============================
    // JWT SECRET
    // ==============================

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return setCorsHeaders(
        NextResponse.json(
          {
            success: false,
            message: "JWT_SECRET not configured",
          },
          {
            status: 500,
          },
        ),
      );
    }

    // ==============================
    // VERIFY TOKEN
    // ==============================

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    // ==============================
    // REQUEST HEADERS
    // ==============================

    const requestHeaders = new Headers(req.headers);

    // ==============================
    // ADMIN
    // ==============================

    if (isAdminRoute) {
      requestHeaders.set(
        "admin",
        JSON.stringify({
          id: payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        }),
      );
    }

    // ==============================
    // USER
    // ==============================

    if (isUserRoute) {
      requestHeaders.set(
        "user",
        JSON.stringify({
          id: payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        }),
      );
    }

    // ==============================
    // BIDDING
    // ==============================

    if (isBiddingRoute) {
      requestHeaders.set("x-user-id", String(payload.id));
    }

    // ==============================
    // CONTINUE REQUEST
    // ==============================

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return setCorsHeaders(response);
  } catch (error) {
    console.error("MIDDLEWARE ERROR:", error);

    return setCorsHeaders(
      NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        {
          status: 401,
        },
      ),
    );
  }
}

export const config = {
  matcher: ["/api/v1/:path*"],
};

export default middleware;
