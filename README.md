# ✦ MoodPlay

Spotify Playlist Generator · Sound × Emotion

A React-based web application that generates Spotify playlists based on your current emotional state. Select from eight distinct moods and get real-time playlist recommendations with audio previews.

## Project Overview

MoodPlay is an interactive web application that maps emotional states to Spotify playlists. Instead of manually searching for songs, users select one of eight moods (euphoric, melancholic, energized, serene, romantic, focused, nostalgic, or rebellious) and the app intelligently searches Spotify's API to surface curated playlists matching the selected mood.

The entire interface reacts to the selected emotion: colors, gradients, animations, background effects, and UI accents dynamically shift to reflect the emotional tone.

### Key Features

- Eight distinct mood profiles with unique color palettes and Spotify search queries
- Real-time Spotify integration using PKCE OAuth authentication
- 30-second audio preview playback with requestAnimationFrame progress tracking
- Dynamic theme switching based on selected mood
- Animated space background with warp effects, glowing orbs, and twinkling stars
- Responsive design with smooth CSS animations
- Client-side hash-based routing (no external routing library)
- Custom PropTypes validation without external dependencies
- Full prop validation on every component

## Architecture & Design Patterns

### Component Hierarchy

```
App (Class Component - Root)
├── SpotifyProvider (Context Provider)
│   └── ThemeProvider (Context Provider)
│       └── HashRouter (Hash-based Routing)
│           └── AppShell (Layout & Route Container)
│               ├── SpaceBackground (Canvas Animation)
│               ├── WireframeSphere (Canvas 3D Sphere)
│               ├── NavBar (Navigation)
│               └── Route Components:
│                   ├── HomeView (Mood Selection)
│                   ├── PlaylistView (Results)
│                   └── AboutView (Information)
```

### State Management

The application uses multiple state management patterns:

- **Context API**: Global state for theme palette, router, and Spotify authentication
- **useState**: Component-level UI state (hover, selection, loading)
- **useReducer**: Complex Spotify playlist fetch state machine
- **sessionStorage**: Persisting OAuth tokens and PKCE verifiers across page navigation

### Routing Strategy

Custom HashRouter implementation that:

- Parses URL hash to determine current route and extract parameters
- Listens to hashchange events to update state when route changes
- Supports parameterized routes (e.g., /#/playlist/:moodId)
- Provides programmatic navigation via navigate() method
- Automatically cleans up OAuth redirect parameters to prevent replay attacks

## Technology Stack

### Core Technologies

**React 18+**
- Functional and class components
- Hooks: useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext
- Context API for global state management
- Custom hash-based router (no external library needed)

**Spotify Web API**
- OAuth 2.0 PKCE authentication flow
- Playlist search by mood query
- Track fetching with album art and preview URLs
- Bearer token authorization

**Canvas API**
- High-performance animated backgrounds
- Warp-speed star effects
- Glowing orb animations
- 3D wireframe sphere rendering with perspective projection

**Web Audio API**
- HTML5 Audio element for track previews
- requestAnimationFrame-based progress tracking
- Volume control and playback state management

**Crypto API**
- SHA-256 hashing for PKCE code challenge generation
- Secure random number generation for code verifier

**CSS-in-JS**
- Inline styles with dynamic theme colors
- CSS animations and transitions
- Backdrop filters and blur effects
- Responsive design with CSS Grid

## React Components

### Root & Providers (2 components)

**App (Class Component)**
- Root component managing mood state
- Orchestrates SpotifyProvider, ThemeProvider, and HashRouter
- Manages activeMoodId and previewMoodId state
- Updates document title based on selected mood
- Lifecycle: componentDidMount, componentDidUpdate, componentWillUnmount

**SpotifyProvider**
- Context provider wrapping useSpotifyAuth hook
- Exposes token, authentication status, login, and logout methods
- Single child component passed through children prop

### Routing & Context (3 components)

**HashRouter (Class Component)**
- Custom client-side routing using URL hashes
- Routes: /, /playlist/:moodId, /about
- Methods: navigate(to), goBack()
- Listens to hashchange events
- Auto-scrolls to top on route change

**ThemeProvider**
- Context provider managing current mood's palette
- Exposes theme colors to all child components via useMoodTheme hook
- Props: moodId (string), children (ReactNode)

**Route**
- Route matching component
- Props: path (string), component (function), exact (boolean)
- Renders component if current route matches specified path pattern

### Layout & Navigation (2 components)

**AppShell**
- Main layout component rendering space background, wireframe spheres, navigation bar, and route content
- Props: onMoodSelect, onMoodPreview, activeMoodId
- Manages backdrop animations and visual composition
- Renders 4 floating wireframe spheres with staggered delays
- Contains route definitions

**NavBar**
- Fixed navigation bar with logo, navigation links, and mood badge
- Props: activeMoodId (string)
- Displays currently selected mood with emoji and label
- Dynamic accent color based on selected mood
- Links: Home, About

### Views (3 components)

**HomeView (Class Component)**
- Landing page with all eight mood cards in responsive grid
- Props: onMoodSelect, onMoodPreview, preselectedMood
- State: selectedMood, hoveredMood, greeting, mounted
- Features: Dynamic time-based greetings, animation staggering, theme transitions
- Methods: _getGreeting(), _handleSelect(), _handleHover(), _handleLeave()
- Updates greeting every 60 seconds

**PlaylistView (Functional Component)**
- Displays Spotify playlist and its tracks
- Features: Album artwork, track duration, artist info, Spotify links, preview buttons
- Handles authentication flow, playlist search, track preview playback, error states
- Uses useContext for Router, Theme, and Spotify
- Uses useSpotifyMoodPlaylist hook for search and track fetching
- Uses useAudioPreview hook for preview playback
- Conditional rendering for: not authenticated, loading, error, success states

**AboutView (Functional Component)**
- Documentation page explaining how to use MoodPlay
- Details complete tech stack and React patterns used
- Displays numbered how-to guide (4 steps)
- Tech stack information table with 9 entries
- Props: none (uses context for theming and navigation)

### Spotify & Authentication (2 components)

**SpotifyConnectBanner**
- UI component prompting users to connect Spotify account
- Displays connection button, auth error messages, and security information
- Info box about Development Mode requirements
- Props: none (uses SpotifyContext and ThemeContext)

### Playlist & Tracks (2 components)

**MoodCard (Functional Component, Memoized)**
- Individual mood selection card with emoji, label, and description
- Props: mood, isSelected, onSelect, onHover, onLeave, animIndex
- Fully theme-aware with hover and selection states
- Animated entrance with staggered delays
- Emoji floats when selected
- Uses React.memo for performance optimization

**SpotifySongRow (Functional Component, Memoized)**
- Individual track row with album thumbnail, title, artist(s), duration, play button
- Props: track, index, playingId, onToggle
- Features: Preview playback button, Spotify link, album artwork, duration formatting
- Hover state for interactive feedback
- Uses React.memo for performance optimization
- Conditional SVG icon for play/pause state

### Canvas & Animation (2 components)

**SpaceBackground (Functional Component)**
- Full-screen canvas background with animated space effects
- Props: palette (object)
- Animations: Warp particles, orbital glows, twinkling stars
- Uses useAnimationFrame hook for rAF loop
- Handles window resize events
- Renders: Radial gradient background, 5 glowing orbs, 180 warp particles, 130 twinkling stars

**WireframeSphere (Functional Component)**
- 3D wireframe sphere rendered on canvas
- Props: size (number), color (string)
- Features: 3D rotation, perspective rendering, radial glow halo
- Uses useAnimationFrame hook for rAF loop
- Renders latitude and longitude lines with varying opacity
- Default size: 140px

## Custom Hooks (5 hooks)

### useMoodTheme(moodId)
- Derives color palette and mood object from mood ID
- Uses useMemo for performance
- Returns: { palette, mood }
- Dependency: moodId

### useSpotifyAuth()
- Complete PKCE OAuth flow with token persistence
- Returns: { token, isAuthenticated, login, logout, authLoading, authError }
- Handles:
  - Token restoration from sessionStorage
  - OAuth error capture from URL
  - Auth code exchange for access token
  - Token expiry management
  - Error handling for invalid scopes, network issues, session expiry

### useSpotifyMoodPlaylist(token)
- Searches Spotify playlists by mood and fetches tracks
- Uses useReducer for state machine (START, SUCCESS, ERROR, RESET)
- Returns: { playlist, tracks, loading, error, search, reset }
- Handles:
  - Playlist search by mood query
  - Track fetching from selected playlist
  - Filtering local tracks and empty previews
  - 401 Unauthorized errors
  - 403 Development Mode allowlist failures
  - Network errors

### useAudioPreview()
- Manages HTML Audio element for track preview playback
- Returns: { playingId, progress, toggle }
- Features:
  - Toggle play/pause preview
  - Track progress with requestAnimationFrame
  - Auto-cleanup on component unmount
  - Volume set to 0.7
  - Only one track can play at a time

### useAnimationFrame(callback)
- Runs callback on every animation frame
- Uses requestAnimationFrame for smooth 60fps rendering
- Auto-cleanup on component unmount
- Callback ref always points to latest function

## Spotify OAuth Flow (PKCE)

MoodPlay implements secure PKCE OAuth 2.0 flow:

1. User clicks "Connect with Spotify" button
2. Generate random code verifier and SHA-256 code challenge
3. Store verifier in sessionStorage (survives page navigation)
4. Redirect to Spotify's authorization endpoint with code challenge
5. User logs in and grants permission (Spotify's UI)
6. Spotify redirects back to app with authorization code
7. Before React mounts, IIFE captures code and stores in sessionStorage
8. App exchanges code + verifier for access token via POST
9. Token and expiry stored in sessionStorage
10. Token automatically validated and restored on subsequent loads

### Security Features

- PKCE ensures authorization code cannot be intercepted and reused
- Client credentials never exposed in browser
- OAuth code captured before React mount and URL cleaned to prevent replay
- Token expiry tracked and validated before use
- Code verifier stored in sessionStorage (not visible to user)

### Error Handling

- Invalid scope names (e.g., "playlist-read-public" doesn't exist)
- Client ID / Redirect URI mismatches
- Development mode user allowlist failures (403 errors)
- Session expiry (missing code_verifier)
- Network failures during token exchange

## Moods & Theming

Eight distinct moods with unique color palettes:

1. **Euphoric** (✦) - Sky-high & electric
   - Query: "euphoric feel good dance"
   - Primary colors: Purple (#c77dff), Glow: #7b2fff

2. **Melancholic** (◌) - Reflective & deep
   - Query: "sad melancholic emotional rainy day"
   - Primary colors: Cyan (#4fc3f7), Glow: #0077b6

3. **Energized** (◈) - Pumped & powerful
   - Query: "workout pump up energy motivation"
   - Primary colors: Orange (#ff6b35), Glow: #e63946

4. **Serene** (◎) - Calm & balanced
   - Query: "calm peaceful meditation ambient"
   - Primary colors: Teal (#56cfa2), Glow: #06d6a0

5. **Romantic** (❋) - Tender & warm
   - Query: "romantic love songs couples"
   - Primary colors: Pink (#ff85a1), Glow: #e91e8c

6. **Focused** (⊕) - Sharp & intentional
   - Query: "focus study deep work concentration"
   - Primary colors: Blue (#a0c4ff), Glow: #3a7bd5

7. **Nostalgic** (◉) - Warm & wistful
   - Query: "90s throwback nostalgic classics"
   - Primary colors: Gold (#ffb347), Glow: #c9621e

8. **Rebellious** (⊗) - Raw & untamed
   - Query: "rock punk alternative rebellious"
   - Primary colors: Lime (#39ff14), Glow: #ff0044

Each mood palette includes: bg (gradient array), accent, secondary, glow, text, muted, orb1, orb2, warp, sphere

## Performance Optimizations

- **Component Memoization**: MoodCard and SpotifySongRow wrapped with React.memo
- **useMemo**: Expensive theme lookups memoized based on moodId dependency
- **useCallback**: Event handlers wrapped to maintain referential equality
- **requestAnimationFrame**: Canvas animations use rAF for smooth 60fps rendering
- **Canvas API**: Graphics offloaded to GPU instead of DOM elements
- **sessionStorage**: OAuth tokens persist without network calls on reload
- **Lazy Loading**: Playlist data only fetched when user navigates to playlist view

## PropTypes Implementation

Custom PropTypes shim providing prop validation without external dependencies:

```javascript
const PropTypes = {
  string: _mk("string"),
  number: _mk("number"),
  bool: _mk("bool"),
  func: _mk("func"),
  object: _mk("object"),
  array: _mk("array"),
  node: _mk("node"),
  any: _mk("any"),
  shape: (s) => { ... },
  arrayOf: (o) => { ... },
  oneOf: (v) => { ... },
  oneOfType: (a) => { ... },
};
```

Each PropType supports .isRequired property for required field validation.

All components declare expected props:

- App: none
- SpotifyProvider: { children: PropTypes.node.isRequired }
- ThemeProvider: { moodId: string, children: node.isRequired }
- HashRouter: { children: node.isRequired }
- Route: { path: string.isRequired, component: func.isRequired, exact: bool }
- AppShell: { onMoodSelect: func.isRequired, onMoodPreview: func.isRequired, activeMoodId: string }
- NavBar: { activeMoodId: string }
- MoodCard: { mood: shape.isRequired, isSelected: bool, onSelect: func.isRequired, onHover: func.isRequired, onLeave: func.isRequired, animIndex: number }
- SpotifySongRow: { track: shape.isRequired, index: number.isRequired, playingId: string, onToggle: func.isRequired }
- HomeView: { onMoodSelect: func.isRequired, onMoodPreview: func, preselectedMood: string }
- PlaylistView: none (uses context)
- AboutView: none (uses context)
- SpaceBackground: { palette: shape.isRequired }
- WireframeSphere: { size: number, color: string.isRequired }

## Animations

CSS keyframe animations defined in AppShell:

- **fadeUp**: Content fade-in with subtle upward movement
- **cardIn**: Component entrance with scale and position
- **shimmer**: Gradient animation on heading text
- **floatY**: Subtle vertical bobbing motion
- **spin**: Loading spinner rotation

Canvas-based animations:

- SpaceBackground: Warp particles, orbital glows, twinkling stars
- WireframeSphere: 3D rotation with perspective projection

## Code Organization

Single file (~1000 lines) organized into 24 logical sections:

1. Imports
2. PropTypes Shim
3. Spotify Configuration
4. Mood Data
5. Contexts
6. Reducers
7. Spotify PKCE Helpers
8. Custom Hooks
9. HashRouter
10. Route Component
11. ThemeProvider
12. SpotifyProvider
13. SpaceBackground
14. WireframeSphere
15. NavBar
16. MoodCard
17. SpotifySongRow
18. SpotifyConnectBanner
19. HomeView
20. PlaylistView
21. AboutView
22. Shared Style Factory
23. AppShell
24. Root App

## Key Fixes & Improvements

### Fix #1: Invalid Scope Name
- **Problem**: "playlist-read-public" is not a valid Spotify scope
- **Solution**: Use "playlist-read-private" and "playlist-read-collaborative"
- **Result**: Authorization succeeds without invalid_scope error

### Fix #2: Auth Code Capture Before React Mount
- **Problem**: OAuth code in URL can be replayed if not immediately captured
- **Solution**: IIFE at module load captures code before React renders and cleans URL
- **Result**: Prevents code replay attacks via history.replaceState()

### Fix #3: Market Parameter Exclusion
- **Problem**: market=US parameter silently excludes results for non-US users
- **Solution**: Removed market parameter from Spotify playlist search
- **Result**: Global playlist results for all users

### Fix #4: 403 Development Mode Handling
- **Problem**: Users in Development Mode get 403 errors without explanation
- **Solution**: Added explicit 403 handler with actionable guidance
- **Result**: Clear error messaging about allowlist and Premium requirements

### Fix #5: Deprecated Endpoint Update
- **Problem**: /playlists/{id}/tracks endpoint deprecated as of Feb 2026
- **Solution**: Migrated to /playlists/{id}/items with proper track extraction
- **Result**: Future-proofed API calls for current Spotify API

## Dependencies

### Runtime Dependencies
- React 18+ (core library)

### External APIs
- Spotify Web API (OAuth and playlist/track data)
- Google Fonts (DM Sans and Playfair Display via CDN)

### Zero External Packages
- No routing library (custom HashRouter)
- No PropTypes library (custom implementation)
- No HTTP client library (native fetch)
- No state management library (Context API + useReducer)
- No animation library (CSS + Canvas)

## Deployment

Currently deployed to: https://mood-based-playlist-pearl.vercel.app/

The redirect URI must match exactly in Spotify Developer Dashboard.

### Local Development

1. Update SPOTIFY_CLIENT_ID with your app's Client ID
2. Update SPOTIFY_REDIRECT() to http://localhost:3000/
3. Register local URL in Spotify Developer Dashboard
4. Run dev server (npm start or npx vite)

### Development Mode Requirements

- Spotify app must be in Development Mode initially
- All users must be added to User Management allowlist in Spotify Developer Dashboard
- App owner must have Spotify Premium subscription (required as of Feb 2026)
- Development Mode apps cannot be shared widely; promote to Production when ready

## How to Use

### For Users

1. Visit the app
2. Click "Connect with Spotify" and authorize
3. Select a mood from the 8 options
4. Browse the playlist and listen to 30-second previews
5. Click "Open on Spotify" to play full songs

### For Developers

1. Clone repository
2. Install React 18+
3. Update Spotify credentials
4. Run local dev server
5. Modify components and hooks as needed

## Browser Support

Works on all modern browsers supporting:

- ES6+ JavaScript
- Canvas API
- Web Audio API
- Crypto API
- Fetch API
- CSS Grid and Flexbox
- Backdrop filters

## License & Attribution

This is a demonstration project showcasing:

- Modern React patterns
- OAuth 2.0 PKCE flow
- Canvas-based graphics
- Custom hooks and context
- Dynamic theming
- Spotify Web API integration
