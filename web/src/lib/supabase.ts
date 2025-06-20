import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const projectId = "xwzcurcposvfbiilrqck";
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3emN1cmNwb3N2ZmJpaWxycWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjQ3MTEsImV4cCI6MjA2NTkwMDcxMX0.f6h7Sdmp9-5dizI5JSjzjiNe-Jsmi9r0awdrLMafpiI";

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey);
};
