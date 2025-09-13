import { createClient } from "@supabase/supabase-js";

// Only read from process.env; do NOT rely on dotenv in production
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Supabase environment variables are missing!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
