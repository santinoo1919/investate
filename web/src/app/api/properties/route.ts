import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();

  try {
    const { data: properties, error } = await supabase
      .from("properties")
      .select(
        `
        *,
        price_history (
          price,
          transaction_date
        )
      `
      )
      .order("transaction_date", {
        foreignTable: "price_history",
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
