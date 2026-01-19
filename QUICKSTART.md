# Quick Start Guide

Get dernier cri live running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Step 1: Clone and Install (1 minute)

```bash
# If not already done
git clone <your-repo-url>
cd dernier-cri-www

# Install dependencies
npm install
```

## Step 2: Set Up Supabase (2 minutes)

1. Go to https://supabase.com and create a new project
2. Open the SQL Editor in your Supabase dashboard
3. Copy everything from `supabase/migrations/001_initial_schema.sql`
4. Paste and run in the SQL Editor
5. Verify 15 stations were created in the `stations` table

## Step 3: Configure Environment (1 minute)

1. Copy the example env file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in Supabase: Settings > API

## Step 4: Run Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## What You Should See

1. A black screen with a station name and logo
2. "Tap to start" overlay
3. Click/tap to begin playback
4. Swipe or use arrow keys to change stations

## If Audio Doesn't Play

The seeded stream URLs are placeholders. To hear actual audio:

1. Open Supabase SQL Editor
2. Update at least one station with a working stream URL:

```sql
-- Example: Radio Nova (France)
UPDATE stations
SET stream_url = 'https://novazz.ice.infomaniak.ch/novazz-128.mp3'
WHERE name = 'Radio Nova';
```

3. Refresh your browser

## Finding Working Stream URLs

Easy way to find streams:
1. Go to https://www.radio-browser.info/
2. Search for a station
3. Copy the stream URL (look for MP3 or AAC format)
4. Update your database

Example working URLs:
- Radio Nova: `https://novazz.ice.infomaniak.ch/novazz-128.mp3`
- NTS Radio: `https://stream-mixtape-geo.ntslive.net/mixtape`
- dublab: `https://dublab.out.airtime.pro/dublab_a`

## Testing Features

### Navigation
- **Swipe up/down** on touchscreen
- **Arrow up/down** on keyboard
- **Mouse wheel** or trackpad scroll
- Each station should crossfade smoothly (~2 seconds)

### Error Handling
- Try a broken URL in database
- App should auto-skip after 10 seconds
- Error message should appear briefly

### Background Playback
- Switch to another tab
- Audio should continue playing

## Project Structure

```
dernier-cri-www/
├── app/              # Next.js pages
├── components/       # React components
├── contexts/         # State management
├── hooks/            # Custom hooks
├── lib/              # Core logic (audio engine, supabase)
├── types/            # TypeScript types
└── supabase/         # Database schema
```

## Common Issues

### "No stations available"
- Check `.env.local` has correct Supabase credentials
- Verify stations table has data: `SELECT * FROM stations`

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

## Next Steps

1. **Update stream URLs** - Replace all placeholder URLs with working streams
2. **Test thoroughly** - Try all navigation methods and edge cases
3. **Customize** - Adjust styling, add more stations, tweak crossfade duration
4. **Deploy** - Follow `DEPLOYMENT.md` when ready

## Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Getting Help

- Read `README.md` for full documentation
- Check `DEPLOYMENT.md` for deployment guide
- Review code comments for implementation details
- Check browser console for error messages

## Tips

- Use Chrome DevTools Network tab to debug stream loading
- Use Console to see audio engine logs
- Test on mobile devices early (audio works differently)
- Keep an eye on bundle size: `npm run build`

---

**Happy coding!** 🎧
