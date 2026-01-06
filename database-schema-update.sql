-- Add reminder columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_frequency VARCHAR(20) DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS reminder_day VARCHAR(20) DEFAULT 'monday',
ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '18:00:00';

-- Create index for faster reminder queries
CREATE INDEX IF NOT EXISTS idx_users_reminders 
ON users(reminder_enabled, reminder_day) 
WHERE reminder_enabled = true;
