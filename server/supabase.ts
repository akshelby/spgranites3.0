import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://fstyxfuyploifiouotni.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function initSiteSettingsTable() {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`
    });
    if (error) {
      console.log('site_settings table init via RPC failed (may need manual creation):', error.message);
      const { data, error: checkError } = await supabase.from('site_settings').select('key').limit(1);
      if (checkError && checkError.code === '42P01') {
        console.warn('site_settings table does not exist. Please create it in Supabase SQL editor:');
        console.warn('CREATE TABLE site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT \'\', updated_at TIMESTAMPTZ DEFAULT NOW());');
      } else {
        console.log('site_settings table already exists or accessible');
      }
    } else {
      console.log('site_settings table ready');
    }
  } catch (err) {
    console.log('site_settings init check skipped');
  }
}
