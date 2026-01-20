-- Add video start and end time columns for specifying video clip boundaries
-- Times are stored in seconds

ALTER TABLE stations
ADD COLUMN video_start_time integer,
ADD COLUMN video_end_time integer;

COMMENT ON COLUMN stations.video_start_time IS 'Start time in seconds for video playback';
COMMENT ON COLUMN stations.video_end_time IS 'End time in seconds for video playback';

-- Add constraint to ensure end time is greater than start time when both are set
ALTER TABLE stations
ADD CONSTRAINT check_video_times 
CHECK (
  (video_start_time IS NULL AND video_end_time IS NULL) OR
  (video_start_time IS NULL AND video_end_time IS NOT NULL) OR
  (video_start_time IS NOT NULL AND video_end_time IS NULL) OR
  (video_start_time IS NOT NULL AND video_end_time IS NOT NULL AND video_end_time > video_start_time)
);
