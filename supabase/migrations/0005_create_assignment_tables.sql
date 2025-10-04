-- Migration: Create assignment-related tables (assignments)
-- Created: 2025-10-04

-- assignments table
CREATE TABLE assignments (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  weight DECIMAL(5,2) NOT NULL CHECK (weight >= 0 AND weight <= 100),
  allow_late BOOLEAN NOT NULL DEFAULT false,
  allow_resubmission BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_published ON assignments(course_id, status)
  WHERE status = 'published';

-- Apply updated_at trigger to assignments
CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
