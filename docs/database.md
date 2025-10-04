# Database Schema & Data Flow

## 1. 데이터플로우 개요

### 1.1 회원가입 & 온보딩
```
User Input (email, password, role, name, phone)
  → Supabase Auth (auth.users)
  → profiles (id, role, name, phone, created_at)
  → terms_agreements (user_id, agreed_at)
```

### 1.2 코스 탐색 & 수강신청
```
Learner Input (search, filters, sort)
  → courses (WHERE status='published')
  → Course Detail
  → enrollments (user_id, course_id, enrolled_at)
```

### 1.3 코스 생성 & 관리 (Instructor)
```
Instructor Input (title, description, category, difficulty, curriculum)
  → courses (instructor_id, status='draft')
  → Status Transition (draft → published → archived)
  → Course Visibility Update
```

### 1.4 과제 생성 & 관리 (Instructor)
```
Instructor Input (title, description, due_date, weight, policies)
  → assignments (course_id, status='draft', allow_late, allow_resubmission)
  → Status Transition (draft → published → closed)
  → Assignment Visibility Update
```

### 1.5 과제 제출 (Learner)
```
Learner Input (text, link)
  → Validation (enrollment check, assignment status, due_date)
  → submissions (assignment_id, user_id, content, link, status, is_late)
  → Dashboard Update (pending submissions count)
```

### 1.6 채점 & 피드백 (Instructor)
```
Instructor Input (score, feedback, resubmission_required)
  → submissions (score, feedback, status='graded'|'resubmission_required', graded_at)
  → Grades Calculation (assignment weight × score)
  → Learner Dashboard Update (recent feedback)
```

### 1.7 성적 조회 (Learner)
```
Learner Request
  → submissions (WHERE user_id AND graded)
  → Aggregate (SUM(score × weight) per course)
  → grades (user_id, course_id, total_score, calculated_at)
```

### 1.8 신고 처리 (Operator)
```
Operator Input (target_type, target_id, reason, description)
  → reports (reporter_id, status='received')
  → Investigation (status='investigating')
  → Action (status='resolved', action_taken)
```

---

## 2. PostgreSQL 데이터베이스 스키마

### 2.1 인증 & 사용자 관리

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'instructor', 'operator')),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
```

#### terms_agreements
```sql
CREATE TABLE terms_agreements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_terms_user ON terms_agreements(user_id);
```

---

### 2.2 메타데이터

#### categories
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### difficulties
```sql
CREATE TABLE difficulties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  level INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2.3 코스 관리

#### courses
```sql
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
```

#### enrollments
```sql
CREATE TABLE enrollments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

---

### 2.4 과제 관리

#### assignments
```sql
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
```

---

### 2.5 제출물 & 채점

#### submissions
```sql
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
```

#### grades
```sql
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
```

---

### 2.6 운영 관리

#### reports
```sql
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL
    CHECK (target_type IN ('course', 'assignment', 'submission', 'user')),
  target_id BIGINT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'investigating', 'resolved')),
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
```

---

## 3. 주요 비즈니스 로직 검증 쿼리

### 3.1 코스 수강신청 검증
```sql
-- 중복 신청 체크
SELECT EXISTS (
  SELECT 1 FROM enrollments
  WHERE user_id = $1 AND course_id = $2
);

-- 코스 상태 체크
SELECT status FROM courses WHERE id = $1 AND status = 'published';
```

### 3.2 과제 제출 검증
```sql
-- 수강 여부 체크
SELECT EXISTS (
  SELECT 1 FROM enrollments e
  JOIN assignments a ON a.course_id = e.course_id
  WHERE e.user_id = $1 AND a.id = $2
);

-- 과제 상태 & 마감일 체크
SELECT status, due_date, allow_late
FROM assignments
WHERE id = $1 AND status = 'published';

-- 지각 여부 판정
SELECT NOW() > due_date AS is_late FROM assignments WHERE id = $1;
```

### 3.3 진행률 계산
```sql
-- 코스별 진행률
SELECT
  COUNT(DISTINCT a.id) AS total_assignments,
  COUNT(DISTINCT s.assignment_id) AS completed_assignments,
  ROUND(COUNT(DISTINCT s.assignment_id)::DECIMAL / NULLIF(COUNT(DISTINCT a.id), 0) * 100, 2) AS progress
FROM enrollments e
JOIN assignments a ON a.course_id = e.course_id AND a.status = 'published'
LEFT JOIN submissions s ON s.assignment_id = a.id AND s.user_id = e.user_id
WHERE e.user_id = $1 AND e.course_id = $2
GROUP BY e.course_id;
```

### 3.4 마감 임박 과제 조회
```sql
SELECT a.id, a.title, a.due_date
FROM assignments a
JOIN enrollments e ON e.course_id = a.course_id
LEFT JOIN submissions s ON s.assignment_id = a.id AND s.user_id = e.user_id
WHERE e.user_id = $1
  AND a.status = 'published'
  AND a.due_date > NOW()
  AND a.due_date < NOW() + INTERVAL '7 days'
  AND s.id IS NULL
ORDER BY a.due_date ASC;
```

### 3.5 채점 대기 제출물 조회
```sql
SELECT s.id, s.content, s.link, s.submitted_at, s.is_late, u.name AS student_name
FROM submissions s
JOIN assignments a ON a.id = s.assignment_id
JOIN courses c ON c.id = a.course_id
JOIN profiles u ON u.id = s.user_id
WHERE c.instructor_id = $1
  AND s.status = 'submitted'
ORDER BY s.submitted_at ASC;
```

### 3.6 코스 총점 계산
```sql
SELECT
  c.id AS course_id,
  c.title,
  COALESCE(SUM(s.score * a.weight / 100), 0) AS total_score
FROM enrollments e
JOIN courses c ON c.id = e.course_id
JOIN assignments a ON a.course_id = c.id AND a.status != 'draft'
LEFT JOIN submissions s ON s.assignment_id = a.id AND s.user_id = e.user_id AND s.status = 'graded'
WHERE e.user_id = $1
GROUP BY c.id, c.title;
```

---

## 4. RLS (Row Level Security) 정책 권장사항

### 4.1 profiles
```sql
-- 본인 프로필만 조회/수정 가능
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 4.2 courses
```sql
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 모든 사용자: published 코스 조회 가능
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (status = 'published');

-- Instructor: 본인 코스만 CRUD
CREATE POLICY "Instructors can manage own courses"
  ON courses FOR ALL
  USING (auth.uid() = instructor_id);
```

### 4.3 enrollments
```sql
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Learner: 본인 수강신청만 조회/생성/삭제
CREATE POLICY "Learners can manage own enrollments"
  ON enrollments FOR ALL
  USING (auth.uid() = user_id);
```

### 4.4 assignments
```sql
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Learner: 수강 중인 코스의 published 과제만 조회
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

-- Instructor: 본인 코스의 과제만 관리
CREATE POLICY "Instructors can manage assignments of own courses"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignments.course_id
        AND courses.instructor_id = auth.uid()
    )
  );
```

### 4.5 submissions
```sql
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Learner: 본인 제출물만 CRUD
CREATE POLICY "Learners can manage own submissions"
  ON submissions FOR ALL
  USING (auth.uid() = user_id);

-- Instructor: 본인 코스의 제출물 조회/채점
CREATE POLICY "Instructors can view and grade submissions of own courses"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN courses c ON c.id = a.course_id
      WHERE a.id = submissions.assignment_id
        AND c.instructor_id = auth.uid()
    )
  );

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
```

### 4.6 grades
```sql
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Learner: 본인 성적만 조회
CREATE POLICY "Learners can view own grades"
  ON grades FOR SELECT
  USING (auth.uid() = user_id);

-- Instructor: 본인 코스의 성적 조회
CREATE POLICY "Instructors can view grades of own courses"
  ON grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = grades.course_id
        AND courses.instructor_id = auth.uid()
    )
  );
```

---

## 5. 트리거 & 자동화

### 5.1 과제 자동 마감
```sql
-- 마감일 지난 과제 자동 closed
CREATE OR REPLACE FUNCTION auto_close_assignments()
RETURNS void AS $$
BEGIN
  UPDATE assignments
  SET status = 'closed', updated_at = NOW()
  WHERE status = 'published'
    AND due_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- 주기적 실행 (pg_cron 또는 서버사이드 스케줄러)
```

### 5.2 updated_at 자동 갱신
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 5.3 성적 자동 계산
```sql
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

CREATE TRIGGER submissions_graded_calculate_grades
  AFTER UPDATE OF status ON submissions
  FOR EACH ROW
  WHEN (NEW.status = 'graded')
  EXECUTE FUNCTION calculate_grades();
```

---

## 6. 인덱스 전략 요약

- **검색 최적화**: category_id, difficulty_id, status 필드
- **관계 조회 최적화**: FK 컬럼 (user_id, course_id, assignment_id 등)
- **필터링 최적화**: published 상태, 미채점 제출물, 지각 제출물
- **정렬 최적화**: due_date, submitted_at, created_at
- **복합 인덱스**: (course_id, status), (assignment_id, status)

---

## 7. 마이그레이션 순서

1. categories, difficulties (메타데이터)
2. profiles, terms_agreements (사용자)
3. courses (코스)
4. enrollments (수강)
5. assignments (과제)
6. submissions (제출물)
7. grades (성적)
8. reports (신고)
9. RLS 정책 적용
10. 트리거 생성
