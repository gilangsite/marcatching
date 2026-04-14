-- ============================================================
-- ARTICLE SYSTEM MIGRATION
-- Run this in Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/tzxfbtqgotceoyqdxreq/sql/new
-- ============================================================

-- 1. Article Categories
CREATE TABLE IF NOT EXISTS article_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT article_categories_name_unique UNIQUE (name),
  CONSTRAINT article_categories_slug_unique UNIQUE (slug)
);

-- 2. Article Authors
CREATE TABLE IF NOT EXISTS article_authors (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  photo_url  text,
  created_at timestamptz DEFAULT now()
);

-- 3. Articles
CREATE TABLE IF NOT EXISTS articles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL,
  status       text NOT NULL DEFAULT 'draft',   -- 'draft' | 'published' | 'unpublished'
  category_id  uuid REFERENCES article_categories(id) ON DELETE SET NULL,
  author_id    uuid REFERENCES article_authors(id) ON DELETE SET NULL,
  view_count   integer NOT NULL DEFAULT 0,
  content      jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_urls   text[] DEFAULT ARRAY[]::text[],
  excerpt      text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  published_at timestamptz,
  CONSTRAINT articles_slug_unique UNIQUE (slug),
  CONSTRAINT articles_status_check CHECK (status IN ('draft', 'published', 'unpublished'))
);

-- 4. Auto-update updated_at on article save
CREATE OR REPLACE FUNCTION update_article_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_articles_updated_at ON articles;
CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_article_updated_at();

-- 5. Auto-set published_at when status changes to 'published'
CREATE OR REPLACE FUNCTION set_article_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_articles_published_at ON articles;
CREATE TRIGGER trg_articles_published_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_article_published_at();

-- 6. RLS — allow anon read for published articles, admin full access
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_authors    ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles           ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read categories"
  ON article_categories FOR SELECT TO anon USING (true);

CREATE POLICY "Public can read authors"
  ON article_authors FOR SELECT TO anon USING (true);

CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT TO anon
  USING (status = 'published');

-- Service role full access (used by admin API routes)
CREATE POLICY "Service role full access categories"
  ON article_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access authors"
  ON article_authors FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access articles"
  ON articles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon can increment view_count (via UPDATE only on view_count column)
CREATE POLICY "Anon can increment view count"
  ON articles FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Verify tables were created
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('articles', 'article_categories', 'article_authors');
