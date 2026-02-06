declare module 'https://deno.land/std@0.224.0/http/server.ts' {
  export type ServeInit = {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  };

  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: ServeInit
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.56.0' {
  export * from '@supabase/supabase-js';
}

interface DenoEnv {
  get(key: string): string | undefined;
}

declare const Deno: {
  env: DenoEnv;
};
