// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vhzuisrsrnxofuxyymfa.supabase.co/rest/v1/";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoenVpc3Jzcm54b2Z1eHl5bWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDQ4NzYsImV4cCI6MjA5NDg4MDg3Nn0.x49X7CGO0Qill0a6wZ1HDQIZY4rjkzt60J1lzGfxj1o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
