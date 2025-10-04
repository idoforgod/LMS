-- Migration: Create submission and grading tables (submissions, grades)
-- Created: 2025-10-04

-- submissions table
CREATE TABLE submissions (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  link VARCHAR(500),
  status VARCHAR(30) NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'graded', 'resubmission_required')),
  is_late BOOLEAN NOT NULL DEFAULT false,
  score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, user_id)
);

CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_late ON submissions(is_late) WHERE is_late = true;
CREATE INDEX idx_submissions_ungraded ON submissions(assignment_id, status)
  WHERE status = 'submitted';

-- grades table
CREATE TABLE grades (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  total_score DECIMAL(6,2) NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_grades_user ON grades(user_id);
CREATE INDEX idx_grades_course ON grades(course_id);

-- Trigger function for automatic grade calculation
CREATE OR REPLACE FUNCTION calculate_grades()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO grades (user_id, course_id, total_score, calculated_at)
  SELECT
    NEW.user_id,
    a.course_id,
    COALESCE(SUM(s.score * a.weight / 100), 0),
    NOW()
  FROM submissions s
  JOIN assignments a ON a.id = s.assignment_id
  WHERE s.user_id = NEW.user_id
    AND s.status = 'graded'
    AND a.course_id = (SELECT course_id FROM assignments WHERE id = NEW.assignment_id)
  GROUP BY a.course_id
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET
    total_score = EXCLUDED.total_score,
    calculated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply grade calculation trigger
CREATE TRIGGER submissions_graded_calculate_grades
  AFTER UPDATE OF status ON submissions
  FOR EACH ROW
  WHEN (NEW.status = 'graded')
  EXECUTE FUNCTION calculate_grades();
