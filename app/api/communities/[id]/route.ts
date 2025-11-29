import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Community from "@/app/models/community";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = context.params;

    const community = await Community.findById(id);

    if (!community) {
      return NextResponse.json(
        { success: false, error: "Community not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: community },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching community:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
