import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    response.cookies.set("user_token", "", {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      expires: new Date(0),

      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      {
        status: 500,
      }
    );
  }
}