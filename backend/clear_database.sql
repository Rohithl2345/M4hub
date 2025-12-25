-- Clear all data from database tables
TRUNCATE TABLE email_otp_verifications CASCADE;
TRUNCATE TABLE users CASCADE;

-- Verify tables are empty
SELECT 'email_otp_verifications cleared' AS status, COUNT(*) AS remaining_rows FROM email_otp_verifications;
SELECT 'users cleared' AS status, COUNT(*) AS remaining_rows FROM users;
