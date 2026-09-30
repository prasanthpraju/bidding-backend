import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import { Bidding } from "@/entities/bidding";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Credentials": "true",
};

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const db = connectDB;

    if (!db.isInitialized) {
      await db.initialize();
    }

    const biddingRepository = db.getRepository(Bidding);

    const { id } = await context.params;

    console.log("REGISTRATION BIDDING UUID:", id);

    const bidding = await biddingRepository.findOne({
      where: {
        id,
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: bidding.id,
          bidCode: bidding.bidCode,
          name: bidding.name,
          pool: bidding.pool,
          members: bidding.members,
          duration: bidding.duration,
          durationType: bidding.durationType,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error(
      "REGISTRATION LOOKUP ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bidding details",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}