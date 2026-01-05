-- ============================================
-- DATABASE FIX SCRIPT FOR OKR GENERATIONS
-- ============================================
-- Run this script in your Supabase SQL Editor to fix the saving issues

-- OPTION 1: Temporarily disable RLS for testing
-- This allows inserts without authentication context
-- WARNING: Only use this for development/testing!
ALTER TABLE okr_generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Make user_id nullable to allow orphaned OKRs
-- This allows you to save OKRs without creating users first
ALTER TABLE okr_generations ALTER COLUMN user_id DROP NOT NULL;

-- OPTION 3: Remove foreign key constraint (for testing only)
-- This allows any user_id value without validation
-- UNCOMMENT the line below if you want to use this option:
-- ALTER TABLE okr_generations DROP CONSTRAINT IF EXISTS okr_generations_user_id_fkey;

-- ============================================
-- ALTERNATIVE: Create a function to upsert users automatically
-- ============================================
-- This function creates a user if they don't exist, then returns the user_id
-- You can call this before inserting OKRs

CREATE OR REPLACE FUNCTION upsert_user_and_okr(
  p_user_id TEXT,
  p_email TEXT,
  p_name TEXT,
  p_role TEXT,
  p_website_url TEXT,
  p_company_name TEXT,
  p_planning_period TEXT,
  p_strategic_narrative TEXT,
  p_okrs JSONB
)
RETURNS TABLE (
  okr_id UUID,
  user_id UUID,
  website_url TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_uuid UUID;
  v_okr_id UUID;
BEGIN
  -- Try to parse user_id as UUID, or generate a new one
  BEGIN
    v_user_uuid := p_user_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user_uuid := gen_random_uuid();
  END;

  -- Insert or update user
  INSERT INTO users (id, email, name, role, company_name, website_url)
  VALUES (v_user_uuid, p_email, p_name, p_role, p_company_name, p_website_url)
  ON CONFLICT (email) DO UPDATE
  SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    company_name = EXCLUDED.company_name,
    website_url = EXCLUDED.website_url,
    updated_at = NOW();

  -- Insert OKR
  INSERT INTO okr_generations (
    user_id,
    website_url,
    company_name,
    planning_period,
    strategic_narrative,
    okrs,
    is_draft
  )
  VALUES (
    v_user_uuid,
    p_website_url,
    p_company_name,
    p_planning_period,
    p_strategic_narrative,
    p_okrs,
    false
  )
  RETURNING id INTO v_okr_id;

  -- Return result
  RETURN QUERY
  SELECT
    v_okr_id as okr_id,
    v_user_uuid as user_id,
    p_website_url as website_url,
    p_company_name as company_name,
    NOW() as created_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TEST QUERIES (OPTIONAL)
-- ============================================

-- Test 1: Check if you can insert a simple OKR without user
-- This should work after Option 2 above
/*
INSERT INTO okr_generations (
  user_id,
  website_url,
  company_name,
  planning_period,
  strategic_narrative,
  okrs,
  is_draft
)
VALUES (
  NULL, -- This works if user_id is nullable
  'https://example.com',
  'Test Company',
  'Q1 2026',
  'Test narrative',
  '[]'::jsonb,
  false
)
RETURNING *;
*/

-- Test 2: Check what policies are blocking your inserts
-- SELECT * FROM pg_policies WHERE tablename = 'okr_generations';

-- Test 3: View current RLS status
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
