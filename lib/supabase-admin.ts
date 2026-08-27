import { createClient } from "@supabase/supabase-js";

// PENTING: client ini pakai service_role key, cuma boleh dipakai di server
// (API routes / Server Components), JANGAN PERNAH diimport ke komponen client.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);