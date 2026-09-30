import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/database";
import { Participant } from "@/entities/participant";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Credentials": "true",
};

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      participantId: string;
    }>;
  },
) {
  try {
    const db = connectDB;

    if (!db.isInitialized) {
      await db.initialize();
    }

    const participantRepository =
      db.getRepository(Participant);

    const { participantId } = await context.params;

    const participant =
      await participantRepository.findOne({
        where: {
          id: participantId,
        },
      });

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          error: "Participant not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    participant.status = "Verified";

    const updatedParticipant =
      await participantRepository.save(participant);

    return NextResponse.json(
      {
        success: true,
        message: "Participant verified successfully",
        data: updatedParticipant,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error(
      "VERIFY PARTICIPANT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify participant",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}