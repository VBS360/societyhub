import { SupabaseClient } from '@supabase/supabase-js';

declare global {
  // This extends the global Window interface to include our Supabase client
  interface Window {
    supabase: SupabaseClient;
  }
}

// Export the Supabase client type for use in other files
export type { SupabaseClient };

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(fn: string, params?: Record<string, unknown>): Promise<{
      data: T;
      error: any;
    }>;
  }
}
