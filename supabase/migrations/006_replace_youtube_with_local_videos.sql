-- Migration: Replace YouTube streaming with local bundled videos
-- Date: 2025-01-22
-- Purpose: Add video_file_name column for local MP4 files in iOS app bundle

-- Add new column for local video filenames
ALTER TABLE stations
ADD COLUMN video_file_name text;

COMMENT ON COLUMN stations.video_file_name
IS 'Local MP4 filename in iOS app bundle (without .mp4 extension). Example: "radio-nova"';

-- Example data updates (update these with actual station IDs and video filenames)
-- UPDATE stations
-- SET video_file_name = 'radio-nova'
-- WHERE id = '<uuid-of-radio-nova>';
--
-- UPDATE stations
-- SET video_file_name = 'nts-radio'
-- WHERE id = '<uuid-of-nts-radio>';

-- Note: Old columns (video_url, video_start_time, video_end_time) are kept for backward compatibility
-- These can be removed after iOS app is deployed and stable (1-2 weeks)

-- To remove old columns later (do not run yet):
-- ALTER TABLE stations DROP COLUMN video_url;
-- ALTER TABLE stations DROP COLUMN video_start_time;
-- ALTER TABLE stations DROP COLUMN video_end_time;
