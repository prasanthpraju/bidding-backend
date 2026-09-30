import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

    const { name, email, password } = body;

    // ==============================
    // VALIDATE NAME
    // ==============================

    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be at least 2 characters",
        },
        {
          status: 400,
        }
      );
    }

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

    if (
      !password ||
      typeof password !== "string" ||
      password.length < 6
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    // ==============================
    // CLEAN DATA
    // ==============================

    const cleanName = name.trim();

    const cleanEmail = email.trim().toLowerCase();

    // ==============================
    // CHECK EXISTING USER
    // ==============================

    const existingUser = await userRepo.findOne({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        {
          status: 409,
        }
      );
    }

    // ==============================
    // HASH PASSWORD
    // ==============================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ==============================
    // CREATE USER
    // ==============================

    const user = userRepo.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    // ==============================
    // SAVE USER
    // ==============================

    const savedUser = await userRepo.save(user);

    // ==============================
    // RESPONSE
    // ==============================

    return NextResponse.json(
      {
        success: true,

        message: "User registered successfully",

        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
        },
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error("REGISTER ERROR:", error);

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