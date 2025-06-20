export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      dvf_transactions: {
        Row: {
          id: string;
          date_mutation: string;
          nature_mutation: string;
          valeur_fonciere: number;
          adresse_numero?: string;
          adresse_suffixe?: string;
          adresse_nom_voie: string;
          code_postal: string;
          code_type_local: string;
          type_local: string;
          surface_reelle_bati?: number;
          nombre_pieces_principales?: number;
          surface_terrain?: number;
          longitude: number;
          latitude: number;
          created_at: string;
        };
        Insert: {
          id: string;
          date_mutation: string;
          nature_mutation: string;
          valeur_fonciere: number;
          adresse_numero?: string;
          adresse_suffixe?: string;
          adresse_nom_voie: string;
          code_postal: string;
          code_type_local?: string;
          type_local?: string;
          surface_reelle_bati?: number;
          nombre_pieces_principales?: number;
          surface_terrain?: number;
          longitude: number;
          latitude: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          date_mutation?: string;
          nature_mutation?: string;
          valeur_fonciere?: number;
          adresse_numero?: string;
          adresse_suffixe?: string;
          adresse_nom_voie?: string;
          code_postal?: string;
          code_type_local?: string;
          type_local?: string;
          surface_reelle_bati?: number;
          nombre_pieces_principales?: number;
          surface_terrain?: number;
          longitude?: number;
          latitude?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
