CREATE TABLE IF NOT EXISTS completed_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url TEXT,
  media_type TEXT DEFAULT 'image',
  stone_type TEXT,
  category TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  city TEXT,
  area TEXT,
  description TEXT,
  completion_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE completed_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on active completed_works"
  ON completed_works FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow service role full access on completed_works"
  ON completed_works FOR ALL
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('completed-works', 'completed-works', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read on completed-works bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'completed-works');

CREATE POLICY "Allow authenticated upload on completed-works bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'completed-works');
