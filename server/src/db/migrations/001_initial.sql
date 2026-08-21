-- Run this in Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  region TEXT,
  language TEXT DEFAULT 'hi',
  bank_details_mock JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID REFERENCES artisans(id) ON DELETE CASCADE,
  title TEXT,
  story_en TEXT,
  story_native TEXT,
  seo_tags TEXT[],
  price_inr NUMERIC,
  price_usd NUMERIC,
  price_eur NUMERIC,
  price_gbp NUMERIC,
  hsn_code TEXT,
  hsn_confidence TEXT,
  content_hash TEXT,
  ondc_synced BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  craft_type TEXT,
  region_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  raw_url TEXT,
  enhanced_url TEXT
);

CREATE TABLE IF NOT EXISTS passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  qr_url TEXT,
  content_hash TEXT,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  preferred_currency TEXT DEFAULT 'INR',
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  buyer_id UUID REFERENCES buyers(id),
  buyer_email TEXT,
  amount NUMERIC,
  currency TEXT,
  amount_inr NUMERIC,
  razorpay_order_id TEXT,
  status TEXT DEFAULT 'pending',
  gift_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT,
  note TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'held',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_entry_id UUID REFERENCES escrow_entries(id),
  artisan_id UUID REFERENCES artisans(id),
  amount_inr NUMERIC,
  status TEXT DEFAULT 'pending',
  efira_pdf_url TEXT,
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  buyer_id UUID REFERENCES buyers(id),
  product_id UUID REFERENCES products(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hsn_codes (
  id SERIAL PRIMARY KEY,
  code TEXT,
  description TEXT,
  category TEXT,
  embedding vector(768)
);

CREATE OR REPLACE FUNCTION match_hsn_codes(
  query_embedding vector(768),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id int,
  code text,
  description text,
  category text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT id, code, description, category,
    1 - (embedding <=> query_embedding) AS similarity
  FROM hsn_codes
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
