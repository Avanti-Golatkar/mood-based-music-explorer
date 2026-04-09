<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MoodPlay · Spotify Playlist Generator | README</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header p {
            font-size: 1.2em;
            opacity: 0.95;
            font-weight: 300;
        }

        .content {
            padding: 50px 40px;
        }

        h2 {
            color: #667eea;
            font-size: 2em;
            margin-top: 40px;
            margin-bottom: 20px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }

        h2:first-of-type {
            margin-top: 0;
        }

        h3 {
            color: #764ba2;
            font-size: 1.4em;
            margin-top: 25px;
            margin-bottom: 15px;
        }

        p {
            margin-bottom: 15px;
            color: #555;
            line-height: 1.8;
        }

        ul, ol {
            margin: 20px 0 20px 30px;
            color: #555;
        }

        li {
            margin-bottom: 10px;
            line-height: 1.7;
        }

        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #d63384;
            font-size: 0.95em;
        }

        .code-block {
            background: #f4f4f4;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            line-height: 1.5;
            color: #333;
        }

        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .tech-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .tech-card h4 {
            font-size: 1.2em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .tech-card p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 0.95em;
            margin: 0;
        }

        .component-list {
            display: grid;
            gap: 20px;
            margin: 20px 0;
        }

        .component-item {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
        }

        .component-item h4 {
            color: #667eea;
            font-size: 1.1em;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .component-item p {
            margin: 8px 0;
            color: #666;
            font-size: 0.95em;
        }

        .tag {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            margin-right: 5px;
            margin-bottom: 5px;
            font-weight: 600;
        }

        .highlight {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .highlight strong {
            color: #856404;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        th {
            background: #667eea;
            color: white;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
        }

        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e0e0e0;
            color: #555;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:hover {
            background: #f5f5f5;
        }

        .feature-list {
            list-style: none;
        }

        .feature-list li {
            padding-left: 30px;
            position: relative;
        }

        .feature-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
            font-size: 1.2em;
        }

        .footer {
            background: #f4f4f4;
            padding: 30px 40px;
            text-align: center;
            color: #666;
            font-size: 0.95em;
            border-top: 1px solid #e0e0e0;
        }

        .divider {
            margin: 30px 0;
            border: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
        }

        @media (max-width: 768px) {
            .header {
                padding: 40px 20px;
            }

            .header h1 {
                font-size: 2em;
            }

            .content {
                padding: 30px 20px;
            }

            h2 {
                font-size: 1.6em;
            }

            .tech-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✦ MoodPlay</h1>
            <p>Spotify Playlist Generator · Sound × Emotion</p>
        </div>

        <div class="content">
            <!-- PROJECT OVERVIEW -->
            <h2>Project Overview</h2>
            
            <p>
                <strong>MoodPlay</strong> is an interactive web application that generates Spotify playlists based on your current emotional state. Instead of manually searching for songs, users select one of eight distinct moods—euphoric, melancholic, energized, serene, romantic, focused, nostalgic, or rebellious—and MoodPlay intelligently searches Spotify's API to surface curated playlists that match the selected mood.
            </p>

            <p>
                The application features a beautiful, mood-responsive interface where the entire visual experience shifts based on the selected emotion: colors, gradients, animations, background effects, and UI accents all dynamically adapt to reflect the emotional tone. Users can preview 30-second samples of tracks, access album artwork, and open full songs on Spotify with a single click.
            </p>

            <h3>Key Features</h3>
            <ul class="feature-list">
                <li>Eight distinct mood profiles with unique color palettes and Spotify search queries</li>
                <li>Real-time Spotify integration using PKCE OAuth authentication (no password required)</li>
                <li>Dynamic theme switching based on selected mood</li>
                <li>30-second audio preview playback with rAF-based progress tracking</li>
                <li>Animated space background with warp effects, glowing orbs, and twinkling stars</li>
                <li>Responsive design with smooth animations and transitions</li>
                <li>Client-side hash-based routing (no external routing library)</li>
                <li>Full prop validation using a custom PropTypes implementation</li>
            </ul>

            <hr class="divider">

            <!-- ARCHITECTURE -->
            <h2>Architecture & Design Patterns</h2>

            <h3>Component Hierarchy</h3>
            <p>
                The application follows a hierarchical component structure with clear separation of concerns:
            </p>

            <div class="code-block">
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
            </div>

            <h3>State Management</h3>
            <p>
                The application uses multiple state management patterns depending on the use case:
            </p>

            <ul>
                <li><strong>Context API</strong> for global state: theme palette, router, and Spotify authentication</li>
                <li><strong>useState</strong> for component-level UI state (hover, selection, loading)</li>
                <li><strong>useReducer</strong> for complex Spotify playlist fetch state machine</li>
                <li><strong>sessionStorage</strong> for persisting OAuth tokens and PKCE verifiers across page navigation</li>
            </ul>

            <h3>Routing Strategy</h3>
            <p>
                Rather than using a third-party router library, MoodPlay implements a custom <code>HashRouter</code> component that:
            </p>

            <ul>
                <li>Parses the URL hash to determine the current route and extract parameters</li>
                <li>Listens to <code>hashchange</code> events to update state when the route changes</li>
                <li>Supports parameterized routes (e.g., <code>/#/playlist/:moodId</code>)</li>
                <li>Provides programmatic navigation via the <code>navigate()</code> method</li>
                <li>Automatically cleans up OAuth redirect parameters to prevent replay attacks</li>
            </ul>

            <hr class="divider">

            <!-- TECH STACK -->
            <h2>Technology Stack</h2>

            <div class="tech-grid">
                <div class="tech-card">
                    <h4>React</h4>
                    <p>Functional and class components, hooks (useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext), and the Context API for state management.</p>
                </div>

                <div class="tech-card">
                    <h4>Spotify Web API</h4>
                    <p>Playlist and track search, OAuth 2.0 PKCE authentication, and retrieval of album artwork and preview URLs.</p>
                </div>

                <div class="tech-card">
                    <h4>Canvas API</h4>
                    <p>High-performance animated backgrounds with warp-speed effects, glowing orbs, and rotating 3D wireframe spheres.</p>
                </div>

                <div class="tech-card">
                    <h4>Web Audio API</h4>
                    <p>HTML5 Audio element for playing 30-second Spotify track previews with requestAnimationFrame progress tracking.</p>
                </div>

                <div class="tech-card">
                    <h4>Crypto API</h4>
                    <p>Cryptographic SHA-256 hashing for PKCE code challenge generation during OAuth authentication.</p>
                </div>

                <div class="tech-card">
                    <h4>CSS-in-JS</h4>
                    <p>Inline styles with dynamic theme colors, CSS variables, animations, filters, and gradients.</p>
                </div>
            </div>

            <hr class="divider">

            <!-- REACT COMPONENTS -->
            <h2>React Components</h2>

            <h3>Root & Providers</h3>

            <div class="component-list">
                <div class="component-item">
                    <h4>App (Class Component)</h4>
                    <p>The root component that manages mood state and orchestrates the SpotifyProvider, ThemeProvider, and HashRouter.</p>
                    <p><strong>State:</strong> activeMoodId, previewMoodId</p>
                    <p><strong>Lifecycle:</strong> Sets document title, handles mood selection events</p>
                </div>

                <div class="component-item">
                    <h4>SpotifyProvider</h4>
                    <p>Context provider that wraps the useSpotifyAuth hook and exposes token, authentication status, login, and logout methods.</p>
                    <p><span class="tag">Provider</span><span class="tag">Custom Hook</span></p>
                </div>

                <div class="component-item">
                    <h4>ThemeProvider</h4>
                    <p>Context provider that manages the current mood's palette and exposes theme colors to all child components.</p>
                    <p><span class="tag">Provider</span><span class="tag">Dynamic Theme</span></p>
                </div>

                <div class="component-item">
                    <h4>HashRouter (Class Component)</h4>
                    <p>Custom implementation of client-side routing using URL hashes. Parses routes, manages navigation, and provides router context.</p>
                    <p><strong>Routes:</strong> /, /playlist/:moodId, /about</p>
                    <p><span class="tag">Routing</span><span class="tag">Context Provider</span></p>
                </div>
            </div>

            <h3>Layout & Navigation</h3>

            <div class="component-list">
                <div class="component-item">
                    <h4>AppShell</h4>
                    <p>Main layout component that renders the space background, wireframe spheres, navigation bar, and route content. Manages backdrop animations and overall visual composition.</p>
                    <p><span class="tag">Layout</span><span class="tag">Canvas Animation</span></p>
                </div>

                <div class="component-item">
                    <h4>NavBar</h4>
                    <p>Fixed navigation bar displaying the MoodPlay logo, navigation links, and the currently selected mood badge with dynamic colors.</p>
                    <p><span class="tag">Navigation</span><span class="tag">Theme-aware</span></p>
                </div>

                <div class="component-item">
                    <h4>Route</h4>
                    <p>Route matching component that renders a component if the current route matches the specified path pattern.</p>
                    <p><span class="tag">Router</span></p>
                </div>
            </div>

            <h3>Views</h3>

            <div class="component-list">
                <div class="component-item">
                    <h4>HomeView (Class Component)</h4>
                    <p>Landing page displaying all eight mood cards in a responsive grid. Features time-based greetings, hover previews, and selection logic.</p>
                    <p><strong>State:</strong> selectedMood, hoveredMood, greeting, mounted</p>
                    <p><strong>Features:</strong> Dynamic greeting, animation staggering, theme transitions</p>
                    <p><span class="tag">View</span><span class="tag">Selection</span></p>
                </div>

                <div class="component-item">
                    <h4>PlaylistView (Functional Component)</h4>
                    <p>Displays the Spotify playlist and its tracks. Handles authentication flow, playlist search, track preview playback, and error states.</p>
                    <p><strong>Features:</strong> Album artwork, track duration, artist info, Spotify links, preview buttons</p>
                    <p><span class="tag">View</span><span class="tag">Spotify Integration</span></p>
                </div>

                <div class="component-item">
                    <h4>AboutView (Functional Component)</h4>
                    <p>Documentation page explaining how to use MoodPlay and detailing the complete tech stack and React patterns used.</p>
                    <p><span class="tag">View</span><span class="tag">Documentation</span></p>
                </div>
            </div>

            <h3>Spotify & Authentication</h3>

            <div class="component-list">
                <div class="component-item">
                    <h4>SpotifyConnectBanner</h4>
                    <p>UI component that prompts users to connect their Spotify account. Displays the connection button, auth error messages, and security information.</p>
                    <p><span class="tag">Auth UI</span><span class="tag">Error Handling</span></p>
                </div>
            </div>

            <h3>Playlist & Tracks</h3>

            <div class="component-list">
                <div class="component-item">
                    <h4>MoodCard (Functional Component, Memoized)</h4>
                    <p>Individual mood selection card with emoji, label, description, and visual feedback. Fully theme-aware with hover and selection states.</p>
                    <p><strong>Props:</strong> mood, isSelected, onSelect, onHover, onLeave, animIndex</p>
                    <p><span class="tag">Memoized</span><span class="tag">Animation</span></p>
                </div>

                <div class="component-item">
                    <h4>SpotifySongRow (Functional Component, Memoized)</h4>
                    <p>Individual track row displaying album thumbnail, song title, artist(s), duration, and interactive play button. Links to Spotify for full playback.</p>
                    <p><strong>Props:</strong> track, index, playingId, onToggle</p>
                    <p><strong>Features:</strong> Preview playback, Spotify links, artist info, duration formatting</p>
                    <p><span class="tag">Memoized</span><span class="tag">Theme-aware</span></p>
                </div>
            </div>

            <h3>Canvas & Animation</h3>

            <div class="component-list">
                <div class="component-item">
                    <h4>SpaceBackground (Functional Component)</h4>
                    <p>Full-screen canvas background with animated space effects: radial gradient background, warp-speed streaks, glowing orbs, and twinkling stars.</p>
                    <p><strong>Animations:</strong> Warp particles, orbital glows, twinkling stars</p>
                    <p><span class="tag">Canvas</span><span class="tag">High-Performance</span><span class="tag">rAF Loop</span></p>
                </div>

                <div class="component-item">
                    <h4>WireframeSphere (Functional Component)</h4>
                    <p>3D wireframe sphere rendered on canvas with rotating latitude/longitude lines and perspective projection. Four instances float at corners with staggered delays.</p>
                    <p><strong>Features:</strong> 3D rotation, perspective rendering, radial glow halo</p>
                    <p><span class="tag">Canvas</span><span class="tag">3D Graphics</span><span class="tag">rAF Loop</span></p>
                </div>
            </div>

            <hr class="divider">

            <!-- CUSTOM HOOKS -->
            <h2>Custom Hooks</h2>

            <table>
                <thead>
                    <tr>
                        <th>Hook Name</th>
                        <th>Purpose</th>
                        <th>Returns</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>useMoodTheme(moodId)</code></td>
                        <td>Derives color palette and mood object from mood ID using useMemo</td>
                        <td>{ palette, mood }</td>
                    </tr>
                    <tr>
                        <td><code>useSpotifyAuth()</code></td>
                        <td>Complete PKCE OAuth flow with token persistence in sessionStorage</td>
                        <td>{ token, isAuthenticated, login, logout, authLoading, authError }</td>
                    </tr>
                    <tr>
                        <td><code>useSpotifyMoodPlaylist(token)</code></td>
                        <td>Searches Spotify playlists by mood and fetches tracks using useReducer state machine</td>
                        <td>{ playlist, tracks, loading, error, search, reset }</td>
                    </tr>
                    <tr>
                        <td><code>useAudioPreview()</code></td>
                        <td>Manages HTML Audio element for track preview playback with progress tracking</td>
                        <td>{ playingId, progress, toggle }</td>
                    </tr>
                    <tr>
                        <td><code>useAnimationFrame(callback)</code></td>
                        <td>Runs a callback on every animation frame using requestAnimationFrame</td>
                        <td>void (runs loop)</td>
                    </tr>
                </tbody>
            </table>

            <hr class="divider">

            <!-- SPOTIFY OAUTH FLOW -->
            <h2>Spotify OAuth Flow (PKCE)</h2>

            <p>
                MoodPlay implements a secure <strong>PKCE (Proof Key for Code Exchange)</strong> OAuth 2.0 flow, which is specifically recommended for browser-based applications because it does not require a client secret.
            </p>

            <h3>Flow Steps</h3>
            <ol>
                <li>User clicks "Connect with Spotify" button</li>
                <li>Generate random code verifier and SHA-256 code challenge</li>
                <li>Store verifier in sessionStorage (survives page navigation)</li>
                <li>Redirect to Spotify's authorization endpoint with code challenge</li>
                <li>User logs in and grants permission (handled by Spotify's UI)</li>
                <li>Spotify redirects back to the app with authorization code</li>
                <li>Before React mounts, IIFE captures code and stores it in sessionStorage</li>
                <li>App exchanges code + verifier for access token via POST to Spotify's token endpoint</li>
                <li>Token and expiry stored in sessionStorage</li>
                <li>Token automatically validated and restored on subsequent loads</li>
            </ol>

            <div class="highlight">
                <strong>Security Note:</strong> The PKCE flow ensures the authorization code cannot be intercepted and reused without the original code verifier. Client credentials are never exposed in the browser.
            </div>

            <h3>Error Handling</h3>
            <p>
                The implementation includes comprehensive error handling for:
            </p>
            <ul>
                <li>Invalid scope names (e.g., "playlist-read-public" doesn't exist)</li>
                <li>Client ID / Redirect URI mismatches</li>
                <li>Development mode user allowlist failures (403 errors)</li>
                <li>Session expiry (missing code_verifier)</li>
                <li>Network failures during token exchange</li>
            </ul>

            <hr class="divider">

            <!-- KEY FIXES & IMPROVEMENTS -->
            <h2>Key Fixes & Improvements</h2>

            <div class="component-list">
                <div class="component-item">
                    <h4>Fix #1: Invalid Scope Name</h4>
                    <p><strong>Problem:</strong> "playlist-read-public" is not a valid Spotify scope. Spotify rejects the entire authorization request with <code>error=invalid_scope</code>.</p>
                    <p><strong>Solution:</strong> Use "playlist-read-private" and "playlist-read-collaborative" instead. Public playlists (used for search) require no scope at all.</p>
                </div>

                <div class="component-item">
                    <h4>Fix #2: Auth Code Capture Before React Mount</h4>
                    <p><strong>Problem:</strong> OAuth code in URL can be replayed if not immediately captured and cleaned.</p>
                    <p><strong>Solution:</strong> IIFE at module load time captures code/error before React renders, cleans URL via <code>history.replaceState()</code>, and stores securely in sessionStorage.</p>
                </div>

                <div class="component-item">
                    <h4>Fix #3: Market Parameter Exclusion</h4>
                    <p><strong>Problem:</strong> <code>market=US</code> parameter can silently exclude playlists for non-US users.</p>
                    <p><strong>Solution:</strong> Removed market parameter from Spotify playlist search, allowing results globally.</p>
                </div>

                <div class="component-item">
                    <h4>Fix #4: 403 Development Mode Handling</h4>
                    <p><strong>Problem:</strong> Users in Development Mode get 403 errors without explanation.</p>
                    <p><strong>Solution:</strong> Added explicit 403 handler with guidance: users must be added to the app's User Management allowlist in Spotify Developer Dashboard, and the app owner must have Premium.</p>
                </div>

                <div class="component-item">
                    <h4>Fix #5: Deprecated Endpoint Update</h4>
                    <p><strong>Problem:</strong> <code>/playlists/{id}/tracks</code> endpoint is deprecated as of Feb 2026.</p>
                    <p><strong>Solution:</strong> Migrated to <code>/playlists/{id}/items</code> with proper track extraction from the response structure.</p>
                </div>
            </div>

            <hr class="divider">

            <!-- MOODS & DATA -->
            <h2>Moods & Theming</h2>

            <p>
                MoodPlay includes 8 distinct moods, each with a unique color palette, emoji, description, and Spotify search query:
            </p>

            <table>
                <thead>
                    <tr>
                        <th>Mood</th>
                        <th>Emoji</th>
                        <th>Description</th>
                        <th>Primary Query</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Euphoric</strong></td>
                        <td>✦</td>
                        <td>Sky-high & electric</td>
                        <td>euphoric feel good dance</td>
                    </tr>
                    <tr>
                        <td><strong>Melancholic</strong></td>
                        <td>◌</td>
                        <td>Reflective & deep</td>
                        <td>sad melancholic emotional rainy day</td>
                    </tr>
                    <tr>
                        <td><strong>Energized</strong></td>
                        <td>◈</td>
                        <td>Pumped & powerful</td>
                        <td>workout pump up energy motivation</td>
                    </tr>
                    <tr>
                        <td><strong>Serene</strong></td>
                        <td>◎</td>
                        <td>Calm & balanced</td>
                        <td>calm peaceful meditation ambient</td>
                    </tr>
                    <tr>
                        <td><strong>Romantic</strong></td>
                        <td>❋</td>
                        <td>Tender & warm</td>
                        <td>romantic love songs couples</td>
                    </tr>
                    <tr>
                        <td><strong>Focused</strong></td>
                        <td>⊕</td>
                        <td>Sharp & intentional</td>
                        <td>focus study deep work concentration</td>
                    </tr>
                    <tr>
                        <td><strong>Nostalgic</strong></td>
                        <td>◉</td>
                        <td>Warm & wistful</td>
                        <td>90s throwback nostalgic classics</td>
                    </tr>
                    <tr>
                        <td><strong>Rebellious</strong></td>
                        <td>⊗</td>
                        <td>Raw & untamed</td>
                        <td>rock punk alternative rebellious</td>
                    </tr>
                </tbody>
            </table>

            <p>
                Each mood includes a color palette with the following properties: <code>bg</code> (gradient array), <code>accent</code>, <code>secondary</code>, <code>glow</code>, <code>text</code>, <code>muted</code>, <code>orb1</code>, <code>orb2</code>, <code>warp</code>, and <code>sphere</code>.
            </p>

            <hr class="divider">

            <!-- PERFORMANCE OPTIMIZATIONS -->
            <h2>Performance Optimizations</h2>

            <ul>
                <li><strong>Component Memoization:</strong> MoodCard and SpotifySongRow are wrapped with React.memo to prevent unnecessary re-renders</li>
                <li><strong>useMemo:</strong> Expensive theme lookups are memoized based on moodId dependency</li>
                <li><strong>useCallback:</strong> Event handlers are wrapped to maintain referential equality across renders</li>
                <li><strong>requestAnimationFrame:</strong> Canvas animations use rAF instead of setInterval for smooth 60fps rendering</li>
                <li><strong>Canvas API:</strong> Graphics rendering is offloaded to the GPU via canvas instead of DOM elements</li>
                <li><strong>sessionStorage:</strong> Oauth tokens persist without network calls on page reload</li>
                <li><strong>Lazy Loading:</strong> Playlist data is only fetched when the user navigates to the playlist view</li>
            </ul>

            <hr class="divider">

            <!-- PROP TYPES -->
            <h2>PropTypes Implementation</h2>

            <p>
                MoodPlay includes a custom PropTypes shim that provides prop validation without external dependencies. Every component declares its expected props:
            </p>

            <div class="code-block">
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
            </div>

            <p>
                Each PropType supports an <code>.isRequired</code> property for required field validation. This ensures type safety and provides helpful error messages during development.
            </p>

            <hr class="divider">

            <!-- ANIMATIONS & TRANSITIONS -->
            <h2>Animations & CSS Effects</h2>

            <p>
                MoodPlay uses a combination of CSS keyframe animations, CSS transitions, and canvas-based animations:
            </p>

            <table>
                <thead>
                    <tr>
                        <th>Animation</th>
                        <th>Type</th>
                        <th>Use Case</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>fadeUp</code></td>
                        <td>CSS @keyframes</td>
                        <td>Content fade-in with subtle upward movement</td>
                    </tr>
                    <tr>
                        <td><code>cardIn</code></td>
                        <td>CSS @keyframes</td>
                        <td>Component entrance with scale and position</td>
                    </tr>
                    <tr>
                        <td><code>shimmer</code></td>
                        <td>CSS @keyframes</td>
                        <td>Gradient animation on heading text</td>
                    </tr>
                    <tr>
                        <td><code>floatY</code></td>
                        <td>CSS @keyframes</td>
                        <td>Subtle vertical bobbing motion</td>
                    </tr>
                    <tr>
                        <td><code>spin</code></td>
                        <td>CSS @keyframes</td>
                        <td>Loading spinner rotation</td>
                    </tr>
                    <tr>
                        <td>Canvas rAF</td>
                        <td>requestAnimationFrame</td>
                        <td>Smooth space background and sphere animations</td>
                    </tr>
                </tbody>
            </table>

            <hr class="divider">

            <!-- FILE STRUCTURE -->
            <h2>Code Organization</h2>

            <p>
                The entire application is contained in a single <code>App.jsx</code> file (~1000 lines) organized into logical sections:
            </p>

            <ol>
                <li><strong>Imports:</strong> React hooks and utilities</li>
                <li><strong>PropTypes Shim:</strong> Custom prop validation implementation</li>
                <li><strong>Spotify Configuration:</strong> Client ID, scopes, storage keys, redirect URI</li>
                <li><strong>Mood Data:</strong> 8 moods with palettes and queries</li>
                <li><strong>Contexts:</strong> ThemeContext, RouterContext, SpotifyContext</li>
                <li><strong>Reducers:</strong> spotifyReducer for fetch state machine</li>
                <li><strong>Spotify Helpers:</strong> PKCE code verifier/challenge generation, auth code capture IIFE</li>
                <li><strong>Custom Hooks:</strong> 5 custom hooks for auth, theme, playlist, audio, and animation</li>
                <li><strong>HashRouter:</strong> Custom client-side routing implementation</li>
                <li><strong>Route Component:</strong> Route matching and conditional rendering</li>
                <li><strong>Providers:</strong> ThemeProvider, SpotifyProvider</li>
                <li><strong>Canvas Components:</strong> SpaceBackground, WireframeSphere</li>
                <li><strong>NavBar:</strong> Fixed navigation</li>
                <li><strong>MoodCard:</strong> Mood selection UI</li>
                <li><strong>SpotifySongRow:</strong> Track list item</li>
                <li><strong>SpotifyConnectBanner:</strong> Auth UI</li>
                <li><strong>Views:</strong> HomeView, PlaylistView, AboutView</li>
                <li><strong>AppShell:</strong> Main layout</li>
                <li><strong>App Root:</strong> Top-level class component</li>
            </ol>

            <hr class="divider">

            <!-- DEPENDENCIES & DEPLOYMENT -->
            <h2>Dependencies & Deployment</h2>

            <h3>Runtime Dependencies</h3>
            <ul>
                <li><strong>React 18+:</strong> Core library (no other npm packages required)</li>
            </ul>

            <h3>External APIs</h3>
            <ul>
                <li><strong>Spotify Web API:</strong> OAuth authorization and playlist/track data</li>
                <li><strong>Google Fonts:</strong> DM Sans and Playfair Display via CDN</li>
            </ul>

            <h3>Deployment</h3>
            <p>
                The app is currently deployed to <code>https://mood-based-playlist-pearl.vercel.app/</code> and uses this URL as the OAuth redirect URI. The redirect URI must match exactly in the Spotify Developer Dashboard.
            </p>

            <div class="highlight">
                <strong>Note:</strong> To run locally, update <code>SPOTIFY_REDIRECT()</code> to <code>http://localhost:3000/</code> and register the local URL in the Spotify Developer Dashboard.
            </div>

            <hr class="divider">

            <!-- GETTING STARTED -->
            <h2>Getting Started</h2>

            <h3>Prerequisites</h3>
            <ol>
                <li>A Spotify Developer account (free at <code>developer.spotify.com</code>)</li>
                <li>Create a Spotify app to get a Client ID</li>
                <li>Register your redirect URI in the app settings</li>
            </ol>

            <h3>Setup</h3>
            <ol>
                <li>Clone or download the project</li>
                <li>Update <code>SPOTIFY_CLIENT_ID</code> in the code with your app's Client ID</li>
                <li>Update <code>SPOTIFY_REDIRECT()</code> to match your registered redirect URI</li>
                <li>Run a local dev server (e.g., <code>npx vite</code> or <code>npm start</code>)</li>
                <li>Navigate to the app and click "Connect with Spotify"</li>
            </ol>

            <h3>Development Mode Gotchas</h3>
            <ul>
                <li>The Spotify app must be in Development Mode initially</li>
                <li>All users must be added to the User Management allowlist in Spotify Developer Dashboard</li>
                <li>The app owner must have a Spotify Premium subscription (required as of Feb 2026)</li>
                <li>Development Mode apps cannot be shared widely—promote to Production when ready</li>
            </ul>

        </div>

        <div class="footer">
            <p><strong>MoodPlay</strong> · Spotify Playlist Generator | Built with React, Canvas, and the Spotify Web API</p>
            <p style="margin-top: 10px; font-size: 0.9em;">This is a demonstration project showcasing modern React patterns, OAuth integration, and canvas-based graphics.</p>
        </div>
    </div>
</body>
</html>
