import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import * as fs from "fs/promises";
import { createClient } from "@/lib/supabase";

interface Property {
  id: string;
  price: number;
  address: string;
  city: string;
  postalCode: string;
  type: string;
  rooms?: number;
  area?: number;
  latitude?: number;
  longitude?: number;
  date: string;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface PaginatedResponse {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

let cachedProperties: any[] | null = null;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const parsePrice = (value: string | undefined): number => {
  if (!value) return 0;
  try {
    return parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
  } catch (error) {
    console.warn("Error parsing price:", error);
    return 0;
  }
};

const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  try {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  } catch (error) {
    console.warn("Error parsing number:", error);
    return undefined;
  }
};

async function geocodeAddress(
  address: string,
  postalCode: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    // Add a delay to respect rate limiting (1 request per second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Clean and format the address
    const cleanAddress = address
      .replace(/^(\d+)\s*,\s*/, "$1 ") // Fix number formatting
      .replace(/\s+/g, " ") // Remove extra spaces
      .trim();

    // Try first with full address
    const searchQuery = encodeURIComponent(
      `${cleanAddress}, ${postalCode} Ivry-sur-Seine, France`
    );

    console.log(`Geocoding attempt for: ${cleanAddress}, ${postalCode}`);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1&countrycodes=fr`,
      {
        headers: {
          "User-Agent": "HomesIvry/1.0",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Geocoding request failed for address: ${cleanAddress}`, {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const results = (await response.json()) as GeocodingResult[];

    if (results.length === 0) {
      // If no results, try with a simpler query (just street name and city)
      const simpleAddress = cleanAddress.replace(/^\d+\s*/, ""); // Remove street number
      const simpleQuery = encodeURIComponent(
        `${simpleAddress}, Ivry-sur-Seine, France`
      );

      console.log(`Retrying with simpler query: ${simpleAddress}`);

      const secondResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${simpleQuery}&format=json&limit=1&countrycodes=fr`,
        {
          headers: {
            "User-Agent": "HomesIvry/1.0",
          },
        }
      );

      if (!secondResponse.ok) {
        console.warn(`Second geocoding attempt failed for: ${simpleAddress}`);
        return null;
      }

      const secondResults = (await secondResponse.json()) as GeocodingResult[];

      if (secondResults.length === 0) {
        console.warn(`No results found for either query:`, {
          originalAddress: cleanAddress,
          simpleAddress: simpleAddress,
        });
        return null;
      }

      return {
        lat: parseFloat(secondResults[0].lat),
        lon: parseFloat(secondResults[0].lon),
      };
    }

    return {
      lat: parseFloat(results[0].lat),
      lon: parseFloat(results[0].lon),
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
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
