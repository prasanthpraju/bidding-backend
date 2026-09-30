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

    console.log("FETCH BIDDING UUID:", id);

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
        data: bidding,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("GET BIDDING BY UUID ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bidding",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
