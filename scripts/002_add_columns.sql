-- Add color column to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Add phone column to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone TEXT DEFAULT '';
