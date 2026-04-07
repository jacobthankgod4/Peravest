-- ============================================================================
-- PHASE 1 SUBPHASE 1.10: Reliability Score Materialized View
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS ajo_member_scores CASCADE;

CREATE MATERIALIZED VIEW ajo_member_scores AS
SELECT 
  amh.user_id,
  COUNT(*) as total_contributions,
  COUNT(*) FILTER (WHERE amh.status = 'paid') as on_time_contributions,
  COUNT(*) FILTER (WHERE amh.status = 'late') as late_contributions,
  COUNT(*) FILTER (WHERE amh.status = 'defaulted') as defaulted_contributions,
  ROUND(
    COUNT(*) FILTER (WHERE amh.status = 'paid')::DECIMAL / 
    NULLIF(COUNT(*), 0)::DECIMAL * 100, 
    2
  ) as on_time_percentage,
  ROUND(
    CASE 
      WHEN COUNT(*) = 0 THEN 1.0
      WHEN COUNT(*) FILTER (WHERE amh.status = 'defaulted') > 0 THEN 0.5
      WHEN COUNT(*) FILTER (WHERE amh.status = 'late') > COUNT(*) / 2 THEN 0.7
      WHEN COUNT(*) FILTER (WHERE amh.status = 'paid') = COUNT(*) THEN 1.0
      ELSE 0.8
    END, 2
  ) as reliability_score,
  MAX(amh.contribution_date) as last_contribution_date
FROM ajo_member_history amh
GROUP BY amh.user_id;

-- Create index on materialized view
CREATE INDEX idx_ajo_member_scores_user ON ajo_member_scores(user_id);
CREATE INDEX idx_ajo_member_scores_reliability ON ajo_member_scores(reliability_score);

-- ============================================================================
-- Function to refresh materialized view (call manually or via cron)
-- ============================================================================

DROP FUNCTION IF EXISTS refresh_ajo_member_scores() CASCADE;

CREATE OR REPLACE FUNCTION refresh_ajo_member_scores()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ajo_member_scores;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to get member reliability score
-- ============================================================================

CREATE OR REPLACE FUNCTION get_member_reliability_score(p_user_id INTEGER)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  v_score DECIMAL(3,2);
BEGIN
  SELECT reliability_score INTO v_score
  FROM ajo_member_scores
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_score, 1.0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to check if member can join group (reliability threshold)
-- ============================================================================

CREATE OR REPLACE FUNCTION can_member_join_group(p_user_id INTEGER, p_group_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_member_score DECIMAL(3,2);
  v_group_threshold DECIMAL(3,1);
  v_can_join BOOLEAN;
BEGIN
  -- Get member's reliability score
  v_member_score := get_member_reliability_score(p_user_id);
  
  -- Get group's reliability threshold
  SELECT reliability_threshold INTO v_group_threshold
  FROM ajo_groups
  WHERE id = p_group_id;
  
  -- Check if member meets threshold
  v_can_join := v_member_score >= v_group_threshold;
  
  RETURN json_build_object(
    'can_join', v_can_join,
    'member_score', v_member_score,
    'group_threshold', v_group_threshold,
    'reason', CASE 
      WHEN v_can_join THEN 'Member meets reliability threshold'
      ELSE 'Member score (' || v_member_score || ') below group threshold (' || v_group_threshold || ')'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- SELECT * FROM ajo_member_scores LIMIT 5;
-- SELECT get_member_reliability_score(1);
-- SELECT can_member_join_group(1, 1);
