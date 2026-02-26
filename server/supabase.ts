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
    const { data, error } = await supabase.from('site_settings').select('key').limit(1);
    if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
      console.warn('[site_settings] Table does not exist in Supabase. Attempting to create...');
      const created = await createSiteSettingsTable();
      if (!created) {
        console.warn('[site_settings] Auto-creation failed. Please run this SQL in your Supabase SQL Editor:');
        console.warn(`CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON public.site_settings FOR ALL USING (true);`);
      }
    } else {
      console.log('[site_settings] Table ready');
    }
  } catch (err) {
    console.log('[site_settings] Init check error:', err);
  }
}

async function createSiteSettingsTable(): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const sql = `
    CREATE TABLE IF NOT EXISTS public.site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow public read') THEN
        CREATE POLICY "Allow public read" ON public.site_settings FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Allow service role full access') THEN
        CREATE POLICY "Allow service role full access" ON public.site_settings FOR ALL USING (true);
      END IF;
    END $$;
  `;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });
    if (res.ok) {
      console.log('[site_settings] Table created via RPC');
      return true;
    }
  } catch {}

  try {
    const { Client } = await import('pg');
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    if (dbPassword) {
      const client = new Client({
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: dbPassword,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      await client.query(sql);
      await client.end();
      console.log('[site_settings] Table created via direct Postgres');
      return true;
    }
  } catch {}

  return false;
}
