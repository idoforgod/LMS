-- Migration: Create metadata tables (categories, difficulties)
-- Created: 2025-10-04

-- categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- difficulties table
CREATE TABLE difficulties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  level INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('Programming'),
  ('Design'),
  ('Business'),
  ('Language'),
  ('Data Science');

-- Insert default difficulties
INSERT INTO difficulties (name, level) VALUES
  ('Beginner', 1),
  ('Intermediate', 2),
  ('Advanced', 3);
