import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parse } from "https://deno.land/std@0.168.0/encoding/csv.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DVFTransaction {
  id_mutation: string;
  date_mutation: string;
  nature_mutation: string;
  valeur_fonciere: string;
  adresse_numero: string;
  adresse_suffixe: string;
  adresse_nom_voie: string;
  code_postal: string;
  code_commune: string;
  nom_commune: string;
  code_departement: string;
  id_parcelle: string;
  type_local: string;
  surface_reelle_bati: string;
  nombre_pieces_principales: string;
  surface_terrain: string;
  longitude: string;
  latitude: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch DVF+ data for Ivry-sur-Seine (94041)
    const response = await fetch(
      "https://files.data.gouv.fr/geo-dvf/latest/communes/94041.csv"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch DVF data: ${response.statusText}`);
    }

    const csvText = await response.text();
    const records = (await parse(csvText, {
      skipFirstRow: true,
      columns: true,
    })) as DVFTransaction[];

    // Process and insert records
    const transformedRecords = records.map((record) => ({
      date_mutation: record.date_mutation,
      nature_mutation: record.nature_mutation,
      valeur_fonciere: parseFloat(record.valeur_fonciere),
      adresse_numero: record.adresse_numero,
      adresse_suffixe: record.adresse_suffixe,
      adresse_nom_voie: record.adresse_nom_voie,
      code_postal: record.code_postal,
      code_commune: record.code_commune,
      nom_commune: record.nom_commune,
      code_departement: record.code_departement,
      id_parcelle: record.id_parcelle,
      type_local: record.type_local,
      surface_reelle_bati: record.surface_reelle_bati
        ? parseFloat(record.surface_reelle_bati)
        : null,
      nombre_pieces_principales: record.nombre_pieces_principales
        ? parseInt(record.nombre_pieces_principales)
        : null,
      surface_terrain: record.surface_terrain
        ? parseFloat(record.surface_terrain)
        : null,
      longitude: parseFloat(record.longitude),
      latitude: parseFloat(record.latitude),
    }));

    // Clear existing data and insert new records
    const { error: deleteError } = await supabaseClient
      .from("dvf_transactions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (deleteError) {
      throw deleteError;
    }

    const { error: insertError } = await supabaseClient
      .from("dvf_transactions")
      .insert(transformedRecords);

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        recordCount: transformedRecords.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
