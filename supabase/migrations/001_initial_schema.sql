-- Create stations table
create table stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  stream_url text not null,
  country text not null,
  city text,
  genre text,
  display_order integer not null unique,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for active stations ordered by display_order
create index idx_stations_active_order
  on stations(display_order)
  where is_active = true;

-- Enable Row Level Security
alter table stations enable row level security;

-- Create policy for public read access to active stations
create policy "Enable read access for all users"
  on stations for select
  using (is_active = true);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_stations_updated_at
  before update on stations
  for each row
  execute function update_updated_at_column();

-- Seed initial station data
-- Note: stream_url values should be updated with actual working stream URLs
insert into stations (name, logo_url, stream_url, country, city, genre, display_order) values
  ('Radio Nova', 'https://www.nova.fr/sites/default/files/2021-10/NOVA_avatar.jpg', 'https://novazz.ice.infomaniak.ch/novazz-128.mp3', 'France', 'Paris', 'Eclectic', 1),
  ('NTS Radio', 'https://assets-global.website-files.com/6486b3a1f6e0a7ca5c6d8c8d/nts-logo.png', 'https://stream-mixtape-geo.ntslive.net/mixtape', 'United Kingdom', 'London', 'Alternative', 2),
  ('dublab', 'https://dublab.com/images/dublab-logo.png', 'https://dublab.out.airtime.pro/dublab_a', 'United States', 'Los Angeles', 'Electronic', 3),
  ('Radar Radio', 'https://www.radarradio.com/assets/images/radar-logo.png', 'https://listen.radioking.com/radio/320349/stream/369753', 'United Kingdom', 'London', 'Underground', 4),
  ('Kiosk Radio', 'https://www.kioskradio.com/assets/kiosk-logo.png', 'https://kiosk.ice.infomaniak.ch/kiosk-128.mp3', 'Belgium', 'Brussels', 'Experimental', 5),
  ('Worldwide FM', 'https://worldwidefm.net/wp-content/themes/worldwide/images/logo.png', 'https://worldwidefm.out.airtime.pro/worldwidefm_a', 'United Kingdom', 'London', 'Global', 6),
  ('The Lot Radio', 'https://thelotradio.com/assets/lot-logo.png', 'https://streamer.radio.co/s2c3cc784b/listen', 'United States', 'New York', 'Community', 7),
  ('Radio Alhara', 'https://www.radioalhara.net/assets/alhara-logo.png', 'https://s7.myradiostream.com/:8062/listen.mp3', 'Palestine', 'Bethlehem', 'Cultural', 8),
  ('Netil Radio', 'https://www.netilradio.com/assets/netil-logo.png', 'https://listen.radioking.com/radio/338111/stream/384682', 'United Kingdom', 'London', 'Independent', 9),
  ('Radio Quantica', 'https://radioquantica.com/assets/quantica-logo.png', 'https://streamingv2.shoutcast.com/radioquantica', 'Argentina', 'Buenos Aires', 'Jazz/Electronic', 10),
  ('Cashmere Radio', 'https://cashmereradio.com/wp-content/themes/cashmere/images/logo.png', 'https://cashmereradio.out.airtime.pro/cashmereradio_a', 'Germany', 'Berlin', 'Experimental', 11),
  ('Rinse FM', 'https://rinse.fm/assets/rinse-logo.png', 'https://streamer.radio.co/s1f2d3e4a/listen', 'United Kingdom', 'London', 'Electronic/Grime', 12),
  ('Red Light Radio', 'https://redlightradio.net/assets/redlight-logo.png', 'https://redlightradio.out.airtime.pro/redlightradio_a', 'Netherlands', 'Amsterdam', 'House/Techno', 13),
  ('Radio Raheem', 'https://www.radioraheem.it/assets/raheem-logo.png', 'https://radioraheem.out.airtime.pro/radioraheem_a', 'Italy', 'Milan', 'Hip-hop/Soul', 14),
  ('Refuge Worldwide', 'https://refugeworldwide.com/assets/refuge-logo.png', 'https://refugeworldwide.out.airtime.pro/refugeworldwide_a', 'Germany', 'Berlin', 'Global', 15);
