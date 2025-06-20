import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xwzcurcposvfbiilrqck.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3emN1cmNwb3N2ZmJpaWxycWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjQ3MTEsImV4cCI6MjA2NTkwMDcxMX0.f6h7Sdmp9-5dizI5JSjzjiNe-Jsmi9r0awdrLMafpiI";

async function geocodeProperties() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Get total count of properties without coordinates
    const { count } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .is("latitude", null);

    console.log(`Found ${count} properties without coordinates`);

    // Keep invoking the function until all properties are geocoded
    while (true) {
      const response = await fetch(
        "https://xwzcurcposvfbiilrqck.supabase.co/functions/v1/geocode-properties",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to invoke function: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(
        `Processed ${result.processed} properties, updated ${result.updated}`
      );

      // Check if there are any properties left to geocode
      const { count: remaining } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .is("latitude", null);

      console.log(`${remaining} properties remaining`);

      if (remaining === 0) {
        console.log("All properties have been geocoded!");
        break;
      }

      // Wait 10 seconds before next batch to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

geocodeProperties();
