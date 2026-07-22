-- Add observation and agreed_price_per_night columns to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS observation TEXT DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agreed_price_per_night DECIMAL(12,2) DEFAULT NULL;
