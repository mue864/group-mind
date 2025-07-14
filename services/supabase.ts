import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jbfvkkpoawlocmyavwve.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnZra3BvYXdsb2NteWF2d3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDQ0MzIsImV4cCI6MjA2NzAyMDQzMn0.czeFfy5jY6u6qnSerEfgZUMopPT4TwCNWOQK49Ux2-s";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    }
  }
});
