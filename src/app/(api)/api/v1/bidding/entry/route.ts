import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import { Participant } from "@/entities/participant";

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

    const body = await request.json();

    const { biddingId, phoneNumber } = body;

    if (!biddingId || !phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Bidding ID and phone number are required",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const participantRepository = db.getRepository(Participant);

    const participant = await participantRepository.findOne({
      where: {
        biddingId,
        phoneNumber,
      },
    });

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          message: "Participant not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    if (participant.status !== "Verified") {
      return NextResponse.json(
        {
          success: false,
          message: "Your participation has not been verified yet",
        },
        {
          status: 403,
          headers: corsHeaders,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bidding access granted",
        data: {
          participantId: participant.id,
          fullName: participant.fullName,
          biddingId: participant.biddingId,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("BIDDING ENTRY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify bidding access",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}