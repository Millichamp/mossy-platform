-- Add floor_plan column to listings table
-- Run this in Supabase SQL Editor

-- Add the floor_plan column as optional text field
ALTER TABLE listings ADD COLUMN IF NOT EXISTS floor_plan TEXT;

-- Add comment for documentation
COMMENT ON COLUMN listings.floor_plan IS 'Optional floor plan image URL for the property';

-- Update the schema documentation
-- Note: This should be added to your schema.md file as well
