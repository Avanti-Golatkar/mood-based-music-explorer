//1) IMPORTS
import {
  useState, useEffect, useRef, useCallback,
  useContext, createContext, Component, memo,
  useMemo, useReducer, Fragment,
} from "react";

//2) PROP-TYPES SHIM
const _mk = (n) => { const t={_t:n}; t.isRequired={...t,_r:true}; return t; };
const PropTypes = {
  string:_mk("string"), number:_mk("number"), bool:_mk("bool"),
  func:_mk("func"), object:_mk("object"), array:_mk("array"),
  node:_mk("node"), any:_mk("any"),
  shape:    (s)=>{ const t={_t:"shape",_s:s};    t.isRequired={...t,_r:true}; return t; },
  arrayOf:  (o)=>{ const t={_t:"arrayOf",_o:o};  t.isRequired={...t,_r:true}; return t; },
  oneOf:    (v)=>{ const t={_t:"oneOf",_v:v};    t.isRequired={...t,_r:true}; return t; },
  oneOfType:(a)=>{ const t={_t:"oneOfType",_a:a};t.isRequired={...t,_r:true}; return t; },
};

//3) SPOTIFY CONFIG
const SPOTIFY_CLIENT_ID    = "f210f5397cda4bfab0325c8aea87c17c";

// FIX #1: "playlist-read-public" is NOT a valid Spotify scope — it does not exist.
// Public playlists are accessible with just a valid token; no scope is needed for them.
// Requesting a non-existent scope causes Spotify to return "invalid_scope" immediately
// and reject the entire OAuth flow before the user even sees the consent screen.
// Only request scopes that actually exist. "playlist-read-collaborative" is valid.
// "playlist-read-private" is added so the user's own private playlists are also readable.
const SPOTIFY_SCOPES       = "playlist-read-private playlist-read-collaborative";

const SPOTIFY_TOKEN_KEY    = "sp_token";
const SPOTIFY_EXPIRY_KEY   = "sp_expiry";
const SPOTIFY_VERIFIER_KEY = "sp_verifier";
const SPOTIFY_REDIRECT     = () => "https://mood-based-playlist-pearl.vercel.app/";

//4) MOOD DATA
const MOODS = [
  { id:"euphoric",    label:"Euphoric",    emoji:"✦", desc:"Sky-high & electric",   spotifyQuery:"euphoric feel good dance",
    palette:{ bg:["#0d0221","#1a0533","#2d0a5e"], accent:"#c77dff", secondary:"#9d4edd", glow:"#7b2fff", text:"#f0e6ff", muted:"#9d8bbd", orb1:"#6b21a8", orb2:"#4c1d95", warp:"#c77dff", sphere:"#9d4edd" }},
  { id:"melancholic", label:"Melancholic", emoji:"◌", desc:"Reflective & deep",     spotifyQuery:"sad melancholic emotional rainy day",
    palette:{ bg:["#05111f","#071e36","#0a2847"], accent:"#4fc3f7", secondary:"#0288d1", glow:"#0077b6", text:"#e0f4ff", muted:"#7ba7c4", orb1:"#0c4a6e", orb2:"#075985", warp:"#7dd3fc", sphere:"#0369a1" }},
  { id:"energized",  label:"Energized",   emoji:"◈", desc:"Pumped & powerful",     spotifyQuery:"workout pump up energy motivation",
    palette:{ bg:["#1a0500","#2d0a00","#3d1200"], accent:"#ff6b35", secondary:"#ff9f1c", glow:"#e63946", text:"#fff0e6", muted:"#c49b7b", orb1:"#7c2d12", orb2:"#92400e", warp:"#fb923c", sphere:"#ea580c" }},
  { id:"serene",     label:"Serene",      emoji:"◎", desc:"Calm & balanced",       spotifyQuery:"calm peaceful meditation ambient",
    palette:{ bg:["#001a15","#002d20","#003d2a"], accent:"#56cfa2", secondary:"#2ec4b6", glow:"#06d6a0", text:"#e6fff6", muted:"#7abfab", orb1:"#064e3b", orb2:"#065f46", warp:"#6ee7b7", sphere:"#059669" }},
  { id:"romantic",   label:"Romantic",    emoji:"❋", desc:"Tender & warm",         spotifyQuery:"romantic love songs couples",
    palette:{ bg:["#1a0010","#2d0020","#3d0030"], accent:"#ff85a1", secondary:"#ff4d8f", glow:"#e91e8c", text:"#ffe6f0", muted:"#c47b8f", orb1:"#831843", orb2:"#9d174d", warp:"#f9a8d4", sphere:"#db2777" }},
  { id:"focused",    label:"Focused",     emoji:"⊕", desc:"Sharp & intentional",   spotifyQuery:"focus study deep work concentration",
    palette:{ bg:["#050510","#0a0a20","#0f0f30"], accent:"#a0c4ff", secondary:"#6a8fd8", glow:"#3a7bd5", text:"#e8ecff", muted:"#7a8aaa", orb1:"#1e3a5f", orb2:"#1e3a8a", warp:"#bfdbfe", sphere:"#3b82f6" }},
  { id:"nostalgic",  label:"Nostalgic",   emoji:"◉", desc:"Warm & wistful",        spotifyQuery:"90s throwback nostalgic classics",
    palette:{ bg:["#1a1000","#2d1e00","#3d2a00"], accent:"#ffb347", secondary:"#e07b39", glow:"#c9621e", text:"#fff5e6", muted:"#bfa07a", orb1:"#78350f", orb2:"#92400e", warp:"#fcd34d", sphere:"#d97706" }},
  { id:"rebellious", label:"Rebellious",  emoji:"⊗", desc:"Raw & untamed",         spotifyQuery:"rock punk alternative rebellious",
    palette:{ bg:["#050505","#0a0a0a","#111111"], accent:"#39ff14", secondary:"#00ffcc", glow:"#ff0044", text:"#f0fff0", muted:"#7abf7a", orb1:"#14532d", orb2:"#052e16", warp:"#4ade80", sphere:"#22c55e" }},
];
const DEFAULT_PALETTE = MOODS[0].palette;

//5) CONTEXTS
const ThemeContext   = createContext({ palette: DEFAULT_PALETTE, moodId: null });
const RouterContext  = createContext({ path:"/", params:{}, navigate:()=>{}, goBack:()=>{} });
const SpotifyContext = createContext({ token:null, isAuthenticated:false, login:()=>{}, logout:()=>{}, authLoading:false, authError:null });
ThemeContext.displayName   = "ThemeContext";
RouterContext.displayName  = "RouterContext";
SpotifyContext.displayName = "SpotifyContext";

//6) REDUCERS
const SA = { START:"START", SUCCESS:"SUCCESS", ERROR:"ERROR", RESET:"RESET" };
const spInit = { playlist:null, tracks:[], loading:false, error:null };
function spotifyReducer(state, action) {
  switch (action.type) {
    case SA.START:   return { ...spInit, loading:true };
    case SA.SUCCESS: return { loading:false, error:null, playlist:action.playlist, tracks:action.tracks };
    case SA.ERROR:   return { ...spInit, error:action.err };
    case SA.RESET:   return spInit;
    default:         return state;
  }
}

//7) SPOTIFY PKCE HELPERS — unchanged, these were correct
function generateCodeVerifier() {
  const arr = new Uint8Array(32);
  window.crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
async function generateCodeChallenge(verifier) {
  const data   = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// CAPTURE AUTH CODE BEFORE REACT MOUNTS — unchanged, this was correct
const SPOTIFY_CODE_KEY = "sp_auth_code";
const SPOTIFY_ERR_KEY  = "sp_auth_error";
(function captureAuthParams() {
  const p    = new URLSearchParams(window.location.search);
  const code = p.get("code");
  const err  = p.get("error");
  if (code) {
    sessionStorage.setItem(SPOTIFY_CODE_KEY, code);
    window.history.replaceState({}, "", window.location.pathname + window.location.hash);
  } else if (err) {
    sessionStorage.setItem(SPOTIFY_ERR_KEY, err);
    window.history.replaceState({}, "", window.location.pathname + window.location.hash);
  }
})();

//8) CUSTOM HOOKS

// Derives palette + mood from id
function useMoodTheme(moodId) {
  return useMemo(() => {
    const mood = MOODS.find(m => m.id === moodId);
    return { palette: mood?.palette ?? DEFAULT_PALETTE, mood: mood ?? null };
  }, [moodId]);
}

// useSpotifyAuth — PKCE OAuth flow (logic unchanged; only scope was broken)
function useSpotifyAuth() {
  const [token,       setToken]       = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError,   setAuthError]   = useState(null);

  useEffect(() => {
    // Restore a still-valid token
    const expiry = parseInt(sessionStorage.getItem(SPOTIFY_EXPIRY_KEY) ?? "0", 10);
    const stored = sessionStorage.getItem(SPOTIFY_TOKEN_KEY);
    if (stored && Date.now() < expiry) { setToken(stored); return; }

    // Check for an error captured at module-load time
    const errParam = sessionStorage.getItem(SPOTIFY_ERR_KEY);
    if (errParam) {
      sessionStorage.removeItem(SPOTIFY_ERR_KEY);
      setAuthError(`Spotify error: "${errParam}"`);
      return;
    }

    // Check for an auth code captured at module-load time
    const code = sessionStorage.getItem(SPOTIFY_CODE_KEY);
    if (!code) return;

    const verifier = sessionStorage.getItem(SPOTIFY_VERIFIER_KEY);
    if (!verifier) {
      sessionStorage.removeItem(SPOTIFY_CODE_KEY);
      setAuthError("Auth session expired — please try connecting again.");
      return;
    }

    sessionStorage.removeItem(SPOTIFY_CODE_KEY);
    setAuthLoading(true);
    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     SPOTIFY_CLIENT_ID,
        grant_type:    "authorization_code",
        code,
        redirect_uri:  SPOTIFY_REDIRECT(),
        code_verifier: verifier,
      }),
    })
    .then(r => r.json())
    .then(d => {
      if (d.access_token) {
        sessionStorage.setItem(SPOTIFY_TOKEN_KEY,  d.access_token);
        sessionStorage.setItem(SPOTIFY_EXPIRY_KEY, String(Date.now() + d.expires_in * 1000));
        sessionStorage.removeItem(SPOTIFY_VERIFIER_KEY);
        setToken(d.access_token);
      } else {
        setAuthError(d.error_description ?? "Token exchange failed — check your Client ID and Redirect URI.");
      }
    })
    .catch(() => setAuthError("Network error during auth. Please try again."))
    .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async () => {
    if (!SPOTIFY_CLIENT_ID || SPOTIFY_CLIENT_ID === "YOUR_SPOTIFY_CLIENT_ID") {
      setAuthError("Set your SPOTIFY_CLIENT_ID in the code first.");
      return;
    }
    const verifier  = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem(SPOTIFY_VERIFIER_KEY, verifier);

    const url = new URL("https://accounts.spotify.com/authorize");
    url.searchParams.set("client_id",             SPOTIFY_CLIENT_ID);
    url.searchParams.set("response_type",         "code");
    url.searchParams.set("redirect_uri",          SPOTIFY_REDIRECT());
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("code_challenge",        challenge);
    url.searchParams.set("scope",                 SPOTIFY_SCOPES);
    window.location.href = url.toString();
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SPOTIFY_TOKEN_KEY);
    sessionStorage.removeItem(SPOTIFY_EXPIRY_KEY);
    setToken(null);
  }, []);

  return { token, isAuthenticated: !!token, login, logout, authLoading, authError };
}

// Search Spotify for mood playlists and fetch tracks
function useSpotifyMoodPlaylist(token) {
  const [state, dispatch] = useReducer(spotifyReducer, spInit);

  const search = useCallback(async (moodId) => {
    if (!token) return;
    const mood = MOODS.find(m => m.id === moodId);
    if (!mood) return;
    dispatch({ type: SA.START });

    try {
      // FIX #2 (Feb 2026): Search limit max is now 10. We request 10 and pick the best.
      // We also drop the "market" param — hardcoding "US" silently excludes non-US users.
      const sRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(mood.spotifyQuery)}&type=playlist&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (sRes.status === 401) {
        dispatch({ type: SA.ERROR, err: "Session expired — please reconnect Spotify." });
        return;
      }
      if (!sRes.ok) {
        dispatch({ type: SA.ERROR, err: `Spotify search error (${sRes.status}). Try again.` });
        return;
      }
      const sData = await sRes.json();
      const items = sData.playlists?.items?.filter(Boolean) ?? [];
      if (!items.length) {
        dispatch({ type: SA.ERROR, err: "No playlists found for this mood on Spotify." });
        return;
      }

      // Prefer playlists with cover art and at least some tracks
      const playlist =
        items.find(p => p.images?.length && p.tracks?.total >= 10) ?? items[0];

      // FIX #3 (Feb 2026): The endpoint was renamed from /tracks to /items.
      // Also dropped "market=US" to support all regions.
      // NOTE (Feb 2026): Due to Spotify's new data access restrictions, track items
      // are only guaranteed for playlists you own. For third-party public playlists
      // in dev mode, the items array may come back empty. We handle that gracefully.
      const tRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/items?limit=10` +
        `&fields=items(track(id,name,artists,album(name,images),duration_ms,external_urls,preview_url))`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!tRes.ok) {
        // If items endpoint fails (e.g. 403 due to new Feb 2026 restrictions),
        // still show the playlist metadata so the user can open it on Spotify.
        dispatch({ type: SA.SUCCESS, playlist, tracks: [] });
        return;
      }
      const tData  = await tRes.json();
      const tracks = (tData.items ?? [])
        .filter(it => it?.track && !it.track.is_local && it.track.name)
        .map(it => it.track)
        .slice(0, 8);

      dispatch({ type: SA.SUCCESS, playlist, tracks });
    } catch {
      dispatch({ type: SA.ERROR, err: "Failed to load Spotify data. Check your connection." });
    }
  }, [token]);

  const reset = useCallback(() => dispatch({ type: SA.RESET }), []);
  return { ...state, search, reset };
}

// 30-second audio preview
function useAudioPreview() {
  const audioRef              = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress]   = useState(0);
  const rafRef                = useRef(null);

  const stopProgress = () => { cancelAnimationFrame(rafRef.current); };
  const startProgress = (audio) => {
    const tick = () => {
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const toggle = useCallback((trackId, previewUrl) => {
    if (!previewUrl) return;
    if (playingId === trackId) {
      audioRef.current?.pause();
      stopProgress();
      setPlayingId(null);
      setProgress(0);
    } else {
      if (audioRef.current) { audioRef.current.pause(); stopProgress(); }
      const audio = new Audio(previewUrl);
      audio.volume = 0.7;
      audio.play().catch(() => {});
      audio.onended = () => { setPlayingId(null); setProgress(0); stopProgress(); };
      startProgress(audio);
      audioRef.current = audio;
      setPlayingId(trackId);
    }
  }, [playingId]);

  useEffect(() => () => { audioRef.current?.pause(); stopProgress(); }, []);

  return { playingId, progress, toggle };
}

// rAF loop
function useAnimationFrame(callback) {
  const rafRef = useRef(null);
  const cbRef  = useRef(callback);
  useEffect(() => { cbRef.current = callback; });
  useEffect(() => {
    const loop = () => { cbRef.current(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
}

//9) HASH ROUTER
class HashRouter extends Component {
  constructor(props) {
    super(props);
    this._parseHash   = this._parseHash.bind(this);
    this._hashHandler = this._hashHandler.bind(this);
    this.navigate     = this.navigate.bind(this);
    this.goBack       = this.goBack.bind(this);
    this.state        = this._parseHash();
  }
  _parseHash() {
    const raw  = window.location.hash.replace(/^#/, "") || "/";
    const path = "/" + raw.split("/").filter(Boolean).join("/");
    let route  = path, params = {};
    const m    = path.match(/^\/playlist\/(.+)$/);
    if (m) { params = { moodId: m[1] }; route = "/playlist/:moodId"; }
    return { path: route, params };
  }
  componentDidMount()         { window.addEventListener("hashchange", this._hashHandler); }
  componentDidUpdate(_, prev) { if (prev.path !== this.state.path) window.scrollTo({ top: 0, behavior: "smooth" }); }
  componentWillUnmount()      { window.removeEventListener("hashchange", this._hashHandler); }
  _hashHandler() { this.setState(this._parseHash()); }
  navigate(to)   { window.location.hash = to; }
  goBack()       { window.history.back(); }
  render() {
    const ctx = { path: this.state.path, params: this.state.params, navigate: this.navigate, goBack: this.goBack };
    return <RouterContext.Provider value={ctx}>{this.props.children}</RouterContext.Provider>;
  }
}
HashRouter.displayName = "HashRouter";
HashRouter.propTypes   = { children: PropTypes.node.isRequired };

//10) ROUTE
function Route({ path, component: Comp, exact }) {
  const { path: cur } = useContext(RouterContext);
  return (exact ? cur === path : cur.startsWith(path)) ? <Comp /> : null;
}
Route.displayName  = "Route";
Route.propTypes    = { path: PropTypes.string.isRequired, component: PropTypes.func.isRequired, exact: PropTypes.bool };
Route.defaultProps = { exact: true };

//11) THEME PROVIDER
function ThemeProvider({ moodId, children }) {
  const { palette } = useMoodTheme(moodId);
  return <ThemeContext.Provider value={{ palette, moodId }}>{children}</ThemeContext.Provider>;
}
ThemeProvider.displayName  = "ThemeProvider";
ThemeProvider.propTypes    = { moodId: PropTypes.string, children: PropTypes.node.isRequired };
ThemeProvider.defaultProps = { moodId: null };

//12) SPOTIFY PROVIDER
function SpotifyProvider({ children }) {
  const auth = useSpotifyAuth();
  return (
    <SpotifyContext.Provider value={auth}>
      {children}
    </SpotifyContext.Provider>
  );
}
SpotifyProvider.displayName = "SpotifyProvider";
SpotifyProvider.propTypes   = { children: PropTypes.node.isRequired };

//13) SPACE BACKGROUND
function SpaceBackground({ palette }) {
  const canvasRef = useRef(null);
  const dataRef   = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    let W = canvas.width = window.innerWidth, H = canvas.height = window.innerHeight;
    dataRef.current = {
      warp: Array.from({ length: 180 }, () => ({ angle: Math.random() * Math.PI * 2, dist: Math.random() * 0.6, speed: Math.random() * 0.004 + 0.001, alpha: Math.random() })),
      twinkle: Array.from({ length: 130 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.3, phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.03 + 0.01 })),
      orbs: [{ xf: 0.13, yf: 0.22, r: 160, ci: 0 }, { xf: 0.85, yf: 0.68, r: 145, ci: 1 }, { xf: 0.50, yf: 0.82, r: 110, ci: 0 }, { xf: 0.08, yf: 0.78, r: 90, ci: 1 }, { xf: 0.88, yf: 0.14, r: 115, ci: 0 }],
      W, H,
    };
    const onResize = () => {
      if (!dataRef.current) return;
      W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight;
      dataRef.current.W = W; dataRef.current.H = H;
      dataRef.current.twinkle.forEach(s => { s.x = Math.random() * W; s.y = Math.random() * H; });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [palette]);
  useAnimationFrame(() => {
    const canvas = canvasRef.current, d = dataRef.current; if (!canvas || !d) return;
    const ctx = canvas.getContext("2d"), { W, H, warp, twinkle, orbs } = d, CX = W / 2, CY = H / 2;
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(CX, CY * 0.7, 0, CX, CY, Math.max(W, H) * 0.9);
    bg.addColorStop(0, palette.bg[1]); bg.addColorStop(0.55, palette.bg[0]); bg.addColorStop(1, "#000");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    orbs.forEach(o => { const col = o.ci === 0 ? palette.orb1 : palette.orb2; ctx.save(); ctx.filter = "blur(55px)"; const g = ctx.createRadialGradient(o.xf * W, o.yf * H, 0, o.xf * W, o.yf * H, o.r); g.addColorStop(0, col + "dd"); g.addColorStop(1, col + "00"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.xf * W, o.yf * H, o.r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
    warp.forEach(s => { s.dist += s.speed; if (s.dist > 1.15) { s.dist = 0.01 + Math.random() * 0.04; s.alpha = 0; } s.alpha = Math.min(1, s.alpha + 0.012); const nx = CX + Math.cos(s.angle) * s.dist * W * 0.72, ny = CY + Math.sin(s.angle) * s.dist * H * 0.72, bx = CX + Math.cos(s.angle) * Math.max(0, s.dist - 0.018) * W * 0.72, by = CY + Math.sin(s.angle) * Math.max(0, s.dist - 0.018) * H * 0.72; const lg = ctx.createLinearGradient(bx, by, nx, ny); lg.addColorStop(0, palette.warp + "00"); lg.addColorStop(1, palette.warp + Math.floor(s.alpha * 190).toString(16).padStart(2, "0")); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(nx, ny); ctx.strokeStyle = lg; ctx.lineWidth = s.dist * 2.8; ctx.stroke(); ctx.beginPath(); ctx.arc(nx, ny, s.dist * 2.2, 0, Math.PI * 2); ctx.fillStyle = palette.warp + Math.floor(s.alpha * 160).toString(16).padStart(2, "0"); ctx.fill(); });
    twinkle.forEach(s => { s.phase += s.speed; const a = Math.sin(s.phase) * 0.4 + 0.6; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`; ctx.fill(); if (s.r > 1.1 && a > 0.87) { const sz = s.r * 2.5; ctx.strokeStyle = `rgba(255,255,255,${a * 0.45})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(s.x - sz, s.y); ctx.lineTo(s.x + sz, s.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s.x, s.y - sz); ctx.lineTo(s.x, s.y + sz); ctx.stroke(); } });
  });
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}
SpaceBackground.displayName = "SpaceBackground";
SpaceBackground.propTypes   = { palette: PropTypes.shape({ bg: PropTypes.array.isRequired, orb1: PropTypes.string.isRequired, orb2: PropTypes.string.isRequired, warp: PropTypes.string.isRequired }).isRequired };

//14) WIREFRAME SPHERE
function WireframeSphere({ size, color }) {
  const canvasRef = useRef(null), tRef = useRef(0);
  useEffect(() => { const c = canvasRef.current; if (c) { c.width = c.height = size; } }, [size]);
  useAnimationFrame(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"), cx = size / 2, cy = size / 2, R = size * 0.41;
    ctx.clearRect(0, 0, size, size); tRef.current += 0.009;
    const ry = tRef.current, rx = Math.sin(tRef.current * 0.37) * 0.28;
    const rY = (x, y, z, a) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
    const rX = (x, y, z, a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
    const tf = (x, y, z) => { const [a, b, c] = rY(x, y, z, ry); return rX(a, b, c, rx); };
    const pj = (x, y, z) => { const s = 1.6 / (1.6 + z / R); return [cx + x * s, cy + y * s]; };
    for (let lat = 1; lat < 10; lat++) { const phi = lat / 10 * Math.PI, r2 = R * Math.sin(phi), pz = R * Math.cos(phi); ctx.beginPath(); for (let s = 0; s <= 48; s++) { const th = s / 48 * Math.PI * 2; const [px, py] = pj(...tf(r2 * Math.cos(th), pz, r2 * Math.sin(th))); s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.closePath(); ctx.strokeStyle = color + Math.floor(55 + 85 * Math.sin(phi)).toString(16).padStart(2, "0"); ctx.lineWidth = 0.85; ctx.stroke(); }
    for (let lon = 0; lon < 12; lon++) { const th = lon / 12 * Math.PI * 2; ctx.beginPath(); for (let s = 0; s <= 36; s++) { const phi = s / 36 * Math.PI; const [px, py] = pj(...tf(R * Math.sin(phi) * Math.cos(th), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(th))); s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.strokeStyle = color + "55"; ctx.lineWidth = 0.7; ctx.stroke(); }
    const halo = ctx.createRadialGradient(cx, cy, R * 0.65, cx, cy, R * 1.15); halo.addColorStop(0, color + "00"); halo.addColorStop(1, color + "2e"); ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2); ctx.fillStyle = halo; ctx.fill();
  });
  return <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />;
}
WireframeSphere.displayName  = "WireframeSphere";
WireframeSphere.propTypes    = { size: PropTypes.number, color: PropTypes.string.isRequired };
WireframeSphere.defaultProps = { size: 140 };

//15) NAV BAR
function NavBar({ activeMoodId }) {
  const { navigate, path } = useContext(RouterContext);
  const { palette }        = useContext(ThemeContext);
  const activeMood = MOODS.find(m => m.id === activeMoodId) ?? null;
  const S = {
    nav:  { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid ${palette.accent}20`, transition: "border-color 0.8s" },
    logo: { fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, background: `linear-gradient(120deg,${palette.text},${palette.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", cursor: "pointer", userSelect: "none" },
    link: (a) => ({ fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", transition: "color 0.3s", padding: "4px 10px", color: a ? palette.accent : palette.muted }),
  };
  return (
    <nav style={S.nav}>
      <span style={S.logo} onClick={() => navigate("/")}>✦ MoodPlay</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {[["/", "Home"], ["/about", "About"]].map(([r, l]) => (
          <button key={r} onClick={() => navigate(r)} style={S.link(path === r)}>{l}</button>
        ))}
        {activeMood && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 20, background: `${activeMood.palette.accent}18`, border: `1px solid ${activeMood.palette.accent}55`, transition: "all 0.5s" }}>
            <span style={{ fontSize: 13 }}>{activeMood.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: activeMood.palette.accent, letterSpacing: 0.5 }}>{activeMood.label}</span>
          </div>
        )}
      </div>
    </nav>
  );
}
NavBar.displayName  = "NavBar";
NavBar.propTypes    = { activeMoodId: PropTypes.string };
NavBar.defaultProps = { activeMoodId: null };

//16) MOOD CARD
const MoodCard = memo(function MoodCard({ mood, isSelected, onSelect, onHover, onLeave, animIndex }) {
  const style = {
    padding: "15px 10px", borderRadius: 13, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.3s",
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    background:  isSelected ? `${mood.palette.accent}22` : "rgba(0,0,0,0.5)",
    border:      `1.5px solid ${isSelected ? mood.palette.accent : mood.palette.accent + "28"}`,
    boxShadow:   isSelected ? `0 0 26px ${mood.palette.glow}55,inset 0 0 20px ${mood.palette.accent}10` : "none",
    transform:   isSelected ? "scale(1.05)" : "scale(1)",
    animation:   `cardIn 0.5s ${animIndex * 0.05}s both`,
  };
  return (
    <button style={style} onClick={onSelect} onMouseEnter={onHover} onMouseLeave={onLeave}>
      <span style={{ fontSize: 22, color: mood.palette.accent, display: "block", animation: isSelected ? "floatY 2.2s ease-in-out infinite" : "none" }}>{mood.emoji}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? mood.palette.accent : mood.palette.text, transition: "color 0.3s" }}>{mood.label}</span>
      <span style={{ fontSize: 9.5, color: mood.palette.muted, textAlign: "center", lineHeight: 1.35 }}>{mood.desc}</span>
    </button>
  );
});
MoodCard.displayName  = "MoodCard";
MoodCard.propTypes    = { mood: PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, emoji: PropTypes.string.isRequired, desc: PropTypes.string.isRequired, palette: PropTypes.object.isRequired }).isRequired, isSelected: PropTypes.bool, onSelect: PropTypes.func.isRequired, onHover: PropTypes.func.isRequired, onLeave: PropTypes.func.isRequired, animIndex: PropTypes.number };
MoodCard.defaultProps = { isSelected: false, animIndex: 0 };

//17) SPOTIFY SONG ROW
const SpotifySongRow = memo(function SpotifySongRow({ track, index, playingId, onToggle }) {
  const { palette }   = useContext(ThemeContext);
  const [hov, setHov] = useState(false);
  const isPlaying     = playingId === track.id;
  const hasPreview    = !!track.preview_url;
  const dur           = Math.floor(track.duration_ms / 1000);
  const durStr        = `${Math.floor(dur / 60)}:${String(dur % 60).padStart(2, "0")}`;
  const thumb         = track.album?.images?.find(i => i.width <= 64)?.url ?? track.album?.images?.at(-1)?.url;
  const spotifyUrl    = track.external_urls?.spotify;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 14px", borderRadius: 10, transition: "all 0.22s",
        background: isPlaying ? `${palette.accent}22` : hov ? `${palette.accent}14` : `${palette.accent}07`,
        border: `1px solid ${isPlaying ? palette.accent + "70" : hov ? palette.accent + "40" : palette.accent + "18"}`,
        animation: `fadeUp 0.4s ${index * 0.06}s both`,
      }}
    >
      <button
        onClick={() => hasPreview && onToggle(track.id, track.preview_url)}
        style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${palette.accent}40`, background: isPlaying ? palette.accent : hov && hasPreview ? `${palette.accent}22` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: hasPreview ? "pointer" : "default", flexShrink: 0, transition: "all 0.2s" }}
        title={hasPreview ? (isPlaying ? "Pause preview" : "Play 30s preview") : "No preview available"}
      >
        {isPlaying ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill={palette.bg[0]}><rect x="1" y="1" width="3" height="8" /><rect x="6" y="1" width="3" height="8" /></svg>
        ) : (
          <span style={{ fontSize: 10, fontWeight: 700, color: hov && hasPreview ? palette.accent : palette.muted }}>{index + 1}</span>
        )}
      </button>

      {thumb ? (
        <img src={thumb} alt="" width={38} height={38}
          style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0, border: `1px solid ${palette.accent}20` }} />
      ) : (
        <div style={{ width: 38, height: 38, borderRadius: 6, background: `${palette.accent}18`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>♪</div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: isPlaying ? palette.accent : palette.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{track.name}</div>
        <div style={{ fontSize: 11, color: palette.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {track.artists?.map(a => a.name).join(", ")} · {track.album?.name}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: palette.muted }}>{durStr}</span>
        {spotifyUrl && (
          <a href={spotifyUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", opacity: hov ? 1 : 0.45, transition: "opacity 0.2s" }}
            title="Open in Spotify"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
});
SpotifySongRow.displayName = "SpotifySongRow";
SpotifySongRow.propTypes   = {
  track:     PropTypes.shape({ id: PropTypes.string, name: PropTypes.string.isRequired, artists: PropTypes.array, album: PropTypes.object, duration_ms: PropTypes.number, external_urls: PropTypes.object, preview_url: PropTypes.string }).isRequired,
  index:     PropTypes.number.isRequired,
  playingId: PropTypes.string,
  onToggle:  PropTypes.func.isRequired,
};

//18) SPOTIFY CONNECT BANNER
function SpotifyConnectBanner() {
  const { login, authLoading, authError } = useContext(SpotifyContext);
  const { palette } = useContext(ThemeContext);
  return (
    <div style={{ width: "100%", maxWidth: 520, textAlign: "center", animation: "cardIn 0.6s both" }}>
      <div style={{ marginBottom: 20 }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="#1DB954" style={{ opacity: 0.9 }}>
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </div>

      <h2 style={{ fontFamily: "'Playfair Display',serif", color: palette.text, fontSize: 22, marginBottom: 10 }}>Connect Spotify</h2>
      <p style={{ color: palette.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
        Link your Spotify account to get real playlists, album art, and 30-second track previews — all matched to your mood.
      </p>

      <button
        onClick={login}
        disabled={authLoading}
        style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 28px", borderRadius: 30, background: "#1DB954", border: "none", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s", letterSpacing: 0.3, boxShadow: "0 0 30px #1DB95440", opacity: authLoading ? 0.7 : 1 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        {authLoading ? "Connecting…" : "Connect with Spotify"}
      </button>

      {authError && (
        <div style={{ marginTop: 16, padding: "10px 18px", borderRadius: 8, background: "#ff004418", border: "1px solid #ff004440", color: "#ff6688", fontSize: 12, animation: "fadeUp 0.3s both" }}>
          {authError}
        </div>
      )}

      <p style={{ color: palette.muted, fontSize: 11, marginTop: 20, opacity: 0.5 }}>
        Uses PKCE OAuth — no password stored · Token valid for 1 hour
      </p>
    </div>
  );
}
SpotifyConnectBanner.displayName = "SpotifyConnectBanner";

//19) HOME VIEW
class HomeView extends Component {
  constructor(props) {
    super(props);
    this.state = { hoveredMood: null, selectedMood: null, greeting: this._getGreeting(), mounted: false };
    this._handleSelect = this._handleSelect.bind(this);
    this._handleHover  = this._handleHover.bind(this);
    this._handleLeave  = this._handleLeave.bind(this);
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.preselectedMood && !prevState.selectedMood) return { selectedMood: nextProps.preselectedMood };
    return null;
  }
  componentDidMount() {
    this._timer = setInterval(() => this.setState({ greeting: this._getGreeting() }), 60000);
    requestAnimationFrame(() => this.setState({ mounted: true }));
  }
  componentDidUpdate(_, prev) {
    if (prev.hoveredMood !== this.state.hoveredMood)
      this.props.onMoodPreview?.(this.state.hoveredMood ?? this.state.selectedMood);
  }
  componentWillUnmount() { clearInterval(this._timer); }
  _getGreeting() {
    const h = new Date().getHours();
    if (h < 5) return "Night session"; if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon"; if (h < 21) return "Good evening";
    return "Night owl mode";
  }
  _handleSelect(id) { this.setState({ selectedMood: id }); this.props.onMoodSelect(id); }
  _handleHover(id)  { this.setState({ hoveredMood: id }); }
  _handleLeave()    { this.setState({ hoveredMood: null }); }

  render() {
    const { selectedMood, greeting, mounted } = this.state;
    const { palette } = this.context;
    return (
      <Fragment>
        <div style={{ textAlign: "center", marginBottom: 44, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(-20px)", transition: "all 0.9s" }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: palette.accent, textTransform: "uppercase", marginBottom: 8, transition: "color 0.8s" }}>{greeting} · Sound × Emotion</div>
          <h1 style={{ fontSize: "clamp(34px,6vw,58px)", fontFamily: "'Playfair Display',serif", fontWeight: 700, background: `linear-gradient(120deg,${palette.text} 0%,${palette.accent} 45%,${palette.secondary} 100%)`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear infinite", lineHeight: 1.1, transition: "all 0.9s" }}>Mood Playlist</h1>
          <p style={{ color: palette.muted, marginTop: 10, fontSize: 14, transition: "color 0.8s" }}>Choose your emotional frequency. Get your Spotify soundtrack.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(138px,1fr))", gap: 10, width: "100%", maxWidth: 760, marginBottom: 44 }}>
          {MOODS.map((mood, i) => (
            <MoodCard key={mood.id} mood={mood} isSelected={selectedMood === mood.id}
              onSelect={() => this._handleSelect(mood.id)}
              onHover={() => this._handleHover(mood.id)}
              onLeave={this._handleLeave} animIndex={i} />
          ))}
        </div>
        {!selectedMood && <div style={{ color: palette.muted, fontSize: 11, opacity: 0.5, letterSpacing: 1 }}>hover to preview · click to generate</div>}
      </Fragment>
    );
  }
}
HomeView.displayName  = "HomeView";
HomeView.contextType  = ThemeContext;
HomeView.propTypes    = { onMoodSelect: PropTypes.func.isRequired, onMoodPreview: PropTypes.func, preselectedMood: PropTypes.string };
HomeView.defaultProps = { onMoodPreview: null, preselectedMood: null };

//20) PLAYLIST VIEW
function PlaylistView() {
  const { params, navigate }     = useContext(RouterContext);
  const { palette }              = useContext(ThemeContext);
  const { token, isAuthenticated,
          login, authError }     = useContext(SpotifyContext);
  const { playlist, tracks,
          loading, error,
          search, reset }        = useSpotifyMoodPlaylist(token);
  const { playingId, toggle }    = useAudioPreview();

  const mood = useMemo(() => MOODS.find(m => m.id === params.moodId), [params.moodId]);

  useEffect(() => {
    if (params.moodId && isAuthenticated) search(params.moodId);
  }, [params.moodId, isAuthenticated]);

  const handleBack = useCallback(() => { reset(); navigate("/"); }, [reset, navigate]);

  if (!isAuthenticated) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%", maxWidth: 520, animation: "cardIn 0.5s both" }}>
      <div style={{ padding: "16px 22px", borderRadius: 12, background: `${palette.accent}10`, border: `1px solid ${palette.accent}25`, backdropFilter: "blur(14px)", textAlign: "center", width: "100%" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{mood?.emoji}</div>
        <div style={{ fontFamily: "'Playfair Display',serif", color: palette.text, fontSize: 18, marginBottom: 6 }}>{mood?.label} Playlist</div>
        <div style={{ color: palette.muted, fontSize: 12 }}>{mood?.desc}</div>
      </div>
      <SpotifyConnectBanner />
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 60, animation: "fadeUp 0.4s both" }}>
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <div style={{ position: "absolute", inset: 0, border: `2px solid ${palette.accent}20`, borderTop: `2px solid ${palette.accent}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <div style={{ position: "absolute", inset: 6, border: `2px solid #1DB95420`, borderTop: "2px solid #1DB954", borderRadius: "50%", animation: "spin 1.4s linear infinite reverse" }} />
      </div>
      <div style={{ color: palette.muted, fontSize: 13 }}>Searching Spotify for <span style={{ color: palette.accent }}>{mood?.label.toLowerCase()}</span> vibes…</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: 40, maxWidth: 480 }}>
      <div style={{ padding: "13px 20px", borderRadius: 10, background: "#ff004420", border: "1px solid #ff004455", color: "#ff6688", fontSize: 13, marginBottom: 16 }}>{error}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => search(params.moodId)} style={btn(palette)}>↺ Retry</button>
        <button onClick={handleBack} style={btn(palette)}>← New Mood</button>
      </div>
    </div>
  );

  if (!playlist) return null;

  const playlistCover = playlist.images?.[0]?.url;
  const playlistUrl   = playlist.external_urls?.spotify;
  const totalPreviews = tracks.filter(t => t.preview_url).length;

  // FIX #4 (Feb 2026): tracks may be empty for third-party public playlists in dev mode.
  // We still show the playlist header + a helpful message so users can open it on Spotify.
  const hasNoTracks = tracks.length === 0;

  return (
    <div style={{ width: "100%", maxWidth: 640, animation: "cardIn 0.65s both" }}>
      <div style={{ display: "flex", gap: 18, padding: "20px 22px", borderRadius: "16px 16px 0 0", background: `${palette.accent}10`, border: `1px solid ${palette.accent}30`, borderBottom: "none", backdropFilter: "blur(18px)", alignItems: "flex-start" }}>
        {playlistCover ? (
          <img src={playlistCover} alt={playlist.name}
            style={{ width: 90, height: 90, borderRadius: 10, objectFit: "cover", flexShrink: 0, boxShadow: `0 4px 20px ${palette.glow}40`, border: `1px solid ${palette.accent}30` }} />
        ) : (
          <div style={{ width: 90, height: 90, borderRadius: 10, background: `${palette.accent}20`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{mood?.emoji}</div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#1DB954", textTransform: "uppercase", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
            Spotify · {mood?.label}
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(16px,3.5vw,22px)", color: palette.text, fontWeight: 700, lineHeight: 1.2, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {playlist.name}
          </h2>
          {playlist.description && (
            <p style={{ color: palette.muted, fontSize: 11, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", maxWidth: 360 }}
              dangerouslySetInnerHTML={{ __html: playlist.description }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: palette.muted }}>{playlist.tracks?.total ?? tracks.length} tracks</span>
            {playlist.owner?.display_name && <span style={{ fontSize: 10, color: palette.muted }}>by {playlist.owner.display_name}</span>}
            {playlistUrl && (
              <a href={playlistUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 12, background: "#1DB954", color: "#000", fontSize: 10, fontWeight: 700, textDecoration: "none", letterSpacing: 0.3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#000"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                Open on Spotify
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 12px 14px", background: "rgba(0,0,0,0.65)", border: `1px solid ${palette.accent}28`, borderRadius: "0 0 16px 16px", backdropFilter: "blur(18px)", display: "flex", flexDirection: "column", gap: 4 }}>
        {hasNoTracks ? (
          // Graceful fallback for Feb 2026 Spotify API restriction:
          // public playlist track contents are no longer returned in dev mode.
          <div style={{ padding: "24px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎵</div>
            <div style={{ color: palette.text, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Track list unavailable in preview</div>
            <div style={{ color: palette.muted, fontSize: 12, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 16px" }}>
              Due to Spotify API restrictions in developer mode, track details for third-party playlists can't be shown inline. Open the playlist directly on Spotify to listen.
            </div>
            {playlistUrl && (
              <a href={playlistUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 20, background: "#1DB954", color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#000"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                Listen on Spotify
              </a>
            )}
          </div>
        ) : (
          tracks.map((track, i) => (
            <SpotifySongRow key={track.id ?? i} track={track} index={i} playingId={playingId} onToggle={toggle} />
          ))
        )}

        <div style={{ marginTop: 10, paddingTop: 12, borderTop: `1px solid ${palette.accent}18`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 10, color: palette.muted, display: "flex", gap: 10, alignItems: "center" }}>
            {!hasNoTracks && <span>{tracks.length} tracks shown</span>}
            {totalPreviews > 0 && <span style={{ color: "#1DB95488" }}>▶ {totalPreviews} previews · click to play</span>}
          </div>
          <button onClick={handleBack} style={btn(palette)}>← New Mood</button>
        </div>
      </div>
    </div>
  );
}
PlaylistView.displayName = "PlaylistView";

//21) ABOUT VIEW
function AboutView() {
  const { palette }  = useContext(ThemeContext);
  const { navigate } = useContext(RouterContext);
  const card = { background: `${palette.accent}10`, border: `1px solid ${palette.accent}30`, borderRadius: 14, backdropFilter: "blur(14px)", animation: "cardIn 0.5s both" };
  const TECH = [
    ["React",            "Functional + Class components, full lifecycle, hooks, Context API, custom hash router"],
    ["Spotify PKCE",     "Authorization Code + PKCE OAuth flow — no client secret ever sent from the browser"],
    ["Spotify Web API",  "Playlist search by mood query, track fetching with album art and preview URLs"],
    ["Audio API",        "HTML Audio for 30-second track previews with requestAnimationFrame progress tracking"],
    ["Canvas API",       "Space background with warp-speed stars, glowing orbs, and animated wireframe spheres"],
    ["Hooks used",       "useState · useEffect · useRef · useCallback · useMemo · useReducer · useContext"],
    ["Custom hooks",     "useMoodTheme · useSpotifyAuth · useSpotifyMoodPlaylist · useAudioPreview · useAnimationFrame"],
    ["State management", "useReducer for Spotify fetch state machine: START → SUCCESS / ERROR → RESET"],
    ["PropTypes",        "Full prop validation with .shape, .arrayOf and .isRequired on every component"],
  ];
  return (
    <div style={{ width: "100%", maxWidth: 640, animation: "fadeUp 0.6s both" }}>
      <div style={{ ...card, padding: "28px 28px 24px", marginBottom: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: palette.accent, textTransform: "uppercase", marginBottom: 12 }}>About MoodPlay</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: palette.text, fontSize: 24, lineHeight: 1.25, marginBottom: 14 }}>
          Your mood, turned into a soundtrack.
        </h2>
        <p style={{ color: palette.muted, fontSize: 13, lineHeight: 1.85, marginBottom: 12 }}>
          MoodPlay is a playlist generator that maps how you feel right now to real music from Spotify. Rather than searching for songs yourself, you pick an emotional frequency — euphoric, melancholic, focused, rebellious, and five more — and MoodPlay finds a curated Spotify playlist that fits it, then surfaces the top tracks so you can start listening immediately.
        </p>
        <p style={{ color: palette.muted, fontSize: 13, lineHeight: 1.85 }}>
          The whole interface reacts to your chosen mood: the colour palette, background animation, glowing orbs, and accent tones all shift to reflect the emotional tone you've selected. Hover over a mood card to preview its atmosphere before committing.
        </p>
      </div>

      <div style={{ ...card, padding: "22px 28px", marginBottom: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: palette.accent, textTransform: "uppercase", marginBottom: 14 }}>How to generate a playlist</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["1", "Connect Spotify", "Click the Connect with Spotify button on any playlist page. You'll be taken to Spotify's login page and redirected straight back — no password is stored by MoodPlay."],
            ["2", "Pick your mood",  "From the home screen, choose whichever of the eight moods matches how you're feeling. Hover to see the visual atmosphere shift before you click."],
            ["3", "Listen",          "MoodPlay searches Spotify for the best matching playlist and shows you the top tracks with album art. Click the play button on any track to hear a 30-second preview, or tap Open on Spotify to play the full song."],
            ["4", "Change anytime",  "Hit ← New Mood at any time to go back and pick a different emotional frequency."],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${palette.accent}22`, border: `1px solid ${palette.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: palette.accent }}>{num}</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: palette.text, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: palette.muted, lineHeight: 1.65 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: "22px 28px", marginBottom: 12 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: palette.accent, textTransform: "uppercase", marginBottom: 14 }}>Tech stack</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TECH.map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "6px 0", borderBottom: `1px solid ${palette.accent}15` }}>
              <span style={{ color: palette.accent, fontWeight: 700, fontSize: 11, minWidth: 140, flexShrink: 0, paddingTop: 1 }}>{title}</span>
              <span style={{ color: palette.muted, fontSize: 11, lineHeight: 1.6 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button onClick={() => navigate("/")} style={btn(palette)}>← Back to Playlists</button>
      </div>
    </div>
  );
}
AboutView.displayName = "AboutView";

//22) SHARED STYLE FACTORY
const btn = (p) => ({ padding: "8px 18px", borderRadius: 8, background: "transparent", border: `1px solid ${p.accent}50`, color: p.accent, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" });

//23) APP SHELL
function AppShell({ onMoodSelect, onMoodPreview, activeMoodId }) {
  const { palette } = useContext(ThemeContext);
  const { path }    = useContext(RouterContext);
  const bgId = path.startsWith("/playlist/") ? path.replace("/playlist/", "") : activeMoodId;
  const { palette: bgPalette } = useMoodTheme(bgId);
  const SPHERES = [
    { top: "-10px",   left: "-10px",   size: 130, delay: "0s",   opacity: 1    },
    { bottom: "-15px",right: "-15px",  size: 155, delay: "1.2s", opacity: 1    },
    { bottom: "18%",  left: "-28px",   size: 85,  delay: "2.5s", opacity: 0.5  },
    { top: "30%",     right: "-20px",  size: 75,  delay: "0.8s", opacity: 0.45 },
  ];
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans','Outfit',sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardIn{from{opacity:0;transform:scale(0.93) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <SpaceBackground palette={bgPalette} key={bgId ?? "default"} />
      {SPHERES.map((s, i) => (
        <div key={i} style={{ position: "fixed", zIndex: 1, pointerEvents: "none", animation: `floatY ${6 + i}s ${s.delay} ease-in-out infinite`, opacity: s.opacity, ...Object.fromEntries(Object.entries(s).filter(([k]) => ["top", "bottom", "left", "right"].includes(k))) }}>
          <WireframeSphere size={s.size} color={palette.sphere} />
        </div>
      ))}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", background: `radial-gradient(ellipse at 50% 38%,transparent 42%,${bgPalette.bg[0]}95 100%)`, transition: "all 1.1s" }} />
      <NavBar activeMoodId={activeMoodId} />
      <div style={{ position: "relative", zIndex: 3, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 20px 80px" }}>
        <Route path="/" exact component={() => <HomeView onMoodSelect={onMoodSelect} onMoodPreview={onMoodPreview} preselectedMood={activeMoodId} />} />
        <Route path="/playlist/:moodId" component={PlaylistView} />
        <Route path="/about"            component={AboutView} />
      </div>
    </div>
  );
}
AppShell.displayName  = "AppShell";
AppShell.propTypes    = { onMoodSelect: PropTypes.func.isRequired, onMoodPreview: PropTypes.func.isRequired, activeMoodId: PropTypes.string };
AppShell.defaultProps = { activeMoodId: null };

//24) ROOT APP
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { activeMoodId: null, previewMoodId: null };
    this.handleMoodSelect  = this.handleMoodSelect.bind(this);
    this.handleMoodPreview = this.handleMoodPreview.bind(this);
  }
  componentDidMount()    { document.title = "MoodPlay · Spotify Playlist Generator"; }
  componentDidUpdate(_, p) { if (p.activeMoodId !== this.state.activeMoodId) { const m = MOODS.find(m => m.id === this.state.activeMoodId); document.title = m ? `${m.label} · MoodPlay` : "MoodPlay"; } }
  componentWillUnmount() { document.title = "MoodPlay"; }
  handleMoodSelect(id)   { this.setState({ activeMoodId: id, previewMoodId: id }); window.location.hash = `/playlist/${id}`; }
  handleMoodPreview(id)  { this.setState({ previewMoodId: id ?? this.state.activeMoodId }); }
  render() {
    const displayId = this.state.previewMoodId ?? this.state.activeMoodId;
    return (
      <SpotifyProvider>
        <ThemeProvider moodId={displayId}>
          <HashRouter>
            <AppShell
              onMoodSelect={this.handleMoodSelect}
              onMoodPreview={this.handleMoodPreview}
              activeMoodId={this.state.activeMoodId}
            />
          </HashRouter>
        </ThemeProvider>
      </SpotifyProvider>
    );
  }
}
App.displayName = "App";

export default App;