import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

import { connectDB } from "@/lib/db";
import { User } from "@/entities/user";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ==============================
    // CONNECT DATABASE
    // ==============================

    const db = await connectDB();

    const userRepo = db.getRepository(User);

    // ==============================
    // GET REQUEST BODY
    // ==============================

    const body = await req.json();

    const { email, password } = body;

    // ==============================
    // VALIDATE EMAIL
    // ==============================

    if (
      !email ||
      typeof email !== "string" ||
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // VALIDATE PASSWORD
    // ==============================

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // CLEAN EMAIL
    // ==============================

    const cleanEmail = email.trim().toLowerCase();

    // ==============================
    // FIND USER
    // ==============================

    const user = await userRepo.findOne({
      where: {
        email: cleanEmail,
      },
    });

    // ==============================
    // USER NOT FOUND
    // ==============================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // ==============================
    // CHECK PASSWORD
    // ==============================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // ==============================
    // JWT SECRET
    // ==============================

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          success: false,
          message: "JWT_SECRET not configured",
        },
        {
          status: 500,
        }
      );
    }

    // ==============================
    // CREATE JWT
    // ==============================

    const secretKey = new TextEncoder().encode(secret);

    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: "user",
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    // ==============================
    // CREATE RESPONSE
    // ==============================

    const response = NextResponse.json({
      success: true,

      message: "Login successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    // ==============================
    // SAVE JWT COOKIE
    // ==============================

    response.cookies.set("user_token", token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 60 * 60 * 24 * 7,

      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

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