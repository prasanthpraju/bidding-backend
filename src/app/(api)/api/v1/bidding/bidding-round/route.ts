import { NextRequest, NextResponse } from "next/server";
import { BiddingRound } from "@/entities/bidding-round";
import { Bidding } from "@/entities/bidding";
import { connectDB } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/* =========================
   GET BIDDING ROUNDS
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

    const biddingId = new URL(req.url).searchParams.get("biddingId");

    if (!biddingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing biddingId",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const parsedBiddingId = Number(biddingId);

    if (Number.isNaN(parsedBiddingId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid biddingId",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const biddingRepository = db.getRepository(Bidding);

    const bidding = await biddingRepository.findOne({
      where: {
        id: String(parsedBiddingId),

        // UUID string
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

    const roundRepository = db.getRepository(BiddingRound);

    const rounds = await roundRepository.find({
      where: {
        biddingId: String(parsedBiddingId),
      },
      order: {
        roundNumber: "ASC",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: rounds,
        bidding,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error: any) {
    console.error("GET /bidding-round ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to get bidding rounds",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

/* =========================
   CREATE BIDDING ROUND
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

    const body = await req.json();

    const { biddingId, bidAmount } = body;

    if (
      biddingId === undefined ||
      biddingId === null ||
      bidAmount === undefined ||
      bidAmount === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing biddingId or bidAmount",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const parsedBiddingId = Number(biddingId);
    const parsedBidAmount = Number(bidAmount);

    if (Number.isNaN(parsedBiddingId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid biddingId",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    if (Number.isNaN(parsedBidAmount)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid bidAmount",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const biddingRepository = db.getRepository(Bidding);

    const bidding = await biddingRepository.findOne({
      where: {
        id: String(parsedBiddingId),

        // UUID string
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

    const roundRepository = db.getRepository(BiddingRound);

    const lastRound = await roundRepository.findOne({
      where: {
        biddingId: String(parsedBiddingId),
      },
      order: {
        roundNumber: "DESC",
      },
    });

    const roundNumber = (lastRound?.roundNumber || 0) + 1;

    const round = roundRepository.create({
      biddingId: String(parsedBiddingId),
      roundNumber,
      bidAmount: parsedBidAmount,
      winnerId: null,
    });

    const savedRound = await roundRepository.save(round);

    return NextResponse.json(
      {
        success: true,
        data: savedRound,
      },
      {
        status: 201,
        headers: corsHeaders,
      },
    );
  } catch (error: any) {
    console.error("POST /bidding-round ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to create bidding round",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
