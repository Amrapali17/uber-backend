import { createClient } from "@supabase/supabase-js";

console.log("Checking environment variables in supabaseClient.js...");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Supabase environment variables are missing!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
