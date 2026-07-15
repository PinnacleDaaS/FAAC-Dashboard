-- ============================================================
-- FAAC & IGR Dashboard — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. FAAC Allocations Table
CREATE TABLE IF NOT EXISTS faac_allocations (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  state TEXT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  gross NUMERIC(18, 2) DEFAULT 0,
  net NUMERIC(18, 2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_faac_year ON faac_allocations(year);
CREATE INDEX IF NOT EXISTS idx_faac_state ON faac_allocations(state);
CREATE INDEX IF NOT EXISTS idx_faac_year_state ON faac_allocations(year, state);

-- Enable RLS but allow anon read
ALTER TABLE faac_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_faac" ON faac_allocations FOR SELECT USING (true);

-- 2. IGR Data Table
CREATE TABLE IF NOT EXISTS igr_data (
  id BIGSERIAL PRIMARY KEY,
  year INT NOT NULL,
  state TEXT NOT NULL,
  total_igr NUMERIC(18, 2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_igr_year ON igr_data(year);
CREATE INDEX IF NOT EXISTS idx_igr_state ON igr_data(state);
CREATE INDEX IF NOT EXISTS idx_igr_year_state ON igr_data(year, state);

ALTER TABLE igr_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_igr" ON igr_data FOR SELECT USING (true);

-- 3. Dashboard Summary Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_summary AS
SELECT
  f.year,
  f.state,
  SUM(f.net) AS total_net,
  SUM(f.gross) AS total_gross,
  COALESCE(MAX(i.total_igr), 0) AS total_igr,
  CASE
    WHEN SUM(f.net) + COALESCE(MAX(i.total_igr), 0) > 0
    THEN SUM(f.net) / (SUM(f.net) + COALESCE(MAX(i.total_igr), 0))
    ELSE 0
  END AS dependency_ratio
FROM faac_allocations f
LEFT JOIN igr_data i ON f.year = i.year AND LOWER(f.state) = LOWER(i.state)
GROUP BY f.year, f.state;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_summary_year_state
  ON dashboard_summary(year, state);

-- 4. Helper function to refresh the materialized view (for seed script)
CREATE OR REPLACE FUNCTION refresh_dashboard_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS 
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_summary;
END;
;
