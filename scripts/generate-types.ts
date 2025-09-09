import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function generateTypes() {
  const { data, error } = await supabase.rpc('get_types', {});
  
  if (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }

  const types = `// This file is auto-generated. Do not edit manually.
// To regenerate, run: npm run generate:types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: ${JSON.stringify(data.Tables, null, 2)}
    Views: ${JSON.stringify(data.Views, null, 2)}
    Functions: ${JSON.stringify(data.Functions, null, 2)}
    Enums: ${JSON.stringify(data.Enums, null, 2)}
  }
}
`;

  const typesPath = join(__dirname, '../src/types/supabase.ts');
  writeFileSync(typesPath, types, 'utf8');
  
  console.log('Types generated successfully!');
  process.exit(0);
}

generateTypes().catch(console.error);
