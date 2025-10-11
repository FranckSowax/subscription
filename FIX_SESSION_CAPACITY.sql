-- Fix: Update all sessions to have 25 max_participants instead of 30
-- This will change total capacity from 360 (12x30) to 300 (12x25)

-- Update all existing sessions
UPDATE masterclass_sessions 
SET max_participants = 25;

-- Verify the update
SELECT 
  COUNT(*) as total_sessions,
  SUM(max_participants) as total_capacity,
  SUM(current_participants) as total_booked
FROM masterclass_sessions;

-- Expected result:
-- total_sessions: 12
-- total_capacity: 300 (12 x 25)
-- total_booked: 0 (or current number)
