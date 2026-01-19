-- Add Dream Chimney radio station
-- Note: Stream URL needs to be updated with the actual streaming link
-- Check https://www.dreamchimney.com/radio/ for the live stream URL
INSERT INTO stations (name, logo_url, stream_url, country, city, genre, display_order)
VALUES (
  'Dream Chimney',
  'https://www.dreamchimney.com/mainpage/dc-title06.gif',
  'https://dreamchimney.out.airtime.pro/dreamchimney_a',
  'United States',
  null,
  'Experimental',
  17
);
