# iOS App Quick Start

**Get the Dernier Cri Live iOS app running in 10 minutes.**

## Prerequisites
- Xcode 15.0+
- macOS with Apple Silicon or Intel
- Supabase credentials

## 5-Step Setup

### 1️⃣ Create Xcode Project (2 min)
```
File → New → Project → iOS App
```
- Name: `DernierCriLive`
- Bundle ID: `com.derniercri.live`
- Interface: **SwiftUI**
- iOS: **15.0+**

### 2️⃣ Add Supabase SDK (1 min)
```
File → Add Package Dependencies
```
Paste: `https://github.com/supabase-community/supabase-swift`

### 3️⃣ Add Source Files (2 min)
Delete default `ContentView.swift`, then:
```
Right-click project → Add Files to "DernierCriLive"
```
Select all folders from `ios/DernierCriLive/`
- ✅ Copy items if needed
- ✅ Create groups

### 4️⃣ Configure Credentials (3 min)
```bash
cd ios/DernierCriLive/Resources
cp Supabase.plist.example Supabase.plist
```

Edit `Supabase.plist`:
```xml
<key>SUPABASE_URL</key>
<string>https://xxxxx.supabase.co</string>
<key>SUPABASE_ANON_KEY</key>
<string>your-key-here</string>
```

Add to Xcode: Right-click Resources → Add Files

### 5️⃣ Build & Run (2 min)
Press **⌘R**

## Expected Result
1. App launches with loading screen
2. Loads stations from Supabase
3. Shows random station with "Tap to Start"
4. After tap: audio plays
5. Swipe up/down to navigate

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "No such module 'Supabase'" | Clean build (⌘⇧K), restart Xcode |
| No audio | Test on real device, check stream URLs |
| Build errors | Ensure all files added to target |
| Supabase fails | Verify credentials in .plist |

## File Count Check
Should have **20 Swift files** total:
```bash
find ios/DernierCriLive -name "*.swift" | wc -l
# Expected: 20
```

## Key Constants
All match web app:
- Crossfade: **1.8s**
- Timeout: **10s**
- Auto-skip: **2s**
- Drag threshold: **15%**
- Velocity: **0.25 px/ms**

## Next Steps
1. Test on physical device
2. Verify crossfade smoothness
3. Check circular navigation
4. Test auto-skip on errors
5. Review implementation plan for Phase 2 features

## Architecture Overview
```
Data Layer (Models + Services)
    ↓
Business Logic (ViewModels)
    ↓
UI Layer (SwiftUI Views)
```

## Support Files
- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup
- `IMPLEMENTATION_SUMMARY.md` - Technical details

## Quick Test Checklist
- [ ] App builds without errors
- [ ] Stations load from Supabase
- [ ] Tap to start works
- [ ] Audio plays clearly
- [ ] Swipe up goes to next
- [ ] Swipe down goes to previous
- [ ] Crossfade is smooth (1.8s)
- [ ] Navigation is circular
- [ ] Lock device → audio continues

## Common Xcode Tasks

**Clean Build:**
```
Product → Clean Build Folder (⌘⇧K)
```

**Resolve Packages:**
```
File → Packages → Resolve Package Versions
```

**Reset Simulators:**
```
Device → Erase All Content and Settings
```

## Performance Targets
- Memory: < 100MB
- CPU: < 20% during playback
- Crossfade: Smooth with no glitches
- Navigation: Instant response

## Contact & Support
For issues:
1. Check diagnostic logs in Xcode console
2. Test on physical device (not simulator)
3. Verify Supabase data is valid
4. Review implementation docs

---

**Total Setup Time: ~10 minutes**
**Lines of Code: ~1,735**
**Dependencies: 1 (Supabase)**
**iOS Version: 15.0+**
