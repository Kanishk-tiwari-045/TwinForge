import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hfduzkjpzvowjzrkeagp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZHV6a2pwenZvd2p6cmtlYWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMzIzMjksImV4cCI6MjA1ODgwODMyOX0.1F0lhUhrzh84r1QP64ta0utUyztSqvnjPBcnUujGtaE";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);