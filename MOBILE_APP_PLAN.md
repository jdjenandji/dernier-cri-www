# Dernier Cri Live - Native Mobile App Implementation Plan

## Overview
Build native iOS and Android apps for Dernier Cri Live, a TikTok-style radio streaming platform. iOS will be developed first with Swift, followed by Android in Kotlin. The mobile apps will feature enhanced mobile-specific capabilities including background playback, lock screen controls, and haptic feedback.

## Platform Strategy

### iOS (Phase 1)
- **Language:** Swift 5.9+
- **UI Framework:** SwiftUI (primary) with UIKit where needed
- **Min iOS Version:** iOS 15.0
- **Audio:** AVFoundation (AVPlayer/AVAudioPlayer)
- **Gestures:** SwiftUI native gestures
- **Timeline:** 8-12 weeks for quality implementation

### Android (Phase 2)
- **Language:** Kotlin 1.9+
- **UI Framework:** Jetpack Compose
- **Min Android Version:** Android 8.0 (API 26)
- **Audio:** ExoPlayer + MediaSession
- **Timeline:** 6-8 weeks (leveraging iOS learnings)

## Current Web App Context

**Technology Stack:**
- Next.js, TypeScript, Tailwind CSS
- Supabase (PostgreSQL backend)
- Web Audio API for crossfading
- YouTube IFrame API for video backgrounds

**Key Features:**
- Vertical swipe navigation through 17 global radio stations
- 1.8-second smooth crossfading between stations
- YouTube video backgrounds with optional start/end time looping
- Preloading of all audio streams
- Auto-skip on stream errors (10-second timeout)
- Desktop sidebar for quick navigation

**Backend (Supabase):**
- Stations table: id, name, logo_url, video_url, video_start_time, video_end_time, stream_url, country, city, genre, display_order, is_active
- Read-only public access via RLS
- 17 curated global radio stations
- Will be reused for mobile apps

## iOS App Architecture

### Core Components

#### 1. Audio Engine
**File:** `AudioEngine.swift`

**Responsibilities:**
- Manage dual AVPlayer instances for crossfading
- Implement smooth volume ramping (1.8s crossfade duration)
- Handle stream preloading (current + next + previous)
- Auto-skip on load failures with 10-second timeout
- Background audio playback configuration
- Error recovery and retry logic

**Technical Approach:**
```swift
class AudioEngine {
    private var primaryPlayer: AVPlayer?
    private var secondaryPlayer: AVPlayer?
    private var crossfadeDuration: TimeInterval = 1.8

    // Volume crossfade using CADisplayLink for smooth 60 FPS ramping
    func crossfade(from: Station, to: Station, completion: @escaping () -> Void)

    // Preload next/previous streams
    func preloadStations(_ stations: [Station])

    // Configure background playback and Now Playing info
    func setupBackgroundAudio()
}
```

**Key Challenges:**
- AVFoundation doesn't have GainNode like Web Audio API
- Solution: Use AVPlayerItem volume or AVAudioEngine mixer nodes for smooth crossfading
- Alternative: Linear volume ramping on AVPlayer.volume with CADisplayLink for 60 FPS updates

#### 2. Station Management
**File:** `StationViewModel.swift`

**Responsibilities:**
- Fetch stations from Supabase
- Manage current station index and navigation state
- Handle swipe gestures and navigation actions
- Track station history
- Loading and error states

**Pattern:** ObservableObject with @Published properties (SwiftUI MVVM)

```swift
@MainActor
class StationViewModel: ObservableObject {
    @Published var stations: [Station] = []
    @Published var currentIndex: Int = 0
    @Published var isLoading: Bool = false
    @Published var error: String?
    @Published var isTransitioning: Bool = false

    func goToNext()
    func goToPrevious()
    func goToStation(at index: Int)
}
```

#### 3. Gesture Handling
**File:** `StationCarouselView.swift`

**Approach:** SwiftUI DragGesture with custom logic

```swift
.gesture(
    DragGesture()
        .onChanged { /* track translation */ }
        .onEnded { value in
            if value.translation.height < -80 { goToNext() }
            else if value.translation.height > 80 { goToPrevious() }
        }
)
```

**Enhanced with:**
- Haptic feedback (UIImpactFeedbackGenerator) on swipe start and completion
- Velocity threshold for momentum-based navigation
- Gesture locking during transitions
- Smooth spring animations

#### 4. Video Background
**Options for iOS:**

**Option A: WKWebView + YouTube Embed (Easiest)**
- Embed YouTube videos in WKWebView
- Supports video_start_time and video_end_time parameters
- Similar to web app implementation
- Con: WebView performance overhead

**Option B: AVPlayer with YouTube Video URLs (Better Performance)**
- Extract direct video stream URL from YouTube (requires youtube-dl or similar)
- Play in native AVPlayer with looping
- Con: YouTube URL extraction can be fragile, against TOS

**Option C: Pre-converted MP4 Videos (Best Performance)**
- Backend preprocessing: download YouTube videos, convert to MP4, host on CDN
- Use AVPlayerLayer with VideoGravity.resizeAspectFill
- Full control over looping and timing
- Con: Storage costs, preprocessing pipeline needed

**Recommendation for iOS:** Start with **Option A (WKWebView)** for MVP, migrate to **Option C** in Phase 2 with video preprocessing pipeline.

### App Structure

```
DernierCriLive-iOS/
├── DernierCriLiveApp.swift          # App entry point
├── Models/
│   ├── Station.swift                 # Station data model (port from types/station.ts)
│   └── Database.swift                # Supabase types
├── ViewModels/
│   ├── StationViewModel.swift        # Station list and navigation state
│   └── AudioViewModel.swift          # Audio playback state
├── Views/
│   ├── StationCarouselView.swift     # Main vertical swiper
│   ├── StationCardView.swift         # Individual station display
│   ├── VideoBackgroundView.swift     # Video/image background wrapper
│   ├── LoadingView.swift             # Loading indicator
│   ├── ErrorView.swift               # Error display
│   └── TapToStartOverlay.swift       # Initial playback prompt
├── Services/
│   ├── AudioEngine.swift             # Core audio playback and crossfading
│   ├── SupabaseClient.swift          # Supabase API client
│   ├── MediaPlayerManager.swift      # Now Playing / lock screen controls
│   └── HapticManager.swift           # Haptic feedback
├── Utilities/
│   ├── Constants.swift               # App constants (crossfade duration, etc.)
│   └── Extensions.swift              # Swift extensions
└── Resources/
    ├── Assets.xcassets               # App icons, launch images
    └── Info.plist                    # Permissions, capabilities
```

### Dependencies (Swift Package Manager)

```swift
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0"),
    .package(url: "https://github.com/Alamofire/Alamofire", from: "5.8.0"), // HTTP requests
]
```

## iOS Feature Implementation

### Phase 1: Core Streaming (Weeks 1-4)

**Week 1: Project Setup & Data Layer**
- Create Xcode project (SwiftUI App lifecycle)
- Configure Supabase client with anon key
- Define Station model (decode from JSON)
- Implement StationViewModel with Supabase query
- Test data fetching with preview data

**Week 2: Audio Engine Foundation**
- Implement AudioEngine with single AVPlayer
- Test audio streaming with one station
- Implement crossfade algorithm with dual AVPlayers
- Add volume ramping with CADisplayLink (60 FPS)
- Test crossfade smoothness and timing
- Implement 10-second timeout with auto-skip

**Week 3: UI & Navigation**
- Build StationCarouselView with vertical paging
- Implement StationCardView with metadata overlay
- Add DragGesture with velocity threshold
- Implement smooth transitions (0.75s spring animation)
- Add haptic feedback on swipe
- Test gesture responsiveness

**Week 4: Integration & Error Handling**
- Connect AudioEngine to StationViewModel
- Implement "Tap to start" overlay (AVAudioSession activation)
- Add loading states during crossfade
- Implement error display with auto-skip notification
- Test full user flow end-to-end

**Deliverable:** Functional audio streaming app with smooth crossfading and gesture navigation

### Phase 2: Enhanced Mobile Experience (Weeks 5-8)

**Week 5: Background Playback**
- Configure Audio background mode in Info.plist
- Set up AVAudioSession with .playback category
- Implement MPNowPlayingInfoCenter (lock screen metadata)
- Add MPRemoteCommandCenter handlers (play/pause/next/previous)
- Test background playback and lock screen controls
- Handle audio interruptions (phone calls, Siri, alarms)

**Week 6: Video Backgrounds**
- Implement VideoBackgroundView with WKWebView
- Parse YouTube URLs and build embed URLs with parameters
- Handle video_start_time and video_end_time
- Add fallback to static logo images
- Implement fade transitions between videos
- Test video loading and looping

**Week 7: Preloading & Optimization**
- Implement intelligent preloading (current + next + previous)
- Add LRU cache for AVPlayerItem instances
- Optimize memory usage (unload distant stations)
- Add network reachability detection
- Implement offline state handling
- Profile performance and memory

**Week 8: Polish & Accessibility**
- Add VoiceOver support (accessibility labels)
- Implement Dynamic Type (scalable text)
- Add Dark Mode support
- Implement app icon and launch screen
- Add subtle animations and transitions
- Fix edge cases and bugs

**Deliverable:** Polished iOS app with full mobile enhancements

### Phase 3: Testing & Launch (Weeks 9-10)

**Week 9: Testing**
- Unit tests for AudioEngine crossfading logic
- Unit tests for StationViewModel navigation
- UI tests for gesture navigation flow
- Test on physical devices (iPhone 12, 13, 14, 15)
- Test on various iOS versions (15, 16, 17)
- Performance profiling (Instruments)
- Battery life testing

**Week 10: Beta & Launch Prep**
- TestFlight beta release (20-50 testers)
- Gather feedback on crossfade quality and UX
- Fix critical bugs and performance issues
- Prepare App Store assets (screenshots, description, preview video)
- App Store metadata and compliance review
- Submit to App Store

**Deliverable:** Public iOS app launch

### Phase 4: Post-Launch Iteration (Weeks 11-12)

- Monitor crash reports and analytics
- Fix bugs reported by users
- Iterate on user feedback
- Optimize performance based on real-world usage
- Plan feature enhancements (favorites, sharing, etc.)

## Android App Strategy (Phase 2)

### Timeline
Start Android development after iOS app is live and stable (approximately Week 13)

### Architecture Parallels

| iOS | Android | Notes |
|-----|---------|-------|
| Swift | Kotlin | Modern, type-safe languages |
| SwiftUI | Jetpack Compose | Declarative UI frameworks |
| AVFoundation | ExoPlayer | Media playback |
| AVAudioSession | MediaSession | Background playback |
| MPNowPlayingInfo | MediaMetadata | Lock screen controls |
| Supabase Swift | Supabase Kotlin | Same backend |

### Key Differences

**Audio Crossfading:**
- Android: Use ExoPlayer with two instances + volume control
- MediaPlayer is limited, ExoPlayer offers better control
- Implement custom crossfading similar to iOS approach

**Background Playback:**
- Requires foreground service (Android 8.0+)
- Show persistent notification with playback controls
- MediaSession integration for system media controls

**Gestures:**
- Jetpack Compose Modifier.draggable or Modifier.pointerInput
- Similar gesture threshold and velocity logic

### Estimated Timeline
6-8 weeks for Android app (benefits from iOS lessons learned)

## Critical Technical Challenges

### Challenge 1: Smooth Audio Crossfading on iOS

**Problem:** AVFoundation doesn't have Web Audio API's GainNode for precise volume control

**Solutions Evaluated:**

**Option A: AVPlayer.volume ramping (Simplest)**
```swift
var displayLink: CADisplayLink?
var crossfadeStartTime: CFTimeInterval = 0

func startCrossfade() {
    displayLink = CADisplayLink(target: self, selector: #selector(updateVolumes))
    displayLink?.add(to: .main, forMode: .common)
}

@objc func updateVolumes() {
    let elapsed = CADisplayLink.timestamp - crossfadeStartTime
    let progress = min(elapsed / crossfadeDuration, 1.0)

    primaryPlayer?.volume = Float(1.0 - progress)
    secondaryPlayer?.volume = Float(progress)

    if progress >= 1.0 {
        displayLink?.invalidate()
        // Swap players
    }
}
```

**Option B: AVAudioEngine with mixer nodes (More Control)**
- Use AVAudioPlayerNode + AVAudioEngine
- Control volume via AVAudioMixerNode
- More complex but allows precise gain curves
- Better for advanced audio processing

**Recommendation:** Start with **Option A** (simpler, proven approach), migrate to **Option B** if needed for quality improvements.

### Challenge 2: Background Audio Playback

**iOS Requirements:**
1. Add "Audio, AirPlay, and Picture in Picture" background mode
2. Configure AVAudioSession before playback
3. Implement Now Playing info updates
4. Handle remote control commands

**Implementation:**
```swift
// Info.plist
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>

// Audio Session Setup
try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
try AVAudioSession.sharedInstance().setActive(true)

// Now Playing Info
var nowPlayingInfo = [String: Any]()
nowPlayingInfo[MPMediaItemPropertyTitle] = station.name
nowPlayingInfo[MPMediaItemPropertyArtist] = "\(station.city ?? ""), \(station.country)"
nowPlayingInfo[MPNowPlayingInfoPropertyIsLiveStream] = true
MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo

// Remote Commands
MPRemoteCommandCenter.shared().playCommand.addTarget { _ in .success }
MPRemoteCommandCenter.shared().pauseCommand.addTarget { _ in .success }
MPRemoteCommandCenter.shared().nextTrackCommand.addTarget { _ in
    self.goToNext()
    return .success
}
```

### Challenge 3: YouTube Video Backgrounds

**iOS WKWebView Approach:**
```swift
struct YouTubePlayerView: UIViewRepresentable {
    let videoURL: String
    let startTime: Int?
    let endTime: Int?

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)

        // Build YouTube embed URL with parameters
        var urlString = "https://www.youtube.com/embed/\(videoID)?autoplay=1&mute=1&loop=1&controls=0&playsinline=1"
        if let start = startTime { urlString += "&start=\(start)" }
        if let end = endTime { urlString += "&end=\(end)" }

        webView.load(URLRequest(url: URL(string: urlString)!))
        return webView
    }
}
```

**Challenges:**
- YouTube embeds may not loop perfectly with start/end times
- Need custom JavaScript message handling for loop detection
- Performance overhead of WKWebView

**Alternative for Production:**
- Pre-process videos to MP4, host on CDN (Cloudflare, AWS CloudFront)
- Use AVPlayerLayer with AVPlayerLooper for seamless looping
- Better performance and reliability

### Challenge 4: Memory Management

**Problem:** Cannot preload all 17 audio streams on mobile

**Solution: Intelligent Preloading Strategy**
```swift
class AudioEngine {
    private var playerCache: [String: AVPlayer] = [:]
    private let maxCachedPlayers = 3

    func preloadStations(current: Int, stations: [Station]) {
        let indicesToLoad = [
            current,
            (current + 1) % stations.count,
            (current - 1 + stations.count) % stations.count
        ]

        // Load current, next, previous
        for index in indicesToLoad {
            if playerCache[stations[index].id] == nil {
                loadStation(stations[index])
            }
        }

        // Unload distant stations (LRU cache)
        let idsToKeep = Set(indicesToLoad.map { stations[$0].id })
        playerCache = playerCache.filter { idsToKeep.contains($0.key) }
    }
}
```

### Challenge 5: Stream URL Compatibility

**Validation Required:**
All 17 stream URLs need testing on iOS AVPlayer. Some formats may not be compatible.

**Common Issues:**
- HLS streams work best on iOS (.m3u8)
- Some ShoutCast/Icecast streams may have CORS issues
- AAC and MP3 streams generally work well

**Solution:**
Test each station's stream_url on physical iOS device during Week 2. Work with station providers to get compatible stream URLs if needed.

## Reusable Patterns from Web App

### 1. Station Data Model
**From:** `/types/station.ts`

**Port to Swift:**
```swift
struct Station: Codable, Identifiable {
    let id: String
    let name: String
    let logoURL: String
    let videoURL: String?
    let videoStartTime: Int?
    let videoEndTime: Int?
    let streamURL: String
    let country: String
    let city: String?
    let genre: String?
    let displayOrder: Int
    let isActive: Bool
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id, name, country, city, genre
        case logoURL = "logo_url"
        case videoURL = "video_url"
        case videoStartTime = "video_start_time"
        case videoEndTime = "video_end_time"
        case streamURL = "stream_url"
        case displayOrder = "display_order"
        case isActive = "is_active"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

### 2. Crossfade Timing Logic
**From:** `/lib/audio-engine.ts` and `/contexts/AudioContext.tsx`

**Key Constants:**
- Crossfade duration: 1.8 seconds
- Volume ramp: Linear (can be enhanced with ease-in-out)
- Update frequency: 60 FPS (CADisplayLink on iOS)
- Timeout on stream load: 10 seconds

### 3. Navigation State Pattern
**From:** `/contexts/StationContext.tsx`

**Reducer Actions:**
- GO_TO_NEXT
- GO_TO_PREVIOUS
- GO_TO_STATION
- SET_LOADING
- SET_ERROR

**Port to SwiftUI @Published properties with similar action methods**

### 4. Supabase Query Pattern
**From:** `/hooks/useStations.ts`

```typescript
const { data, error } = await supabase
  .from("stations")
  .select("*")
  .eq("is_active", true)
  .order("display_order", { ascending: true });
```

**Port to Swift (Supabase Swift SDK):**
```swift
let response = try await supabase
    .from("stations")
    .select()
    .eq("is_active", value: true)
    .order("display_order", ascending: true)
    .execute()

let stations = try response.decode(to: [Station].self)
```

## Testing Strategy

### Unit Tests (XCTest)
- AudioEngine crossfade calculations
- StationViewModel navigation logic
- Supabase response decoding
- Error handling and retry mechanisms

### UI Tests (XCTest + XCUITest)
- Vertical swipe gesture navigation
- "Tap to start" flow
- Error state display
- Loading state transitions

### Manual Testing Checklist
- [ ] Audio plays smoothly with no clicks/pops during crossfade
- [ ] Swipe gestures are responsive (< 16ms touch response)
- [ ] Background playback continues when app is backgrounded
- [ ] Lock screen controls work (play/pause/next/previous)
- [ ] App handles phone calls gracefully (audio ducks and resumes)
- [ ] Video backgrounds load and loop correctly
- [ ] Error states display and auto-skip works
- [ ] App works on cellular and WiFi
- [ ] App handles network loss gracefully
- [ ] Memory usage stays under 100 MB
- [ ] Battery drain is minimal (< 5% per hour)

### Device Testing Matrix
- iPhone 15 Pro (iOS 17)
- iPhone 14 (iOS 17)
- iPhone 13 (iOS 16)
- iPhone 12 (iOS 15)
- iPhone SE 3rd gen (iOS 16)

### Beta Testing (TestFlight)
- 30-50 beta testers
- 2-week beta period
- Focus areas: crossfade quality, gesture feel, battery life
- Gather feedback via in-app feedback form

## App Store Requirements

### Metadata
- **App Name:** Dernier Cri Live
- **Category:** Music
- **Age Rating:** 4+ (no objectionable content)
- **Keywords:** radio, streaming, music, discover, global, live

### Required Assets
- App Icon (1024x1024 PNG)
- Screenshots (iPhone 6.7", 6.5", 5.5" + iPad 12.9", 11")
- App Preview video (optional but recommended)
- Privacy policy URL
- Support URL

### Privacy Considerations
- No user data collection initially
- Network usage for streaming (disclosed in privacy manifest)
- Analytics (optional, via Firebase/TelemetryDeck)

### App Store Review Considerations
- Audio streaming apps are generally approved if content is legal
- Ensure all radio stations have proper streaming licenses
- Test all 17 streams to ensure no broken/offensive content
- Background audio justification: music streaming app

## Success Metrics

### Technical KPIs
- Crash-free rate: > 99.5%
- Average session length: > 15 minutes
- Audio error rate: < 2% (stream failures)
- Cold start time: < 2 seconds
- Time to first audio: < 3 seconds

### User Experience KPIs
- Swipe gesture success rate: > 95%
- Crossfade quality rating: > 4.5/5 (user survey)
- App Store rating: > 4.5/5
- Day 1 retention: > 40%
- Day 7 retention: > 20%

### Performance Benchmarks
- 60 FPS during swipe animations
- Memory usage: < 100 MB
- Battery drain: < 5% per hour
- Network usage: ~128 kbps per stream (varies by station)

## Future Enhancements (Post-Launch)

### V1.1 Features
- Favorites / bookmarking stations
- Share station via social media
- Station search and filtering by genre/country
- Recently played history

### V1.2 Features
- User accounts (Supabase Auth)
- Cross-device sync (listen history, favorites)
- Sleep timer
- Audio quality selection (low/high bandwidth)

### V2.0 Features
- Offline mode (download and cache audio for offline playback)
- Apple Watch companion app
- CarPlay integration
- Siri shortcuts ("Play Radio Nova")
- Widget for lock screen/home screen

### Advanced Features
- AI-powered station recommendations
- Social features (follow friends, see what they're listening to)
- Station chat/comments
- DJ schedule and show information
- Push notifications for favorite shows going live

## Risk Mitigation

### Risk 1: Audio Crossfade Quality Not Matching Web App
**Likelihood:** Medium
**Impact:** High (core feature)
**Mitigation:**
- Prototype audio crossfading in isolation during Week 1
- Test with multiple stream types (MP3, AAC, HLS)
- Iterate on crossfade algorithm if needed
- Consider AVAudioEngine if AVPlayer volume ramping is insufficient

### Risk 2: Stream URLs Not Compatible with iOS
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Test all 17 stream URLs on iOS during Week 2
- Have fallback streams ready
- Work with station providers for compatible formats
- Implement robust error handling and auto-skip

### Risk 3: YouTube Video Background Performance Issues
**Likelihood:** Medium
**Impact:** Low (can fallback to static images)
**Mitigation:**
- Start with static images as fallback
- WKWebView YouTube embed as enhancement
- Plan video preprocessing pipeline for V1.1

### Risk 4: App Store Rejection
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Review App Store guidelines thoroughly
- Ensure all content is properly licensed
- Test background audio compliance
- Prepare detailed rejection response plan

### Risk 5: Battery Drain Complaints
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Profile battery usage during development
- Optimize by using native APIs (AVFoundation, not WebView)
- Implement automatic sleep timer (default 2 hours)
- Add battery usage tips in app

## Budget & Timeline Summary

### iOS Development Timeline
- **Weeks 1-4:** Core streaming experience (40 hours/week = 160 hours)
- **Weeks 5-8:** Enhanced mobile features (40 hours/week = 160 hours)
- **Weeks 9-10:** Testing and launch (40 hours/week = 80 hours)
- **Weeks 11-12:** Post-launch iteration (20 hours/week = 40 hours)

**Total iOS Effort:** 440 hours (11 weeks)

### Android Development Timeline
- **Weeks 13-20:** Android app development (6-8 weeks, ~240-320 hours)

**Total Project Effort:** 680-760 hours

### Budget Estimate
- iOS: 440 hours × $100-150/hour = $44,000 - $66,000
- Android: 300 hours × $100-150/hour = $30,000 - $45,000
- **Total:** $74,000 - $111,000

### Cost-Saving Options
- Build MVP first (Weeks 1-4 only): ~$16,000 - $24,000
- iOS only: ~$44,000 - $66,000
- Contract developer vs. full-time hire

## Critical Files to Reference During Implementation

### Data Model & Types
- `/types/station.ts` - Station interface definition
- `/supabase/migrations/001_initial_schema.sql` - Database schema

### Audio Crossfading Logic
- `/lib/audio-engine.ts` - Web Audio API implementation pattern
- `/contexts/AudioContext.tsx` - Audio state management and crossfade orchestration

### Navigation & State Management
- `/contexts/StationContext.tsx` - Station navigation reducer logic
- `/hooks/useSwipe.ts` - Gesture detection patterns

### UI Components
- `/components/StationCarousel.tsx` - Main view controller architecture
- `/components/VideoEmbed.tsx` - Video background implementation approach

### Backend Integration
- `/lib/supabase.ts` - Supabase client configuration
- `/hooks/useStations.ts` - Data fetching patterns

## Verification & Testing Plan

### End-to-End Testing Scenarios

1. **First Launch Flow**
   - Open app → See "Tap to start" overlay → Tap → Hear first station playing
   - Verify: Audio plays, station metadata displays, video/image loads

2. **Navigation Flow**
   - Swipe up → Crossfade to next station → See updated metadata
   - Swipe down → Crossfade to previous station
   - Swipe rapidly 5 times → Verify smooth transitions, no crashes
   - Verify: Crossfades are smooth (no clicks/pops), haptic feedback works

3. **Background Playback Flow**
   - Play station → Press home button → Audio continues
   - Open lock screen → See station metadata and controls
   - Tap next on lock screen → Station changes
   - Verify: Background playback works, lock screen controls functional

4. **Error Handling Flow**
   - Disconnect network → See error message → Auto-skip to next station
   - Play station with broken stream URL → See timeout after 10 seconds → Auto-skip
   - Verify: Errors display clearly, auto-skip works

5. **Edge Cases**
   - Receive phone call during playback → Audio pauses → End call → Audio resumes
   - Play music in Apple Music → Open app → Dernier Cri takes over audio
   - Enable silent mode → Audio still plays (playback category)
   - Verify: Audio interruptions handled gracefully

### Performance Profiling (Xcode Instruments)
- Time Profiler: Ensure crossfade calculations don't block main thread
- Allocations: Monitor memory usage stays under 100 MB
- Leaks: No memory leaks in audio engine or view models
- Energy Log: Measure battery impact during 1-hour playback session

### Acceptance Criteria
- ✅ All 17 stations play without errors
- ✅ Crossfade sounds smooth (no audible clicks or pops)
- ✅ Swipe gestures feel responsive (< 100ms latency)
- ✅ Background playback works on lock screen
- ✅ App survives phone call interruptions
- ✅ Memory usage < 100 MB during typical use
- ✅ No crashes during 30-minute continuous playback
- ✅ App launches in < 2 seconds on iPhone 12+

## Next Steps After Plan Approval

1. Create Xcode project with SwiftUI App template
2. Set up Supabase Swift package dependency
3. Configure project settings (bundle ID, team, capabilities)
4. Implement Station model and SupabaseClient
5. Begin Week 1 tasks (data layer implementation)

---

## Summary

This plan outlines a native iOS-first approach for Dernier Cri Live mobile app, emphasizing quality and mobile-specific enhancements. The architecture leverages Swift/SwiftUI with AVFoundation for audio, maintaining the signature smooth crossfading experience from the web app while adding background playback, lock screen controls, and haptic feedback.

The 11-week iOS development timeline prioritizes building a polished, performant app that feels truly native to iOS. Android will follow using similar patterns in Kotlin/Jetpack Compose, benefiting from lessons learned during iOS development.

Key technical challenges (audio crossfading, background playback, YouTube videos) have proven solutions, making this a low-risk, high-quality approach that aligns with your "quality over speed" priority.
