-- Migration: Enable Row Level Security (RLS) policies
-- Created: 2025-10-04

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Users can view own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can view other users' basic info (for instructor info display)
CREATE POLICY "Users can view other profiles basic info"
  ON profiles FOR SELECT
  USING (true);

-- ============================================================
-- COURSES POLICIES
-- ============================================================

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (status = 'published');

-- Instructors can view own courses (all statuses)
CREATE POLICY "Instructors can view own courses"
  ON courses FOR SELECT
  USING (auth.uid() = instructor_id);

-- Instructors can create courses
CREATE POLICY "Instructors can create courses"
  ON courses FOR INSERT
  WITH CHECK (
    auth.uid() = instructor_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'instructor'
    )
  );

-- Instructors can update own courses
CREATE POLICY "Instructors can update own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = instructor_id);

-- Instructors can delete own courses
CREATE POLICY "Instructors can delete own courses"
  ON courses FOR DELETE
  USING (auth.uid() = instructor_id);

-- ============================================================
-- ENROLLMENTS POLICIES
-- ============================================================

-- Learners can view own enrollments
CREATE POLICY "Learners can view own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Learners can create own enrollments (enroll in courses)
CREATE POLICY "Learners can create own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'learner'
    )
  );

-- Learners can delete own enrollments (unenroll from courses)
CREATE POLICY "Learners can delete own enrollments"
  ON enrollments FOR DELETE
  USING (auth.uid() = user_id);

-- Instructors can view enrollments of their courses
CREATE POLICY "Instructors can view course enrollments"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================
-- ASSIGNMENTS POLICIES
-- ============================================================

-- Learners can view published assignments of enrolled courses
CREATE POLICY "Learners can view published assignments of enrolled courses"
  ON assignments FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignments.course_id
        AND enrollments.user_id = auth.uid()
    )
  );

-- Instructors can view all assignments of own courses
CREATE POLICY "Instructors can view assignments of own courses"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignments.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can create assignments for own courses
CREATE POLICY "Instructors can create assignments for own courses"
  ON assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignments.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can update assignments of own courses
CREATE POLICY "Instructors can update assignments of own courses"
  ON assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignments.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- Instructors can delete assignments of own courses
CREATE POLICY "Instructors can delete assignments of own courses"
  ON assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignments.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================
-- SUBMISSIONS POLICIES
-- ============================================================

-- Learners can view own submissions
CREATE POLICY "Learners can view own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Learners can create own submissions
CREATE POLICY "Learners can create own submissions"
  ON submissions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'learner'
    )
  );

-- Learners can update own submissions (resubmission)
CREATE POLICY "Learners can update own submissions"
  ON submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Instructors can view submissions of own courses
CREATE POLICY "Instructors can view submissions of own courses"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = submissions.assignment_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Instructors can update submissions of own courses (grading)
CREATE POLICY "Instructors can update submissions of own courses"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = submissions.assignment_id
        AND c.instructor_id = auth.uid()
    )
  );

-- ============================================================
-- GRADES POLICIES
-- ============================================================

-- Learners can view own grades
CREATE POLICY "Learners can view own grades"
  ON grades FOR SELECT
  USING (auth.uid() = user_id);

-- Instructors can view grades of own courses
CREATE POLICY "Instructors can view grades of own courses"
  ON grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = grades.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- ============================================================
-- REPORTS POLICIES
-- ============================================================

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view own reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Operators can view all reports
CREATE POLICY "Operators can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'operator'
    )
  );

-- Operators can update reports (investigation and resolution)
CREATE POLICY "Operators can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'operator'
    )
  );
