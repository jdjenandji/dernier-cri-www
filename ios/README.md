# Dernier Cri Live - iOS App

Native iOS app for Dernier Cri Live radio streaming platform with smooth 1.8s crossfading and vertical swipe navigation.

## Features

- **Smooth Audio Crossfading**: 1.8s linear crossfade between stations using dual AVPlayer architecture
- **Vertical Swipe Navigation**: Intuitive gesture-based station switching
- **Circular Navigation**: Infinite scrolling through stations
- **Background Playback**: Continue listening when device is locked
- **Auto-Skip on Errors**: Automatic progression to next station if stream fails
- **Stream Preloading**: Fast transitions with intelligent preloading

## Architecture

**Pattern**: MVVM with SwiftUI + Combine
- `ObservableObject` ViewModels for reactive state management
- Dual AVPlayer for seamless crossfading
- Supabase Swift SDK for data fetching
- CADisplayLink for 60fps volume ramping

## Project Structure

```
DernierCriLive/
├── App/
│   ├── DernierCriLiveApp.swift      # App entry point
│   └── AppDelegate.swift             # Audio session config
├── Models/
│   ├── Station.swift                 # Station data model
│   └── AudioState.swift              # Playback state models
├── Services/
│   ├── AudioEngine/
│   │   ├── AudioPlayer.swift         # AVPlayer wrapper
│   │   └── AudioCrossfadeEngine.swift # Dual-player crossfade
│   └── Network/
│       ├── SupabaseClient.swift      # Supabase singleton
│       └── StationService.swift      # Station fetching
├── ViewModels/
│   ├── StationViewModel.swift        # Navigation state
│   ├── AudioViewModel.swift          # Playback state
│   └── CarouselViewModel.swift       # Main coordinator
├── Views/
│   ├── ContentView.swift             # Root view
│   ├── TapToStartView.swift          # User gesture gate
│   ├── StationCarouselView.swift     # Main carousel
│   ├── StationCardView.swift         # Station display
│   ├── LoadingView.swift             # Loading state
│   ├── ErrorView.swift               # Error state
│   └── Components/
│       ├── StationInfoView.swift     # Station metadata
│       └── NavigationHintView.swift  # Swipe hints
├── Utilities/
│   └── Constants.swift               # App constants
└── Resources/
    ├── Info.plist
    └── Supabase.plist                # Credentials (gitignored)
```

## Setup Instructions

### Prerequisites

- **Xcode 15.0+**
- **iOS 15.0+** deployment target
- **Supabase account** with station data

### Step 1: Create Xcode Project

1. Open Xcode
2. Create new project: **File → New → Project**
3. Choose: **iOS → App**
4. Configure:
   - Product Name: `DernierCriLive`
   - Bundle Identifier: `com.derniercri.live`
   - Interface: `SwiftUI`
   - Life Cycle: `SwiftUI App`
   - Language: `Swift`
   - Minimum Deployments: `iOS 15.0`

### Step 2: Add Swift Package Dependencies

1. In Xcode: **File → Add Package Dependencies**
2. Add Supabase Swift SDK:
   ```
   https://github.com/supabase-community/supabase-swift
   ```
3. Select version: **Latest** (2.x)
4. Add to target: `DernierCriLive`

### Step 3: Add Source Files

1. Delete the default `ContentView.swift` created by Xcode
2. Copy all files from this `ios/DernierCriLive/` directory to your Xcode project
3. In Xcode, right-click project → **Add Files to "DernierCriLive"**
4. Select all folders and ensure:
   - ✅ Copy items if needed
   - ✅ Create groups
   - ✅ Add to targets: DernierCriLive

### Step 4: Configure Supabase Credentials

1. Copy `Supabase.plist.example` to `Supabase.plist`:
   ```bash
   cd ios/DernierCriLive/Resources
   cp Supabase.plist.example Supabase.plist
   ```

2. Edit `Supabase.plist` with your credentials:
   ```xml
   <key>SUPABASE_URL</key>
   <string>https://your-project.supabase.co</string>
   <key>SUPABASE_ANON_KEY</key>
   <string>your-anon-key-here</string>
   ```

3. Add `Supabase.plist` to Xcode (it's already in `.gitignore`)

### Step 5: Configure Info.plist

The included `Info.plist` already has:
- ✅ Background audio mode enabled (`UIBackgroundModes: audio`)
- ✅ Portrait-only orientation
- ✅ App Transport Security configured

### Step 6: Build & Run

1. Select your target device or simulator
2. Press **⌘R** to build and run
3. The app will:
   - Load stations from Supabase
   - Show a random starting station
   - Prompt "Tap to Start" (required by iOS autoplay policy)
   - Begin streaming after user tap

## Key Constants

All timing and gesture values match the web app:

```swift
// Audio
crossfadeDuration: 1.8s      // Smooth linear crossfade
streamLoadTimeout: 10.0s     // Max time to wait for stream
autoSkipDelay: 2.0s          // Auto-skip after error

// Gestures
dragThreshold: 15%           // % of screen to trigger navigation
velocityThreshold: 0.25 px/ms // Flick detection
rubberBandMax: 150px         // Max overscroll resistance
transitionDuration: 0.4s     // UI animation timing
```

## Testing Checklist

**Manual Testing:**
- [ ] Tap to start activates audio
- [ ] Swipe up navigates to next station
- [ ] Swipe down navigates to previous station
- [ ] Crossfade is smooth (1.8s, no clicks/pops)
- [ ] Stations wrap around (circular navigation)
- [ ] Rubber band resistance at edges
- [ ] Velocity detection works (flick gesture)
- [ ] Auto-skip triggers after stream error
- [ ] 10s timeout on broken streams
- [ ] Audio continues when device locks
- [ ] Memory usage stays reasonable

**Test on Physical Device:**
- Audio quality is best verified on real hardware
- Simulator has known audio limitations

## Troubleshooting

### No Audio Playback
- Check `Supabase.plist` credentials
- Verify stations have valid `stream_url` values
- Check device volume and mute switch
- Test on physical device (simulator has audio issues)

### Supabase Connection Fails
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check network connection
- Ensure stations table has `is_active = true` records

### Build Errors
- Clean build folder: **⌘⇧K**
- Delete derived data: **⌘⇧K** then restart Xcode
- Verify all Swift files are added to target
- Check Swift Package Dependencies are resolved

### Crossfade Glitches
- Test on physical device (simulator has audio timing issues)
- Check for network interruptions
- Verify stream URLs are valid and responsive

## Next Steps (Phase 2 Enhancements)

Future features to implement:

1. **Lock Screen Controls**
   - MPNowPlayingInfoCenter integration
   - MPRemoteCommandCenter for play/pause/skip

2. **YouTube Video Backgrounds**
   - WKWebView with video playback
   - Sync with station changes

3. **Haptic Feedback**
   - UIImpactFeedbackGenerator on swipes

4. **Dark Mode Support**
   - Respect system appearance settings

5. **Accessibility**
   - VoiceOver support
   - Dynamic Type

6. **Widget Support**
   - Home screen widget showing current station
   - Quick play action

## Technical Notes

### Audio Engine Design

The crossfade engine uses dual AVPlayer instances:
- **Player 0**: Plays current station
- **Player 1**: Preloads next station

During crossfade:
1. Start Player 1 at volume 0
2. Use CADisplayLink for 60fps volume updates
3. Linear ramp: `currentVolume = 1 - progress`, `nextVolume = progress`
4. After 1.8s, stop Player 0 and swap indices

This mirrors the web app's Web Audio API `linearRampToValueAtTime` behavior.

### Gesture Handling

Vertical drag gestures follow the web app's pattern:
- **Threshold**: 15% of screen height triggers navigation
- **Velocity**: 0.25 px/ms for flick detection
- **Rubber Band**: Overscroll resistance using exponential decay
- **Circular**: Navigation wraps at both ends

### State Management

The app uses three coordinated ViewModels:
- `StationViewModel`: Manages station list and current index
- `AudioViewModel`: Controls playback and crossfading
- `CarouselViewModel`: Orchestrates both and handles transitions

This separation of concerns matches the web app's Context pattern.

## License

Copyright © 2024 Dernier Cri Live. All rights reserved.
