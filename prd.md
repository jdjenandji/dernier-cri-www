# dernier cri live - Product Requirements Document

## 1. Executive Summary

**Product Name:** dernier cri live

**Vision:** dernier cri live is a minimalist web app that transforms live radio listening into an effortless, scroll-based discovery experience. Users explore a curated selection of global radio stations through an intuitive vertical swipe interface, creating the perfect ambient audio companion for work and focus.

**Target Audience:** People seeking ambient/background audio while working who want a zero-friction listening experience without the burden of choice or playlist curation.

**Core Value Proposition:** Instant access to global radio through a mindless scroll—no decisions, no setup, just pure audio ambiance.

---

## 2. Product Overview

### 2.1 Problem Statement
Current radio listening experiences require too much friction: searching for stations, managing favorites, navigating complex interfaces. Users seeking simple background audio while working don't want to make decisions—they want to explore and settle into ambient sound effortlessly.

### 2.2 Solution
dernier cri live delivers a TikTok-style vertical scroll interface for live radio stations. Users swipe through 10-30 carefully curated global stations with seamless crossfades, minimal UI, and zero feature bloat. Open the app, land on a live station, scroll to explore.

### 2.3 Success Metrics
- **Primary:** Average session duration (target: 45+ minutes)
- **Secondary:** Stations explored per session (target: 5-8)
- **Secondary:** Return user rate (target: 40% weekly return)
- **Engagement:** Daily active users (DAU)

---

## 3. User Stories & Use Cases

### 3.1 Primary User Persona
**Name:** Alex, the Focused Worker  
**Age:** 25-40  
**Context:** Works remotely or in open office, needs ambient audio to maintain focus  
**Behavior:** Opens app in morning, lets it play in background tab, occasionally scrolls when current station loses appeal  
**Needs:** Zero-friction listening, global variety, no decision fatigue

### 3.2 Core User Stories
1. **As a user**, I want to immediately hear live radio when I open the app, so I can start my work without any setup
2. **As a user**, I want to swipe between stations smoothly, so I can find the right ambient vibe without interruption
3. **As a user**, I want to see what station I'm listening to, so I have basic context without visual clutter
4. **As a user**, I want to hear stations from around the world, so I get variety beyond my local market

### 3.3 Use Cases
- **Morning Work Session:** User opens app at 9am, lands on French jazz station, scrolls twice to find Brazilian MPB, leaves playing for 3 hours
- **Focus Recovery:** User has lost concentration, scrolls through 5 stations to find the right energy, settles on ambient electronica from Tokyo
- **Background Browse:** User scrolls mindlessly during a boring call, discovering new stations without committing

---

## 4. Functional Requirements

### 4.1 Core Features

#### 4.1.1 Vertical Scroll Interface
- **FR-001:** App must display one radio station at a time in full-screen view
- **FR-002:** User can swipe up to move to next station in curated feed
- **FR-003:** User can swipe down to return to previous station
- **FR-004:** Scroll gestures must work on both mobile touch and desktop trackpad/mouse
- **FR-005:** Scroll sensitivity should match TikTok-style interaction (single deliberate swipe = station change)

#### 4.1.2 Audio Playback
- **FR-006:** Audio playback must start automatically on app launch with random station from catalog
- **FR-007:** All stations must stream live broadcasts (real-time, not on-demand)
- **FR-008:** Transitioning to new station must trigger audio crossfade (previous fades out while new fades in)
- **FR-009:** Crossfade duration: 1.5-2 seconds
- **FR-010:** Audio must continue playing when app is in background tab
- **FR-011:** Playback must handle network interruptions gracefully (reconnect attempt, loading state)

#### 4.1.3 Visual Interface
- **FR-012:** Each station view displays station name prominently
- **FR-013:** Each station view displays station logo/image
- **FR-014:** UI must be minimal with no additional metadata (no song titles, artist info, etc.)
- **FR-015:** Interface must adapt responsively to desktop and mobile web browsers
- **FR-016:** Background design should be clean and non-distracting (solid color or subtle gradient)

#### 4.1.4 Station Catalog
- **FR-017:** Curated catalog must contain 10-30 live radio stations
- **FR-018:** Stations must represent global geographic diversity
- **FR-019:** Station feed order is editorially curated (not algorithmic)
- **FR-020:** Catalog must include station metadata: name, logo, stream URL, geographic origin
- **FR-021:** Catalog is managed via admin/CMS system (out of scope for MVP, hard-coded acceptable)

### 4.2 Explicitly Out of Scope (MVP)
- User accounts or authentication
- Favorites/bookmarks functionality
- Sharing capabilities
- Volume controls (users use system volume)
- Station search or filtering
- Social features (comments, likes, reactions)
- Playlist history or "previously played"
- Skip forward/backward in time
- Station reporting or blocking
- Native mobile apps (web-only for MVP)
- Monetization features (ads, subscriptions)

---

## 5. Non-Functional Requirements

### 5.1 Performance
- **NFR-001:** Station transition (scroll + crossfade) must complete within 2 seconds
- **NFR-002:** Initial audio playback must start within 3 seconds of app load
- **NFR-003:** Audio buffering must prevent interruptions during normal network conditions
- **NFR-004:** App must load and be interactive within 2 seconds on 4G connection

### 5.2 Compatibility
- **NFR-005:** Must support Chrome, Safari, Firefox, Edge (latest 2 versions)
- **NFR-006:** Must work on iOS Safari and Android Chrome for mobile web
- **NFR-007:** Must be responsive for screen sizes from 320px (mobile) to 2560px (desktop)

### 5.3 Reliability
- **NFR-008:** App uptime target: 99.5%
- **NFR-009:** Must handle station stream failures gracefully (auto-skip to next station after 10-second timeout)
- **NFR-010:** Must work offline for UI (show error state when no connectivity)

### 5.4 Accessibility
- **NFR-011:** Must support keyboard navigation (arrow up/down for station change)
- **NFR-012:** Must include ARIA labels for screen readers
- **NFR-013:** Must meet WCAG 2.1 Level AA standards for contrast and readability

---

## 6. Technical Architecture

### 6.1 Frontend Stack
- **Framework:** React or Vue.js (SPA - Single Page Application)
- **Styling:** Tailwind CSS or styled-components
- **Audio:** HTML5 Audio API or Howler.js library
- **Gestures:** React Swipeable or Hammer.js for touch/swipe detection

### 6.2 Backend Requirements
- **API Endpoint:** Serves station catalog JSON (station name, logo URL, stream URL, metadata)
- **Hosting:** Static hosting (Vercel, Netlify) + CDN for assets
- **Streaming:** Stations use their own streaming infrastructure (app consumes public streams)

### 6.3 Data Model

```json
{
  "stations": [
    {
      "id": "station_001",
      "name": "Radio Nova",
      "logo_url": "https://cdn.example.com/logos/nova.png",
      "stream_url": "https://nova.ice.infomaniak.ch/nova-128.mp3",
      "country": "France",
      "city": "Paris",
      "genre": "Eclectic"
    }
  ]
}
```

### 6.4 Key Technical Considerations
- **Audio Crossfade:** Use Web Audio API with GainNode for smooth volume transitions
- **Stream Format:** Prefer MP3 or AAC streams with broad browser support
- **State Management:** Track current station index, playback state, loaded status
- **Preloading:** Consider preloading next/previous station audio for instant transitions

---

## 7. User Experience (UX) Specifications

### 7.1 User Flow
1. User navigates to app URL
2. App loads → immediately selects random station from catalog
3. Audio begins playing (3-second max delay)
4. User sees station name + logo on screen
5. User swipes up → crossfade to next station (1.5s transition)
6. User swipes down → crossfade to previous station
7. User leaves tab open, audio continues in background

### 7.2 Visual Design Principles
- **Minimalism:** Absolute minimum UI elements (station name, logo only)
- **Focus:** Design should fade into background, not compete for attention
- **Clarity:** Station identity must be immediately clear
- **Calm:** Color palette should be neutral, soothing (avoid aggressive colors)

### 7.3 Interaction Design
- **Swipe Gesture:** Deliberate vertical swipe (50px threshold) triggers station change
- **Scrolling Feel:** Snappy but not jarring—each station "settles" into place
- **Visual Feedback:** Subtle animation/transition during scroll (station slides in/out)
- **Loading States:** Show subtle loading indicator if station takes >1s to start

### 7.4 Error States
- **Stream Failure:** Display "Station unavailable" + auto-advance to next station after 10s
- **No Network:** Display "No internet connection" + pause playback
- **Empty Catalog:** Display "No stations available" (should never happen in production)

---

## 8. Business & Go-to-Market

### 8.1 Business Model
- **Launch Phase:** Completely free, no monetization
- **Future Considerations:** (not in scope for MVP)
  - Premium tier with expanded catalog
  - Station sponsorships
  - Subtle visual ads (non-intrusive)

### 8.2 Launch Strategy
- **MVP Scope:** Web app with 10-30 curated stations
- **Target Launch:** Define timeline based on development capacity
- **Marketing Channels:** 
  - Product Hunt launch
  - Share on design/productivity communities (Reddit, Hacker News)
  - Word-of-mouth through early testers

### 8.3 Future Roadmap (Post-MVP)
- **Phase 2:** Native mobile apps (iOS, Android)
- **Phase 3:** Expand catalog to 50+ stations
- **Phase 4:** Optional user accounts with minimal features (listening history)
- **Phase 5:** Light personalization (station order based on listening patterns)

---

## 9. Development Phases

### Phase 1: MVP (Weeks 1-4)
- Core vertical scroll interface
- Audio playback with crossfade
- Hard-coded catalog of 15 stations
- Responsive design (mobile + desktop web)
- Basic error handling

### Phase 2: Polish (Weeks 5-6)
- Accessibility improvements (keyboard nav, ARIA)
- Loading state refinements
- Audio optimization (preloading, buffering)
- Browser compatibility testing

### Phase 3: Launch Prep (Week 7-8)
- Final station curation (expand to 25-30 stations)
- Performance optimization
- Analytics integration (session duration, station skips)
- Landing page / marketing materials

---

## 10. Success Criteria & Metrics

### 10.1 Launch Success Criteria
- App loads and plays audio within 3 seconds on 4G
- Zero critical bugs in cross-browser testing
- Smooth crossfades with no audio glitches
- Positive initial user feedback (5+ early testers)

### 10.2 Post-Launch KPIs (Month 1)
- **Engagement:** 45+ minute average session duration
- **Retention:** 40% of users return within 7 days
- **Discovery:** Users scroll through 5-8 stations per session
- **Technical:** <2% error rate on station loads

### 10.3 Long-term Indicators (Months 2-6)
- Organic growth in daily active users
- Session duration remains stable or increases
- Low churn rate (users keep returning)
- Positive qualitative feedback on "mindless" listening experience

---

## 11. Open Questions & Assumptions

### Assumptions
1. Public radio station streams are legally accessible for embedding
2. Users have stable internet connection (minimum 4G/WiFi)
3. Target audience tolerates non-personalized station feed
4. Browser audio APIs support required crossfade quality
5. Minimal UI is sufficient to retain user interest

### Open Questions for Future Resolution
1. How do we handle station stream licenses/permissions at scale?
2. Should we allow any user control beyond scrolling (e.g., system volume warning)?
3. What analytics are essential without violating user privacy?
4. Should catalog update dynamically or remain static post-launch?
5. How do we measure "quality" of curation to improve station selection?

---

## 12. Appendix

### 12.1 Competitive Landscape
- **TuneIn Radio:** Full-featured app with search, favorites, too complex
- **Radio Garden:** Globe-based exploration, more discovery-focused than ambient
- **Poolside.fm:** Curated stations but limited selection, desktop-only
- **Differentiation:** dernier cri live combines TikTok's scroll UX with radio's lean-back simplicity

### 12.2 Technical References
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Howler.js: https://howlerjs.com/
- React Swipeable: https://github.com/FormidableLabs/react-swipeable

### 12.3 Sample Station Catalog (MVP)
1. Radio Nova (Paris, France) - Eclectic
2. NTS Radio (London, UK) - Alternative
3. dublab (Los Angeles, USA) - Electronic
4. Radar Radio (London, UK) - Underground
5. Kiosk Radio (Brussels, Belgium) - Experimental
6. Worldwide FM (London, UK) - Global
7. The Lot Radio (New York, USA) - Community
8. Radio Alhara (Bethlehem, Palestine) - Cultural
9. Netil Radio (London, UK) - Independent
10. Radio Quantica (Buenos Aires, Argentina) - Jazz/Electronic
11. Cashmere Radio (Berlin, Germany) - Experimental
12. Rinse FM (London, UK) - Electronic/Grime
13. Red Light Radio (Amsterdam, Netherlands) - House/Techno
14. Radio Raheem (Milan, Italy) - Hip-hop/Soul
15. Refuge Worldwide (Berlin, Germany) - Global

(Expand to 25-30 before launch with geographic and genre diversity)

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Owner:** Product Team  
**Status:** Draft for Review