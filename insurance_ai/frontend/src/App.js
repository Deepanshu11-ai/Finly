import { useState, useEffect, useRef } from "react";

// ─── Fonts & Global Styles ───────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy: #f8f6f1;
      --navy-2: #f0ece3;
      --navy-3: #e8e2d6;
      --midnight: #f5f1ea;
      --steel: #ffffff;
      --slate: #faf8f4;
      --gold: #9a6f2e;
      --gold-light: #b8893a;
      --gold-pale: #7a5520;
      --ice: #e8f0fe;
      --text-1: #1a1208;
      --text-2: #4a3c28;
      --text-3: #8a7a5a;
      --green: #16a34a;
      --red: #dc2626;
      --amber: #d97706;
      --blue: #1d4ed8;
      --indigo: #4338ca;
      --border: rgba(154,111,46,0.2);
      --border-2: rgba(154,111,46,0.12);
      --glow: rgba(154,111,46,0.08);
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--navy);
      color: var(--text-1);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--navy-2); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 3px; opacity: 0.6; }

    /* Canvas particles */
    #particle-canvas {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0; opacity: 0.18;
    }

    /* Noise texture overlay */
    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.3;
      pointer-events: none;
    }

    /* Background gradient mesh */
    body::after {
      content: '';
      position: fixed; inset: 0; z-index: 0;
      background:
        radial-gradient(ellipse 80% 60% at 10% -10%, rgba(154,111,46,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 90% 110%, rgba(99,102,241,0.04) 0%, transparent 60%),
        radial-gradient(ellipse 40% 50% at 50% 50%, rgba(154,111,46,0.03) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Animated gradient border utility */
    .glow-border {
      position: relative;
    }
    .glow-border::before {
      content: '';
      position: absolute; inset: -1px;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(201,168,76,0.4), transparent 40%, rgba(99,102,241,0.3) 100%);
      z-index: -1;
    }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
      70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(201,168,76,0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(201,168,76,0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes barGrow {
      from { width: 0 !important; }
      to   { }
    }
    @keyframes numberCount {
      from { opacity: 0; transform: scale(0.8); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes borderPulse {
      0%, 100% { border-color: rgba(201,168,76,0.2); }
      50%       { border-color: rgba(201,168,76,0.5); }
    }

    .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
    .animate-fade-in { animation: fadeIn 0.4s ease both; }
    .float-anim { animation: float 4s ease-in-out infinite; }

    /* Glass card */
    .glass {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(20px) saturate(1.2);
      border: 1px solid rgba(154,111,46,0.15);
      border-radius: 16px;
      box-shadow: 0 2px 20px rgba(154,111,46,0.07), 0 1px 4px rgba(0,0,0,0.04);
    }

    /* Scanline effect on hero */
    .scanline {
      position: absolute;
      width: 100%; height: 2px;
      background: linear-gradient(90deg, transparent, rgba(154,111,46,0.15), transparent);
      animation: scanline 4s linear infinite;
      pointer-events: none;
    }

    /* Input fields */
    .field {
      width: 100%;
      background: #ffffff;
      border: 1px solid rgba(154,111,46,0.2);
      border-radius: 10px;
      padding: 12px 16px;
      color: var(--text-1);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.92rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .field:focus {
      border-color: rgba(154,111,46,0.5);
      background: #fffdf9;
      box-shadow: 0 0 0 3px rgba(154,111,46,0.08);
    }
    .field::placeholder { color: var(--text-3); }

    /* Buttons */
    .btn-gold {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #9a6f2e 0%, #b8893a 50%, #9a6f2e 100%);
      background-size: 200% auto;
      color: #ffffff;
      font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 0.85rem;
      letter-spacing: 0.08em; text-transform: uppercase;
      border: none; border-radius: 10px;
      cursor: pointer; transition: all 0.3s;
      box-shadow: 0 4px 16px rgba(154,111,46,0.25);
      white-space: nowrap;
    }
    .btn-gold:hover {
      background-position: right center;
      box-shadow: 0 6px 24px rgba(154,111,46,0.35);
      transform: translateY(-1px);
    }
    .btn-gold:active { transform: translateY(0); }

    .btn-ghost {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 11px 22px;
      background: transparent;
      border: 1px solid rgba(154,111,46,0.3);
      color: var(--text-2);
      font-family: 'Syne', sans-serif;
      font-weight: 600; font-size: 0.82rem;
      letter-spacing: 0.06em; text-transform: uppercase;
      border-radius: 10px; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover {
      border-color: var(--gold); color: var(--gold);
      background: rgba(154,111,46,0.06);
    }

    /* Result box */
    .result-box {
      background: #fafaf7;
      border: 1px solid rgba(154,111,46,0.12);
      border-radius: 12px;
      padding: 20px;
      min-height: 100px;
      color: var(--text-2);
      font-size: 0.9rem;
      line-height: 1.7;
      position: relative; overflow: hidden;
    }

    /* Coverage tags */
    .tag-covered   { background: rgba(22,163,74,0.1);   border: 1px solid rgba(22,163,74,0.3);   color: #15803d; border-radius: 6px; padding: 4px 10px; font-size: 0.8rem; display: inline-block; margin: 3px; }
    .tag-excluded  { background: rgba(220,38,38,0.08);  border: 1px solid rgba(220,38,38,0.25);  color: #b91c1c; border-radius: 6px; padding: 4px 10px; font-size: 0.8rem; display: inline-block; margin: 3px; }
    .tag-condition { background: rgba(217,119,6,0.1);   border: 1px solid rgba(217,119,6,0.3);   color: #b45309; border-radius: 6px; padding: 4px 10px; font-size: 0.8rem; display: inline-block; margin: 3px; }

    /* Risk badges */
    .badge-high   { background: rgba(220,38,38,0.1);  color: #b91c1c; border: 1px solid rgba(220,38,38,0.25);  padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge-medium { background: rgba(217,119,6,0.1);  color: #b45309; border: 1px solid rgba(217,119,6,0.25);  padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge-low    { background: rgba(22,163,74,0.1);  color: #15803d; border: 1px solid rgba(22,163,74,0.25);  padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }

    /* Divider */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border), transparent);
      margin: 20px 0;
    }

    /* Stat card */
    .stat-card {
      background: #ffffff;
      border: 1px solid rgba(154,111,46,0.15);
      border-radius: 14px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s;
    }
    .stat-card:hover {
      border-color: rgba(154,111,46,0.3);
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(154,111,46,0.1);
    }

    /* Section heading accent */
    .section-label {
      font-family: 'Syne', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--gold);
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 6px;
    }
    .section-label::before {
      content: '';
      display: inline-block; width: 20px; height: 1px;
      background: var(--gold);
    }

    /* Nav */
    .nav-item {
      position: relative;
      font-family: 'Syne', sans-serif;
      font-size: 0.78rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--text-3);
      cursor: pointer; padding: 8px 14px;
      border-radius: 8px; transition: all 0.2s;
      border: 1px solid transparent;
      white-space: nowrap;
    }
    .nav-item:hover { color: var(--gold); background: rgba(201,168,76,0.06); }
    .nav-item.active {
      color: var(--gold);
      background: rgba(201,168,76,0.1);
      border-color: rgba(201,168,76,0.25);
    }

    /* Circular score */
    .score-ring {
      position: relative; width: 130px; height: 130px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .score-ring svg { position: absolute; top: 0; left: 0; transform: rotate(-90deg); }
    .score-number {
      font-family: 'Syne', sans-serif;
      font-size: 2.2rem; font-weight: 800;
      color: var(--gold);
      animation: numberCount 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    /* Progress bar */
    .progress-track {
      background: rgba(154,111,46,0.1);
      border-radius: 99px; overflow: hidden; height: 8px;
    }
    .progress-fill {
      height: 100%; border-radius: 99px;
      animation: barGrow 1s cubic-bezier(0.34,1.56,0.64,1) both;
      transition: width 1s cubic-bezier(0.34,1.56,0.64,1);
    }

    /* File upload */
    .file-drop {
      border: 2px dashed rgba(201,168,76,0.25);
      border-radius: 12px;
      padding: 28px 20px;
      text-align: center;
      cursor: pointer; transition: all 0.3s;
      animation: borderPulse 3s ease-in-out infinite;
    }
    .file-drop:hover {
      border-color: rgba(201,168,76,0.5);
      background: rgba(201,168,76,0.04);
    }
    .file-drop.dragging {
      border-color: var(--gold);
      background: rgba(201,168,76,0.08);
    }

    /* Loading spinner */
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid rgba(154,111,46,0.15);
      border-top-color: var(--gold);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* Tooltip */
    .tooltip-wrap { position: relative; display: inline-flex; }
    .tooltip-wrap:hover .tooltip-box { opacity: 1; transform: translateY(0); pointer-events: auto; }
    .tooltip-box {
      position: absolute; bottom: calc(100% + 8px); left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: #ffffff;
      border: 1px solid rgba(154,111,46,0.2);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      border-radius: 8px; padding: 6px 10px;
      font-size: 0.75rem; color: var(--text-2);
      white-space: nowrap; opacity: 0; pointer-events: none;
      transition: all 0.2s; z-index: 100;
    }

    /* Sidebar */
    .sidebar {
      position: fixed; left: 0; top: 0; bottom: 0;
      width: 72px; z-index: 100;
      background: rgba(255,255,255,0.95);
      border-right: 1px solid rgba(154,111,46,0.15);
      backdrop-filter: blur(20px);
      display: flex; flex-direction: column;
      align-items: center; padding: 24px 0;
      gap: 8px;
      box-shadow: 2px 0 20px rgba(154,111,46,0.06);
    }

    /* Mobile */
    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main-wrap { margin-left: 0 !important; }
    }
  `}</style>
);

// ─── Particle Canvas ─────────────────────────────────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.6 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(154,111,46,${p.a * 0.5})`;
        ctx.fill();
      });
      // Connect nearby
      particles.forEach((a, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(154,111,46,${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} id="particle-canvas" />;
};

// ─── API Helpers ─────────────────────────────────────────────────────────────
// Resolve backend base URL:
//  - If window.__API_BASE__ is set by the server when serving the build, use that.
//  - Else use environment variable REACT_APP_API_URL (set in your dev env or CI).
//  - Else default to '' (relative URLs) so the app works when served from the same origin as Django.
const BASE_URL =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  (typeof process !== "undefined" && process.env.REACT_APP_API_URL) ||
  "";

// helper: read cookie (for Django CSRF)
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? v.pop() : null;
}

const api = {
  async call(url, opts = {}) {
    try {
      const fullUrl = `${BASE_URL}${url}`;
      // shallow copy options and ensure headers object exists
      const fetchOpts = { ...opts, headers: { ...(opts.headers || {}) } };

      // When frontend is served from the same origin (BASE_URL === ''), include same-origin credentials
      // to allow cookie/session based auth. When a remote BASE_URL is used, don't force credentials.
      if (!BASE_URL) fetchOpts.credentials = fetchOpts.credentials || 'same-origin';

      // If same-origin and not a GET, add CSRF token for Django
      const method = (fetchOpts.method || 'GET').toUpperCase();
      if (!BASE_URL && method !== 'GET') {
        const csrftoken = getCookie('csrftoken');
        if (csrftoken) fetchOpts.headers['X-CSRFToken'] = csrftoken;
      }

      const res = await fetch(fullUrl, fetchOpts);

      if (!res.ok) {
        // try to get server error detail if available
        let text;
        try { text = await res.text(); } catch { text = res.statusText || `HTTP ${res.status}`; }
        return { error: `HTTP ${res.status} - ${text}` };
      }

      // Parse JSON when available, otherwise return text
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) return await res.json();
      const txt = await res.text();
      return { result: txt };
    } catch (e) {
      return { error: 'Network error' };
    }
  },

  upload: (formData) =>
    api.call('/api/upload-policy/', {
      method: 'POST',
      body: formData,
    }),

  coverage: (id) =>
    api.call(`/api/coverage/?policy_id=${id}`),

  ask: (query, id) =>
    api.call('/api/ask/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, policy_id: id }),
    }),

  simulate: (scenario, id) =>
    api.call('/api/simulate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, policy_id: id }),
    }),

  score: (id) =>
    api.call(`/api/score/?policy_id=${id}`),

  hidden: (id) =>
    api.call(`/api/hidden/?policy_id=${id}`),

  claim: (scenario, id) =>
    api.call('/api/claim-predict/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, policy_id: id }),
    }),

  compare: (p1, p2) =>
    api.call('/api/compare/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policy_1: p1, policy_2: p2 }),
    }),
};
// ─── Icons (SVG inline) ──────────────────────────────────────────────────────
const icons = {
  Upload:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Shield:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Chat:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Zap:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Star:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Eye:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Bot:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="3" x2="12" y2="7"/><circle cx="9" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/></svg>,
  Compare: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Check:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  X:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Warn:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Send:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Logo:    <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 2L4 8v8c0 7.7 5.1 14.9 12 16.9C23 30.9 28 23.7 28 16V8L16 2z" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="1.5"/><path d="M11 16l3 3 7-7" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ─── Section Card wrapper ─────────────────────────────────────────────────────
const Card = ({ id, label, title, children, style, delay = 0 }) => (
  <div
    id={id}
    className="glass animate-fade-up"
    style={{ padding: "28px 30px", ...style, animationDelay: `${delay}s` }}
  >
    <div className="section-label">{label}</div>
    <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: 20, color: "var(--text-1)" }}>{title}</h2>
    {children}
  </div>
);

// ─── Loading Spinner Component ────────────────────────────────────────────────
const Spinner = ({ text = "Processing…" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", color: "var(--text-3)" }}>
    <div className="spinner" />
    <span style={{ fontSize: "0.85rem" }}>{text}</span>
  </div>
);

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const r = 54, circ = 2 * Math.PI * r;
  const fill = circ * (1 - score / 100);
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="score-ring">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={fill}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </svg>
      <span className="score-number" style={{ color }}>{score}</span>
    </div>
  );
};

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "upload",   label: "Upload",   icon: icons.Upload  },
  { id: "coverage", label: "Coverage", icon: icons.Shield  },
  { id: "ask",      label: "Ask AI",   icon: icons.Chat    },
  { id: "scenario", label: "Scenario", icon: icons.Zap     },
  { id: "score",    label: "Score",    icon: icons.Star    },
  { id: "hidden",   label: "Hidden",   icon: icons.Eye     },
  { id: "claim",    label: "Predict",  icon: icons.Bot     },
  { id: "compare",  label: "Compare",  icon: icons.Compare },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [policyId, setPolicyId] = useState(null);
  const [policyInput, setPolicyInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  // States for each module
  const [uploadState, setUploadState] = useState({ loading: false, result: null });
  const [coverageState, setCoverageState] = useState({ loading: false, data: null });
  const [askState, setAskState] = useState({ loading: false, query: "", answer: null });
  const [scenarioState, setScenarioState] = useState({ loading: false, input: "", data: null });
  const [scoreState, setScoreState] = useState({ loading: false, data: null });
  const [hiddenState, setHiddenState] = useState({ loading: false, data: null });
  const [claimState, setClaimState] = useState({ loading: false, input: "", data: null });
  const [compareState, setCompareState] = useState({ loading: false, p1: "", p2: "", data: null });

  const scrollTo = (id) => {
    setActiveTab(id);
    const el = document.getElementById(`sec-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Upload
  const handleFile = async (file) => {
    if (!file) return;
    setUploadState({ loading: true, result: null });
    const fd = new FormData(); fd.append("file", file);
    const data = await api.upload(fd);
    if (data.policy_id) {
      setPolicyId(data.policy_id);
      setPolicyInput(String(data.policy_id));
    }
    setUploadState({ loading: false, result: data });
  };

  const handleSetPolicy = () => {
    if (policyInput) setPolicyId(policyInput);
  };

  // Coverage
  const getCoverage = async () => {
    if (!policyId) return alert("Set a policy ID first");
    setCoverageState({ loading: true, data: null });
    const data = await api.coverage(policyId);
    setCoverageState({ loading: false, data });
  };

  // Ask
  const doAsk = async () => {
    if (!policyId) return alert("Set a policy ID first");
    if (!askState.query) return;
    setAskState(s => ({ ...s, loading: true, answer: null }));
    const data = await api.ask(askState.query, policyId);
    setAskState(s => ({ ...s, loading: false, answer: data }));
  };

  // Scenario
  const doSimulate = async () => {
    if (!policyId) return alert("Set a policy ID first");
    if (!scenarioState.input) return;
    setScenarioState(s => ({ ...s, loading: true, data: null }));
    const data = await api.simulate(scenarioState.input, policyId);
    setScenarioState(s => ({ ...s, loading: false, data }));
  };

  // Score
  const doScore = async () => {
    if (!policyId) return alert("Set a policy ID first");
    setScoreState({ loading: true, data: null });
    const data = await api.score(policyId);
    setScoreState({ loading: false, data });
  };

  // Hidden
  const doHidden = async () => {
    if (!policyId) return alert("Set a policy ID first");
    setHiddenState({ loading: true, data: null });
    const data = await api.hidden(policyId);
    setHiddenState({ loading: false, data });
  };

  // Claim
  const doClaim = async () => {
    if (!policyId) return alert("Set a policy ID first");
    if (!claimState.input) return;
    setClaimState(s => ({ ...s, loading: true, data: null }));
    const data = await api.claim(claimState.input, policyId);
    setClaimState(s => ({ ...s, loading: false, data }));
  };

  // Compare
  const doCompare = async () => {
    if (!compareState.p1 || !compareState.p2) return;
    setCompareState(s => ({ ...s, loading: true, data: null }));
    const data = await api.compare(compareState.p1, compareState.p2);
    setCompareState(s => ({ ...s, loading: false, data }));
  };

  return (
    <>
      <GlobalStyle />
      <ParticleCanvas />

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <div style={{ marginBottom: 20 }}>{icons.Logo}</div>
        {TABS.map(t => (
          <div key={t.id}
            className={`tooltip-wrap`}
            style={{ position: "relative" }}
            onClick={() => scrollTo(t.id)}
          >
            <button
              style={{
                background: activeTab === t.id ? "rgba(154,111,46,0.12)" : "transparent",
                border: `1px solid ${activeTab === t.id ? "rgba(154,111,46,0.3)" : "transparent"}`,
                color: activeTab === t.id ? "var(--gold)" : "var(--text-3)",
                borderRadius: 10, width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s",
              }}
              title={t.label}
            >
              {t.icon}
            </button>
            <div className="tooltip-box" style={{ left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%) translateX(0)", bottom: "auto" }}>
              {t.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Wrap ── */}
      <div className="main-wrap" style={{ marginLeft: 72, minHeight: "100vh", position: "relative", zIndex: 1 }}>

        {/* ── Header / Hero ── */}
        <header style={{ padding: "60px 48px 50px", position: "relative", overflow: "hidden" }}>
          <div className="scanline" />
          <div style={{ maxWidth: 900 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ animation: "pulse-ring 2.5s ease-in-out infinite" }}>
                {icons.Logo}
              </div>
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700 }}>
                PolicyPilot — AI Insurance Platform
              </span>
            </div>
            <h1 className="animate-fade-up" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 18 }}>
              Navigate Your{" "}
              <span style={{
                background: "linear-gradient(135deg, #7a5520 0%, #9a6f2e 50%, #7a5520 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite",
              }}>
                Insurance Policy
              </span>
              <br />with Confidence
            </h1>
            <p className="animate-fade-up" style={{ animationDelay: "0.1s", color: "var(--text-2)", fontSize: "1.05rem", maxWidth: 560, lineHeight: 1.65 }}>
              Upload, analyse, and interrogate any insurance policy using advanced AI. Uncover hidden clauses, predict claim outcomes, and compare policies side-by-side.
            </p>

            {/* Stats row */}
            <div className="animate-fade-up" style={{ animationDelay: "0.2s", display: "flex", gap: 24, marginTop: 36, flexWrap: "wrap" }}>
              {[
                { v: "99.2%", l: "Accuracy" },
                { v: "< 3s",  l: "Response Time" },
                { v: "AI",    l: "Powered" },
              ].map(s => (
                <div key={s.l} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--gold)" }}>{s.v}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active policy pill */}
          {policyId && (
            <div style={{
              position: "absolute", top: 24, right: 32,
              background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)",
              borderRadius: 99, padding: "8px 18px",
              display: "flex", alignItems: "center", gap: 8,
              animation: "fadeIn 0.3s ease",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", animation: "pulse-ring 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "#15803d", letterSpacing: "0.06em" }}>
                Policy #{policyId} Active
              </span>
            </div>
          )}
        </header>

        {/* ── Top nav (horizontal) ── */}
        <div style={{ padding: "0 48px 32px" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => scrollTo(t.id)}
                className={`nav-item ${activeTab === t.id ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="divider" style={{ marginTop: 12, marginBottom: 0 }} />
        </div>

        {/* ── Sections ── */}
        <div style={{ padding: "0 48px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(480px,1fr))", gap: 24 }}>

          {/* ── 1. Upload & Set Policy ── */}
          <div id="sec-upload" style={{ gridColumn: "1/-1" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(400px,1fr))", gap: 24 }}>

              {/* Set Policy ID */}
              <Card label="Policy Management" title="Set Active Policy" delay={0.05}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 16 }}>
                  Enter an existing policy ID to activate it for all analyses below.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <input className="field" type="number" placeholder="e.g. 1"
                    value={policyInput} onChange={e => setPolicyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSetPolicy()}
                    style={{ flex: 1 }} />
                  <button className="btn-gold" onClick={handleSetPolicy}>
                    {icons.Check} Set
                  </button>
                </div>
                {policyId && (
                  <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, fontSize: "0.85rem", color: "#15803d", display: "flex", alignItems: "center", gap: 8 }}>
                    {icons.Check} Active: Policy #{policyId}
                  </div>
                )}
              </Card>

              {/* Upload PDF */}
              <Card label="Document Ingestion" title="Upload Policy PDF" delay={0.1}>
                <div
                  className={`file-drop ${dragging ? "dragging" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                >
                  <div className="float-anim" style={{ fontSize: "2rem", marginBottom: 10 }}>{icons.Upload}</div>
                  <p style={{ color: "var(--text-2)", fontSize: "0.9rem", marginBottom: 4 }}>Drop PDF here or click to browse</p>
                  <p style={{ color: "var(--text-3)", fontSize: "0.75rem" }}>Supports .pdf, .doc, .docx</p>
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                  onChange={e => handleFile(e.target.files[0])} />

                {uploadState.loading && <Spinner text="Uploading & indexing…" />}
                {uploadState.result && !uploadState.loading && (
                  <div style={{ marginTop: 14, padding: "12px 16px", background: uploadState.result.error ? "rgba(220,38,38,0.06)" : "rgba(154,111,46,0.07)", border: `1px solid ${uploadState.result.error ? "rgba(220,38,38,0.2)" : "rgba(154,111,46,0.2)"}`, borderRadius: 10, fontSize: "0.85rem", color: uploadState.result.error ? "#b91c1c" : "var(--gold)" }}>
                    {uploadState.result.error
                      ? `⚠ ${uploadState.result.error}`
                      : `✓ Uploaded — Policy ID: ${uploadState.result.policy_id}`}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* ── 2. Coverage Analysis ── */}
          <div id="sec-coverage" style={{ gridColumn: "1/-1" }}>
            <Card label="Risk Assessment" title="Coverage Analysis" delay={0.05}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 18 }}>
                Automatically extracts and categorises what your policy covers, excludes, and conditionally covers.
              </p>
              <button className="btn-gold" onClick={getCoverage} disabled={coverageState.loading}
                style={{ marginBottom: 20, opacity: coverageState.loading ? 0.6 : 1 }}>
                {coverageState.loading ? <><div className="spinner" /> Analysing…</> : <>{icons.Shield} Analyse Coverage</>}
              </button>

              {coverageState.loading && <Spinner text="Extracting coverage details…" />}

              {coverageState.data && !coverageState.loading && !coverageState.data.error && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
                  {[
                    { key: "covered",     label: "Covered",     cls: "tag-covered",   icon: "✓" },
                    { key: "not_covered", label: "Excluded",    cls: "tag-excluded",  icon: "✗" },
                    { key: "conditions",  label: "Conditional", cls: "tag-condition", icon: "~" },
                  ].map(col => (
                    coverageState.data[col.key]?.length > 0 && (
                      <div key={col.key} style={{ background: "#fafaf7", border: "1px solid rgba(154,111,46,0.12)", borderRadius: 12, padding: 16 }}>
                        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: col.key === "covered" ? "#15803d" : col.key === "not_covered" ? "#b91c1c" : "#b45309", marginBottom: 12 }}>
                          {col.label} ({coverageState.data[col.key].length})
                        </p>
                        {coverageState.data[col.key].map((item, i) => (
                          <span key={i} className={col.cls}>{col.icon} {item}</span>
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}
              {coverageState.data?.error && <p style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{coverageState.data.error}</p>}
            </Card>
          </div>

          {/* ── 3. Ask AI ── */}
          <div id="sec-ask">
            <Card label="Intelligent Q&A" title="Ask Your Policy" delay={0.05}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 18 }}>
                Ask any question in plain English about your policy terms, coverage limits, or procedures.
              </p>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input className="field" placeholder="e.g. What is my deductible for surgery?"
                  value={askState.query}
                  onChange={e => setAskState(s => ({ ...s, query: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && doAsk()}
                  style={{ flex: 1 }} />
                <button className="btn-gold" onClick={doAsk} disabled={askState.loading || !askState.query}>
                  {askState.loading ? <div className="spinner" /> : icons.Send}
                </button>
              </div>
              {askState.loading && <Spinner text="Querying policy…" />}
              {askState.answer && !askState.loading && (
                <div className="result-box" style={{ borderLeft: "3px solid var(--gold)" }}>
                  {askState.answer.error
                    ? <span style={{ color: "#b91c1c" }}>{askState.answer.error}</span>
                    : <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{askState.answer.answer}</p>}
                </div>
              )}
            </Card>
          </div>

          {/* ── 4. Scenario Simulator ── */}
          <div id="sec-scenario">
            <Card label="What-If Engine" title="Scenario Simulator" delay={0.08}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 18 }}>
                Describe a hypothetical incident and the AI will assess whether it would be covered.
              </p>
              <textarea className="field" rows={3}
                placeholder="e.g. My car was damaged in a hail storm while parked…"
                value={scenarioState.input}
                onChange={e => setScenarioState(s => ({ ...s, input: e.target.value }))}
                style={{ resize: "vertical", marginBottom: 12 }} />
              <button className="btn-gold" onClick={doSimulate} disabled={scenarioState.loading || !scenarioState.input} style={{ width: "100%", marginBottom: 16 }}>
                {scenarioState.loading ? <><div className="spinner" /> Simulating…</> : <>{icons.Zap} Run Simulation</>}
              </button>
              {scenarioState.loading && <Spinner text="Running scenario analysis…" />}
              {scenarioState.data && !scenarioState.loading && (
                <div>
                  {scenarioState.data.error
                    ? <p style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{scenarioState.data.error}</p>
                    : (
                      <>
                        <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 140, background: "rgba(154,111,46,0.06)", border: "1px solid rgba(154,111,46,0.15)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Decision</p>
                            <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--gold)", fontSize: "1.1rem" }}>{scenarioState.data.decision}</p>
                          </div>
                          <div style={{ flex: 1, minWidth: 140, background: "#fafaf7", border: "1px solid rgba(154,111,46,0.12)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Risk</p>
                            <span className={`badge-${(scenarioState.data.risk_level || "medium").toLowerCase()}`}>{scenarioState.data.risk_level || "Medium"}</span>
                          </div>
                        </div>
                        {scenarioState.data.reason && (
                          <div className="result-box">
                            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Reasoning</p>
                            <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{scenarioState.data.reason}</p>
                          </div>
                        )}
                      </>
                    )}
                </div>
              )}
            </Card>
          </div>

          {/* ── 5. Policy Score ── */}
          <div id="sec-score">
            <Card label="Quality Index" title="Policy Score" delay={0.05}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 18 }}>
                Comprehensive quality and value assessment with AI-generated pros &amp; cons.
              </p>
              <button className="btn-gold" onClick={doScore} disabled={scoreState.loading} style={{ width: "100%", marginBottom: 16 }}>
                {scoreState.loading ? <><div className="spinner" /> Evaluating…</> : <>{icons.Star} Calculate Score</>}
              </button>
              {scoreState.loading && <Spinner text="Calculating policy score…" />}
              {scoreState.data && !scoreState.loading && !scoreState.data.error && (
                <div style={{ textAlign: "center" }}>
                  <ScoreRing score={parseInt(scoreState.data.score) || 0} />
                  <p style={{ color: "var(--text-3)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Quality Score</p>
                  {scoreState.data.summary && (
                    <p style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.6, marginTop: 16, textAlign: "left" }}>{scoreState.data.summary}</p>
                  )}
                  <div style={{ marginTop: 16, display: "grid", gap: 10, textAlign: "left" }}>
                    {scoreState.data.pros?.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#22c55e", marginTop: 2, flexShrink: 0 }}>{icons.Check}</span>
                        <span style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>{p}</span>
                      </div>
                    ))}
                    {scoreState.data.cons?.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#ef4444", marginTop: 2, flexShrink: 0 }}>{icons.X}</span>
                        <span style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* ── 6. Hidden Clauses ── */}
          <div id="sec-hidden">
            <Card label="Risk Detection" title="Hidden Clauses" delay={0.08}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 18 }}>
                Scans for unusual, restrictive, or high-risk clauses buried in fine print.
              </p>
              <button className="btn-ghost" onClick={doHidden} disabled={hiddenState.loading} style={{ width: "100%", marginBottom: 16, borderColor: "rgba(245,158,11,0.3)", color: hiddenState.loading ? "var(--text-3)" : "#fcd34d" }}>
                {hiddenState.loading ? <><div className="spinner" /> Scanning…</> : <>{icons.Eye} Scan for Hidden Clauses</>}
              </button>
              {hiddenState.loading && <Spinner text="Deep-scanning policy clauses…" />}
              {hiddenState.data && !hiddenState.loading && (
                hiddenState.data.error
                  ? <p style={{ color: "#fca5a5", fontSize: "0.85rem" }}>{hiddenState.data.error}</p>
                  : (
                    <div>
                      {hiddenState.data.hidden_clauses?.map((clause, i) => {
                        const sev = hiddenState.data.severities?.[i] || "Medium";
                        return (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid var(--border-2)" }}>
                            <span style={{ marginTop: 2 }}>{icons.Warn}</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 6 }}>{clause}</p>
                              <span className={`badge-${sev.toLowerCase()}`}>{sev}</span>
                            </div>
                          </div>
                        );
                      })}
                      {hiddenState.data.risk_summary && (
                        <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10 }}>
                          <p style={{ fontSize: "0.75rem", color: "#fcd34d", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Risk Summary</p>
                          <p style={{ color: "var(--text-2)", fontSize: "0.85rem", lineHeight: 1.6 }}>{hiddenState.data.risk_summary}</p>
                        </div>
                      )}
                      {!hiddenState.data.hidden_clauses?.length && (
                        <div style={{ textAlign: "center", padding: "24px 0", color: "#86efac" }}>
                          {icons.Check}
                          <p style={{ marginTop: 8, fontSize: "0.9rem" }}>No hidden clauses detected — policy looks clean!</p>
                        </div>
                      )}
                    </div>
                  )
              )}
            </Card>
          </div>

          {/* ── 7. Claim Predictor ── */}
          <div id="sec-claim">
            <Card label="ML Prediction" title="Claim Approval Predictor" delay={0.05}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 18 }}>
                Machine learning model estimates the probability your claim will be approved.
              </p>
              <textarea className="field" rows={3}
                placeholder="Describe the claim in detail: incident type, amount, circumstances…"
                value={claimState.input}
                onChange={e => setClaimState(s => ({ ...s, input: e.target.value }))}
                style={{ resize: "vertical", marginBottom: 12 }} />
              <button className="btn-gold" onClick={doClaim} disabled={claimState.loading || !claimState.input} style={{ width: "100%", marginBottom: 16 }}>
                {claimState.loading ? <><div className="spinner" /> Predicting…</> : <>{icons.Bot} Predict Approval</>}
              </button>
              {claimState.loading && <Spinner text="Running ML model…" />}
              {claimState.data && !claimState.loading && !claimState.data.error && (() => {
                const prob = parseInt(claimState.data.approval_probability) || 0;
                const color = prob >= 70 ? "#22c55e" : prob >= 40 ? "#f59e0b" : "#ef4444";
                const gradients = prob >= 70
                  ? "linear-gradient(90deg, #16a34a, #22c55e)"
                  : prob >= 40
                    ? "linear-gradient(90deg, #d97706, #f59e0b)"
                    : "linear-gradient(90deg, #dc2626, #ef4444)";
                return (
                  <div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Approval Probability</span>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.5rem", color }}>{prob}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${prob}%`, background: gradients }} />
                      </div>
                    </div>
                    <div style={{ padding: "14px 16px", background: "rgba(201,168,76,0.06)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 14 }}>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Predicted Decision</p>
                      <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--gold-light)", fontSize: "1.05rem" }}>{claimState.data.decision}</p>
                    </div>
                    {claimState.data.factors?.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Contributing Factors</p>
                        {claimState.data.factors.map((f, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border-2)", color: "var(--text-2)", fontSize: "0.85rem" }}>
                            <span style={{ color: "var(--blue)" }}>→</span> {f}
                          </div>
                        ))}
                      </div>
                    )}
                    {claimState.data.explanation && (
                      <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10 }}>
                        <p style={{ color: "var(--text-2)", fontSize: "0.85rem", lineHeight: 1.6 }}>{claimState.data.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </Card>
          </div>

          {/* ── 8. Compare Policies ── */}
          <div id="sec-compare" style={{ gridColumn: "1/-1" }}>
            <Card label="Side-by-Side Analysis" title="Compare Policies" delay={0.05}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 20 }}>
                Enter two policy IDs for a comprehensive side-by-side comparison with a clear verdict.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 20, alignItems: "end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Policy 1</label>
                  <input className="field" type="number" placeholder="ID" value={compareState.p1} onChange={e => setCompareState(s => ({ ...s, p1: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Policy 2</label>
                  <input className="field" type="number" placeholder="ID" value={compareState.p2} onChange={e => setCompareState(s => ({ ...s, p2: e.target.value }))} />
                </div>
                <button className="btn-gold" onClick={doCompare} disabled={compareState.loading || !compareState.p1 || !compareState.p2}>
                  {compareState.loading ? <div className="spinner" /> : <>{icons.Compare} Compare</>}
                </button>
              </div>
              {compareState.loading && <Spinner text="Running deep comparison…" />}
              {compareState.data && !compareState.loading && (
                compareState.data.error
                  ? <p style={{ color: "#fca5a5", fontSize: "0.85rem" }}>{compareState.data.error}</p>
                  : (
                    <div>
                      {compareState.data.better_policy && (
                        <div style={{ marginBottom: 20, padding: "16px 20px", background: "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 14, display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>🏆</div>
                          <div>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Recommended</p>
                            <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--gold-light)", fontSize: "1.1rem" }}>Policy #{compareState.data.better_policy}</p>
                          </div>
                        </div>
                      )}
                      {compareState.data.verdict && (
                        <div className="result-box" style={{ marginBottom: 16, borderLeft: "3px solid var(--gold)" }}>
                          <p style={{ fontSize: "0.7rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Verdict</p>
                          <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{compareState.data.verdict}</p>
                        </div>
                      )}
                      {compareState.data.differences?.length > 0 && (
                        <div>
                          <p style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Key Differences</p>
                          <div style={{ display: "grid", gap: 8 }}>
                            {compareState.data.differences.map((d, i) => (
                              <div key={i} style={{ padding: "10px 14px", background: "rgba(4,8,15,0.4)", border: "1px solid var(--border-2)", borderRadius: 10, display: "flex", gap: 10, color: "var(--text-2)", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--indigo)", flexShrink: 0 }}>→</span> {d}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
              )}
            </Card>
          </div>

        </div>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid var(--border-2)", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {icons.Logo}
            <div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "var(--text-1)", fontSize: "0.95rem" }}>PolicyPilot</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>AI-Powered Insurance Intelligence</p>
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>© 2025 PolicyPilot — Powered by Advanced ML & RAG</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Upload", "Coverage", "Ask AI", "Compare"].map(l => (
              <span key={l} style={{ fontSize: "0.78rem", color: "var(--text-3)", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--gold)"}
                onMouseLeave={e => e.target.style.color = "var(--text-3)"}
              >{l}</span>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}