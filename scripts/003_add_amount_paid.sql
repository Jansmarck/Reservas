-- Add amount_paid column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0;

-- Update existing 'confirmed' status to 'signaled'
UPDATE bookings SET status = 'signaled' WHERE status = 'confirmed';
