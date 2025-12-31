-- Add JWT token fields to users table
-- Migration for authentication system upgrade

-- Add refresh token and expiration columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(1000),
ADD COLUMN IF NOT EXISTS session_token_expiry TIMESTAMP,
ADD COLUMN IF NOT EXISTS refresh_token_expiry TIMESTAMP;

-- Create indexes for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Note: Existing password hashes (SHA-256) will be migrated to BCrypt on first login
-- Users may need to use "Forgot Password" if they cannot login after upgrade
