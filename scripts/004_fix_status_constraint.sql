-- Drop the old status check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add new status check constraint with updated values
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'signaled', 'paid', 'cancelled'));
