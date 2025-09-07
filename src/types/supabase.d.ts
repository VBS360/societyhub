import { SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    supabase: SupabaseClient;
  }
}

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: string, 
      params?: Record<string, unknown>
    ): Promise<{
      data: T | null;
      error: any;
    }>;
  }
}
