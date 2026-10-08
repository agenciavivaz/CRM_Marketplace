// Gerado pelo Supabase (generate_typescript_types). Não editar à mão — regenerar após cada migration.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity: string | null;
          entity_id: string | null;
          id: number;
          metadata: Json;
          org_id: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: never;
          metadata?: Json;
          org_id: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: never;
          metadata?: Json;
          org_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_log_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      memberships: {
        Row: {
          created_at: string;
          org_id: string;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          org_id: string;
          role: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          org_id?: string;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'memberships_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          settings: Json;
          slug: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          settings?: Json;
          slug: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          settings?: Json;
          slug?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      platform_admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_organization: {
        Args: { p_name: string };
        Returns: {
          created_at: string;
          id: string;
          name: string;
          settings: Json;
          slug: string;
          timezone: string;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'organizations';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database['public'];
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
