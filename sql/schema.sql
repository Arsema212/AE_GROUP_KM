-- AE Trade Group KMS PostgreSQL schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')) DEFAULT 'staff',
  expertise TEXT[] DEFAULT ARRAY[]::TEXT[],
  region TEXT,
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE knowledge_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('document', 'faq', 'sop', 'training', 'insight')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  language TEXT NOT NULL DEFAULT 'en',
  region TEXT DEFAULT 'national',
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'review')) DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  file_path TEXT, -- Path to uploaded file if any
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE lessons_learned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  outcome TEXT NOT NULL,
  recommendation TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  language TEXT NOT NULL DEFAULT 'en',
  region TEXT DEFAULT 'national',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type TEXT NOT NULL CHECK (target_type IN ('knowledge_item', 'lesson_learned')),
  target_id UUID NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type TEXT NOT NULL CHECK (target_type IN ('knowledge_item', 'lesson_learned')),
  target_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value = 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (target_type, target_id, user_id)
);

CREATE INDEX idx_knowledge_tags ON knowledge_items USING GIN (tags);
CREATE INDEX idx_lessons_tags ON lessons_learned USING GIN (tags);
CREATE INDEX idx_user_expertise ON users USING GIN (expertise);
