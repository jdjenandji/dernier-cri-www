# iOS App Setup Guide

Quick start guide for building the Dernier Cri Live iOS app.

## Quick Setup

### 1. Create Xcode Project

```bash
# Open Xcode and create new project
# or use command line:
xcodebuild -project DernierCriLive.xcodeproj
```

**Project Settings:**
- Product Name: `DernierCriLive`
- Bundle ID: `com.derniercri.live`
- Interface: SwiftUI
- iOS Deployment: 15.0+

### 2. Install Dependencies via Swift Package Manager

Add to your project:
```
https://github.com/supabase-community/supabase-swift
```

### 3. Configure Credentials

```bash
cd ios/DernierCriLive/Resources
cp Supabase.plist.example Supabase.plist
```

Edit `Supabase.plist`:
```xml
<key>SUPABASE_URL</key>
<string>YOUR_SUPABASE_URL</string>
<key>SUPABASE_ANON_KEY</key>
<string>YOUR_ANON_KEY</string>
```

### 4. Add Files to Xcode

Right-click project → **Add Files** → Select all directories:
- ✅ Copy items if needed
- ✅ Create groups
- ✅ Add to DernierCriLive target

### 5. Build & Run

Press **⌘R** or click the Play button.

## File Import Checklist

Ensure these directories are added to Xcode:

```
✅ App/
   ✅ DernierCriLiveApp.swift
   ✅ AppDelegate.swift

✅ Models/
   ✅ Station.swift
   ✅ AudioState.swift

✅ Services/
   ✅ AudioEngine/
      ✅ AudioPlayer.swift
      ✅ AudioCrossfadeEngine.swift
   ✅ Network/
      ✅ SupabaseClient.swift
      ✅ StationService.swift

✅ ViewModels/
   ✅ StationViewModel.swift
   ✅ AudioViewModel.swift
   ✅ CarouselViewModel.swift

✅ Views/
   ✅ ContentView.swift
   ✅ TapToStartView.swift
   ✅ StationCarouselView.swift
   ✅ StationCardView.swift
   ✅ LoadingView.swift
   ✅ ErrorView.swift
   ✅ Components/
      ✅ StationInfoView.swift
      ✅ NavigationHintView.swift

✅ Utilities/
   ✅ Constants.swift

✅ Resources/
   ✅ Info.plist
   ✅ Supabase.plist (add manually, not in git)
```

## Verification

After setup, verify:

1. **Project builds without errors**
   ```bash
   ⌘B (Build)
   ```

2. **All imports resolve**
   - Check for red errors in Xcode
   - Resolve any missing dependencies

3. **Supabase connection works**
   - Run app and check for station loading
   - Verify console logs

4. **Audio plays**
   - Test on physical device (recommended)
   - Check volume and mute switch

## Common Issues

### "No such module 'Supabase'"
→ Add Swift Package Dependency again
→ Clean build folder (⌘⇧K)
→ Restart Xcode

### "Cannot find 'Station' in scope"
→ Ensure all files are added to target
→ Check file membership in File Inspector

### Audio doesn't play
→ Test on physical device
→ Check Supabase credentials
→ Verify stream URLs in database

### Build fails with signing errors
→ Set team in Signing & Capabilities
→ Use automatic signing

## Next Steps

1. **Test Core Features**
   - Tap to start
   - Swipe navigation
   - Crossfade smoothness

2. **Deploy to TestFlight**
   - Archive build
   - Upload to App Store Connect

3. **Implement Phase 2**
   - Lock screen controls
   - Video backgrounds
   - Haptic feedback

## Support

For issues or questions:
- Check README.md for detailed docs
- Review the implementation plan
- Test on physical device before reporting bugs
