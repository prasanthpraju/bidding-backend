import { NextRequest, NextResponse } from "next/server";
import { Bidding } from "@/entities/bidding";
import { connectDB } from "@/lib/db";

import fs from "fs/promises";
import path from "path";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function generateBidCode() {
  const number = Math.floor(1000 + Math.random() * 9000);

  return `BI${number}`;
}

/* =========================
   CREATE BIDDING
========================= */

export async function POST(req: NextRequest) {
  try {
    const db = await connectDB();

    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    /* =========================
       READ FORM DATA
    ========================= */

    const formData = await req.formData();

    const name = formData.get("name");
    const pool = formData.get("pool");
    const members = formData.get("members");
    const duration = formData.get("duration");
    const durationType = formData.get("durationType");
    const upiId = formData.get("upiId");
    const qrCodeImage = formData.get("qrCodeImage");

    /* =========================
       VALIDATION
    ========================= */

    if (
      !name ||
      pool === null ||
      members === null ||
      duration === null ||
      !durationType ||
      !upiId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All required fields are required",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    /* =========================
       VALIDATE QR IMAGE
    ========================= */

    if (!(qrCodeImage instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment QR image is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (!qrCodeImage.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only image files are allowed",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    /* =========================
       FILE SIZE LIMIT
       5 MB
    ========================= */

    if (qrCodeImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "QR image must be less than 5MB",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    /* =========================
       GENERATE BID CODE
    ========================= */

    const repository = db.getRepository(Bidding);

    let bidCode = generateBidCode();

    let existing = await repository.findOne({
      where: {
        bidCode,
      },
    });

    while (existing) {
      bidCode = generateBidCode();

      existing = await repository.findOne({
        where: {
          bidCode,
        },
      });
    }

    /* =========================
       CREATE BIDDING FOLDER
       
       Bidding-Next-js/
       └── public/
           └── bidding/
    ========================= */

    const biddingFolder = path.join(process.cwd(), "public", "bidding");

    await fs.mkdir(biddingFolder, {
      recursive: true,
    });

    /* =========================
       GET FILE EXTENSION
    ========================= */

    const originalName = qrCodeImage.name;

    const extension = path.extname(originalName).toLowerCase() || ".png";

    /* =========================
       CREATE UNIQUE FILE NAME
       
       Example:
       BI1234.png
    ========================= */

    const fileName = `${bidCode}${extension}`;

    const filePath = path.join(biddingFolder, fileName);

    /* =========================
       SAVE ACTUAL IMAGE FILE
    ========================= */

    const arrayBuffer = await qrCodeImage.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(filePath, buffer);

    /* =========================
       DATABASE IMAGE PATH
       
       DB stores:
       /bidding/BI1234.png
       
       NOT Base64
    ========================= */

    const imagePath = `/bidding/${fileName}`;

    /* =========================
       CREATE DATABASE RECORD
    ========================= */

    const bidding = repository.create({
      bidCode,

      name: String(name).trim(),

      pool: Number(pool),

      members: Number(members),

      duration: Number(duration),

      durationType: String(durationType),

      upiId: String(upiId).trim(),

      qrCodeImage: imagePath,

      // UUID user ID
      userId,
    });

    const saved = await repository.save(bidding);

    /* =========================
       SUCCESS
    ========================= */

    return NextResponse.json(
      {
        success: true,
        data: saved,
      },
      {
        status: 201,
        headers: corsHeaders,
      },
    );
  } catch (error: any) {
    console.error("CREATE BIDDING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create bidding",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

/* =========================
   GET USER BIDDINGS
========================= */

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();

    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    const repository = db.getRepository(Bidding);

    const biddings = await repository.find({
      where: {
        userId,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: biddings,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error: any) {
    console.error("GET BIDDINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get biddings",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

/* =========================
   DELETE BIDDING
========================= */

export async function DELETE(req: NextRequest) {
  try {
    const db = await connectDB();

    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    const id = new URL(req.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Bidding ID is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const biddingId = Number(id);

    if (Number.isNaN(biddingId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid bidding ID",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const repository = db.getRepository(Bidding);

    const bidding = await repository.findOne({
      where: {
        id: String(biddingId),
        userId,
      },
    });

    if (!bidding) {
      return NextResponse.json(
        {
          success: false,
          error: "Bidding not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    /* =========================
       DELETE IMAGE FILE
    ========================= */

    if (bidding.qrCodeImage) {
      try {
        const imagePath = path.join(
          process.cwd(),
          "public",
          bidding.qrCodeImage.replace(/^\/+/, ""),
        );

        await fs.unlink(imagePath);
      } catch (fileError: any) {
        console.warn("QR IMAGE DELETE WARNING:", fileError?.message);
      }
    }

    /* =========================
       DELETE DATABASE RECORD
    ========================= */

    await repository.remove(bidding);

    return NextResponse.json(
      {
        success: true,
        message: "Bidding deleted successfully",
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error: any) {
    console.error("DELETE BIDDING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete bidding",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
