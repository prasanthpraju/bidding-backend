import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { User } from "@/entities/user";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // ==============================
    // CONNECT DATABASE
    // ==============================

    const db = await connectDB();

    const userRepo = db.getRepository(User);

    // ==============================
    // GET USER FROM MIDDLEWARE
    // ==============================

    const userHeader = req.headers.get("user");

    if (!userHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    // ==============================
    // PARSE USER
    // ==============================

    let userData;

    try {
      userData = JSON.parse(userHeader);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user information",
        },
        {
          status: 401,
        }
      );
    }

    // ==============================
    // CHECK USER ID
    // ==============================

    if (!userData.id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID not found",
        },
        {
          status: 401,
        }
      );
    }

    // ==============================
    // FIND USER
    // ==============================

    const user = await userRepo.findOne({
      where: {
        id: String(userData.id),
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 401,
        }
      );
    }

    // ==============================
    // SUCCESS
    // ==============================

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("ME ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}