import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

interface Property {
  id: number;
  address: string;
  city: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
}

interface NominatimResponse {
  lat: string;
  lon: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Get Supabase client
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Get properties without coordinates
    const { data: properties, error: fetchError } = await supabaseClient
      .from("properties")
      .select("id, address, city, postal_code, latitude, longitude")
      .is("latitude", null)
      .limit(10); // Process in batches to avoid rate limits

    if (fetchError) {
      throw fetchError;
    }

    // Process each property
    for (const property of properties as Property[]) {
      try {
        // Construct search query
        const searchQuery = encodeURIComponent(
          `${property.address}, ${property.postal_code} ${property.city}, France`
        );

        // Call Nominatim API with a delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1`,
          {
            headers: {
              "User-Agent": "HomesIvry/1.0",
            },
          }
        );

        if (!response.ok) {
          console.error(
            `Geocoding failed for property ${property.id}: ${response.statusText}`
          );
          continue;
        }

        const results = (await response.json()) as NominatimResponse[];
        if (results.length === 0) {
          console.error(`No results found for property ${property.id}`);
          continue;
        }

        // Update property with coordinates
        const { error: updateError } = await supabaseClient
          .from("properties")
          .update({
            latitude: parseFloat(results[0].lat),
            longitude: parseFloat(results[0].lon),
            updated_at: new Date().toISOString(),
          })
          .eq("id", property.id);

        if (updateError) {
          console.error(
            `Failed to update property ${property.id}: ${updateError.message}`
          );
        }
      } catch (error) {
        console.error(`Error processing property ${property.id}: ${error}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${properties.length} properties`,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
