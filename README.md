# dernier cri live

A minimalist TikTok-style radio streaming web app with vertical swipe interface, live audio with smooth crossfades, and zero-friction discovery.

## Features

- **Vertical Scroll Interface**: Swipe, scroll, or use arrow keys to navigate between stations
- **Smooth Audio Crossfades**: 1.8-second crossfade transitions using Web Audio API
- **Minimal UI**: Clean, distraction-free design with station name and logo
- **Global Radio Stations**: Curated collection of 15+ stations from around the world
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: Keyboard navigation and screen reader support
- **Background Playback**: Audio continues when tab is in background

## Tech Stack

- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** for styling
- **Supabase** for database (PostgreSQL)
- **Web Audio API** for crossfade engine
- **Custom gesture detection** for swipe/scroll

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dernier-cri-www
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - Run the SQL migration from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
   - Copy your project URL and anon key

4. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

5. Update stream URLs:
   - The seeded stations have placeholder stream URLs
   - Update the `stream_url` column in the `stations` table with actual working stream URLs
   - See `supabase/README.md` for details

6. Run the development server:
```bash
npm run dev
```

7. Open http://localhost:3000 in your browser

## Usage

- **Swipe/Scroll**: Swipe up or scroll down to go to the next station
- **Arrow Keys**: Use ↑/↓ arrow keys to navigate
- **Tap to Start**: Click/tap the screen to begin playback (browser autoplay policy)
- **Background**: Leave the tab open and audio continues playing

## Project Structure

```
dernier-cri-www/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── StationView.tsx    # Station display
│   ├── StationCarousel.tsx # Main carousel
│   ├── LoadingState.tsx   # Loading indicator
│   └── ErrorState.tsx     # Error messages
├── contexts/              # React contexts
│   ├── AudioContext.tsx   # Audio state management
│   └── StationContext.tsx # Station navigation
├── hooks/                 # Custom React hooks
│   ├── useSwipe.ts        # Gesture detection
│   ├── useKeyboardNav.ts  # Keyboard navigation
│   └── useStations.ts     # Data fetching
├── lib/                   # Core libraries
│   ├── supabase.ts        # Supabase client
│   └── audio-engine.ts    # Web Audio API engine
├── types/                 # TypeScript definitions
│   └── station.ts         # Type definitions
└── supabase/              # Database
    └── migrations/        # SQL migrations
```

## Key Technical Details

### Audio Crossfade Engine

The app uses a custom Web Audio API implementation with two alternating audio elements:
- Each station loads in the inactive audio element
- GainNode controls simultaneous fade out/fade in
- 1.8-second linear ramp for smooth transitions
- Preloading of next station for instant transitions

### Gesture Detection

Custom implementation supporting:
- Touch events (mobile)
- Mouse drag (desktop)
- Trackpad/mouse wheel scroll
- 50px threshold for deliberate gestures

### State Management

React Context API with useReducer for:
- Station catalog and current index
- Audio playback state
- Error handling and loading states

## Browser Support

- Chrome/Edge (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)
- iOS Safari (mobile)
- Android Chrome (mobile)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Cloudflare Pages

## Performance Budget

- Initial load: <100KB gzipped JS/CSS
- Station data: <5KB JSON
- Interactive in <2 seconds on 4G
- Crossfade: <2 seconds total
- 60fps scroll animations

## Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation (arrow keys)
- ARIA labels and live regions
- Screen reader support
- Focus indicators
- prefers-reduced-motion support

## Contributing

Contributions are welcome! Please follow these guidelines:
- Follow the existing code style
- Write clear commit messages
- Test on multiple browsers
- Ensure accessibility standards are met

## License

MIT

## Roadmap

- [ ] Expand station catalog to 30+ stations
- [ ] Add admin interface for managing stations
- [ ] Implement analytics (session duration, popular stations)
- [ ] Optional user accounts with favorites
- [ ] Native mobile apps (React Native)

## Credits

Built with ❤️ using Next.js, Supabase, and Web Audio API.
