import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nyqlxxhdrkpsizpumpyy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cWx4eGhkcmtwc2l6cHVtcHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTA0NDIsImV4cCI6MjA2Njk2NjQ0Mn0.iLI3XhfT2gGaTMYbUX9Ph-GxGtCUzd6ikVHR80BigvA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});