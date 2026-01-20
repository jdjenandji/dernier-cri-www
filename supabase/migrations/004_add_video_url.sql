-- Add video_url column as nullable for backward compatibility
ALTER TABLE stations
ADD COLUMN video_url text;

COMMENT ON COLUMN stations.video_url IS 'YouTube video URL for embedded display';
