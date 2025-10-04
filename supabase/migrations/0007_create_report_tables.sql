-- Migration: Create report tables for operator management
-- Created: 2025-10-04

-- reports table
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
