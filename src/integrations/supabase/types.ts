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
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          cpf: string | null;
          membership_status: "ativo" | "inadimplente" | "suspenso";
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          cpf?: string | null;
          membership_status?: "ativo" | "inadimplente" | "suspenso";
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          cpf?: string | null;
          membership_status?: "ativo" | "inadimplente" | "suspenso";
          is_admin?: boolean;
          created_at?: string;
        };
      };
      facilities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          capacity: number;
          rating: number;
          image_url: string | null;
          rules: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          capacity?: number;
          rating?: number;
          image_url?: string | null;
          rules?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          capacity?: number;
          rating?: number;
          image_url?: string | null;
          rules?: string | null;
          created_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          user_id: string;
          facility_id: string;
          reservation_date: string;
          start_time: string;
          end_time: string;
          status: "pendente" | "aprovada" | "recusada";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          facility_id: string;
          reservation_date: string;
          start_time: string;
          end_time: string;
          status?: "pendente" | "aprovada" | "recusada";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          facility_id?: string;
          reservation_date?: string;
          start_time?: string;
          end_time?: string;
          status?: "pendente" | "aprovada" | "recusada";
          notes?: string | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          location: string | null;
          status: "aberto" | "em breve" | "encerrado";
          max_attendees: number | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          location?: string | null;
          status?: "aberto" | "em breve" | "encerrado";
          max_attendees?: number | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          location?: string | null;
          status?: "aberto" | "em breve" | "encerrado";
          max_attendees?: number | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      photo_albums: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_url?: string | null;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          album_id: string;
          uploaded_by: string | null;
          url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          uploaded_by?: string | null;
          url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          uploaded_by?: string | null;
          url?: string;
          caption?: string | null;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: number;
          hero_badge: string | null;
          hero_title: string | null;
          hero_title_accent: string | null;
          hero_subtitle: string | null;
          hero_image_url: string | null;
          editor_title: string | null;
          editor_description: string | null;
        };
        Insert: {
          id?: number;
          hero_badge?: string | null;
          hero_title?: string | null;
          hero_title_accent?: string | null;
          hero_subtitle?: string | null;
          hero_image_url?: string | null;
          editor_title?: string | null;
          editor_description?: string | null;
        };
        Update: {
          id?: number;
          hero_badge?: string | null;
          hero_title?: string | null;
          hero_title_accent?: string | null;
          hero_subtitle?: string | null;
          hero_image_url?: string | null;
          editor_title?: string | null;
          editor_description?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
