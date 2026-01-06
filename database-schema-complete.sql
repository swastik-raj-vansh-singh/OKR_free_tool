-- Complete Database Schema for OKR Autopilot
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. Create users table if it doesn't exist
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  company_domain VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. Add reminder columns to users table
-- ============================================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_frequency VARCHAR(20) DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS reminder_day VARCHAR(20) DEFAULT 'monday',
ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '18:00:00';

-- ============================================================================
-- 3. Create index for faster reminder queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_reminders
ON users(reminder_enabled, reminder_day)
WHERE reminder_enabled = true;

-- ============================================================================
-- 4. Create updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Attach trigger to users table
-- ============================================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Insert a test user (optional - for testing)
-- ============================================================================
-- Uncomment the line below to create a test user
-- INSERT INTO users (email, name, role, company_domain)
-- VALUES ('test@example.com', 'Test User', 'Product Manager', 'example.com')
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- Success! Schema is ready
-- ============================================================================
SELECT 'Database schema created successfully!' AS message;
