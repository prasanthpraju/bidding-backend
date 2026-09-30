import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import { Bidding } from "@/entities/bidding";
import { Participant } from "@/entities/participant";
import fs from "fs/promises";
import path from "path";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Credentials": "true",
};

export async function POST(request: NextRequest) {
  try {
    const db = connectDB;

    if (!db.isInitialized) {
      await db.initialize();
    }

    const biddingRepository = db.getRepository(Bidding);
    const participantRepository = db.getRepository(Participant);

    const formData = await request.formData();

    const fullName = formData.get("fullName") as string | null;
    const photo = formData.get("photo") as File | null;
    const idProof = formData.get("idProof") as File | null;
    const age = formData.get("age") as string | null;
    const gender = formData.get("gender") as string | null;
    const phoneNumber = formData.get("phoneNumber") as string | null;
    const whatsappNumber = formData.get("whatsappNumber") as string | null;

    // IMPORTANT: This is now the Bidding UUID
    const biddingId = formData.get("biddingId") as string | null;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !fullName ||
      !age ||
      !gender ||
      !phoneNumber ||
      !whatsappNumber ||
      !biddingId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "All required fields must be provided",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // ==========================================
    // FIND BIDDING USING UUID
    // ==========================================

    const bidding = await biddingRepository.findOne({
      where: {
        id: biddingId,
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

    // ==========================================
    // CREATE UPLOAD DIRECTORY
    // ==========================================

    const uploadDirectory = path.join(process.cwd(), "public", "participants");

    await fs.mkdir(uploadDirectory, {
      recursive: true,
    });

    let photoPath: string | null = null;
    let idProofPath: string | null = null;

    // ==========================================
    // SAVE PHOTO
    // ==========================================

    if (photo && photo.size > 0) {
      const photoExtension = path.extname(photo.name) || ".jpg";

      const photoFileName = `participant-photo-${crypto.randomUUID()}${photoExtension}`;

      const photoFilePath = path.join(uploadDirectory, photoFileName);

      const photoBuffer = Buffer.from(await photo.arrayBuffer());

      await fs.writeFile(photoFilePath, photoBuffer);

      photoPath = `/participants/${photoFileName}`;
    }

    // ==========================================
    // SAVE ID PROOF
    // ==========================================

    if (idProof && idProof.size > 0) {
      const idProofExtension = path.extname(idProof.name) || ".jpg";

      const idProofFileName = `id-proof-${crypto.randomUUID()}${idProofExtension}`;

      const idProofFilePath = path.join(uploadDirectory, idProofFileName);

      const idProofBuffer = Buffer.from(await idProof.arrayBuffer());

      await fs.writeFile(idProofFilePath, idProofBuffer);

      idProofPath = `/participants/${idProofFileName}`;
    }

    // ==========================================
    // CREATE PARTICIPANT
    // ==========================================

    const participant = participantRepository.create({
      fullName,
      photo: photoPath,
      idProof: idProofPath,
      age: Number(age),
      gender,
      phoneNumber,
      whatsappNumber,

      // Exact bidding UUID
      biddingId: bidding.id,

      // Default values
      status: "Pending",
      isWinner: false,
    });

    const savedParticipant = await participantRepository.save(participant);

    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message: "Participant registered successfully",
        data: savedParticipant,
      },
      {
        status: 201,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("PARTICIPANT REGISTRATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to register participant",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = connectDB;

    if (!db.isInitialized) {
      await db.initialize();
    }

    const participantRepository = db.getRepository(Participant);

    const { searchParams } = new URL(request.url);

    const biddingId = searchParams.get("biddingId");

    if (!biddingId) {
      return NextResponse.json(
        {
          success: false,
          error: "biddingId is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const participants = await participantRepository.find({
      where: {
        biddingId,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: participants,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("GET PARTICIPANTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch participants",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
