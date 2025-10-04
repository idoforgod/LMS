-- Migration: Create course-related tables (courses, enrollments)
-- Created: 2025-10-04

-- courses table
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  difficulty_id INTEGER REFERENCES difficulties(id),
  curriculum TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_difficulty ON courses(difficulty_id);
CREATE INDEX idx_courses_published ON courses(status) WHERE status = 'published';

-- Apply updated_at trigger to courses
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- enrollments table
CREATE TABLE enrollments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
