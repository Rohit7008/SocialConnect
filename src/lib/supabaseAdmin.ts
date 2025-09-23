import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

// Lazily allow build without envs; runtime calls will fail if used without proper envs
export const supabaseAdmin =
  url && key
    ? createClient(url, key)
    : (undefined as unknown as ReturnType<typeof createClient>);
