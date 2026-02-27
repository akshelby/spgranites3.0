CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on site_settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access on site_settings"
  ON site_settings FOR ALL
  USING (true);

INSERT INTO site_settings (key, value) VALUES
  ('phone_primary', '+91 9731963999'),
  ('phone_secondary', '+91 9741913111'),
  ('whatsapp_number', '918892509650'),
  ('email_primary', 'spgranites999@gmail.com'),
  ('email_secondary', 'srajith9999@gmail.com'),
  ('address_line1', '123 Stone Avenue, Industrial Area'),
  ('address_line2', 'Chennai, Tamil Nadu 600001'),
  ('working_hours_weekday', 'Mon - Sat: 9:00 AM - 7:00 PM'),
  ('working_hours_sunday', 'Sunday: By Appointment Only'),
  ('social_facebook', 'https://facebook.com'),
  ('social_instagram', 'https://instagram.com'),
  ('social_twitter', 'https://twitter.com'),
  ('social_youtube', 'https://youtube.com'),
  ('company_name', 'SP Granites'),
  ('company_tagline', 'Premium Stone Works'),
  ('map_embed_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.2649!2d76.9558!3d11.0168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAxJzAwLjUiTiA3NsKwNTcnMjAuOSJF!5e0!3m2!1sen!2sin!4v1')
ON CONFLICT (key) DO NOTHING;
