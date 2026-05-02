// Versify - Desktop app shell

function DesktopApp() {
  const [route, setRoute] = React.useState({ name: 'home' });
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0.34);

  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress(p => p >= 1 ? 0 : p + 0.003), 200);
    return () => clearInterval(t);
  }, [playing]);

  const open = poem => setRoute({ name: 'reader', poem });
  const nav = id => {
    if (id === 'home') setRoute({ name: 'home' });
    else if (id === 'compose') setRoute({ name: 'compose' });
    else setRoute({ name: id });
  };

  let content, label;
  if (route.name === 'home') { content = <DesktopHome onOpen={open} onCompose={() => setRoute({ name: 'compose' })} />; label = '01 Desktop · Home'; }
  else if (route.name === 'reader') { content = <DesktopReader poem={route.poem} onBack={() => setRoute({ name: 'home' })} />; label = '02 Desktop · Reader'; }
  else if (route.name === 'compose') { content = <DesktopCompose onCancel={() => setRoute({ name: 'home' })} />; label = '03 Desktop · Compose'; }
  else { content = <DesktopHome onOpen={open} onCompose={() => setRoute({ name: 'compose' })} />; label = '01 Desktop · Home'; }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface)', overflow: 'hidden' }} data-screen-label={label}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {route.name !== 'compose' && <NavRail active={route.name === 'reader' ? 'home' : route.name} onNav={nav} onCompose={() => setRoute({ name: 'compose' })} />}
        {content}
      </div>
      {route.name !== 'compose' && <NowPlayingBar poem={POEMS[0]} playing={playing} setPlaying={setPlaying} progress={progress} setProgress={setProgress} />}
    </div>
  );
}

function DesktopShowcase() {
  const [view, setView] = React.useState('canvas'); // canvas | live
  const [initialRoute, setInitialRoute] = React.useState('home');

  if (view === 'live') {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        <button onClick={() => setView('canvas')} style={{ position: 'absolute', top: 24, left: 24, zIndex: 100, background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>← All screens</button>
        <ChromeWindow tabs={[{ title: 'Versify' }]} url="versify.app/home" width={1280} height={820}>
          <DesktopAppAtRoute initial={initialRoute} />
        </ChromeWindow>
      </div>
    );
  }

  const frames = [
    { id: 'home', label: '01 Home · Discover', desc: 'Hero poem of the day with editor\'s note. Mood grid, follow feed, and recently published table.' },
    { id: 'reader', label: '02 Reading View', desc: 'Cinematic full-bleed cover, three-column layout: poet meta, editorial body, similar poems.' },
    { id: 'compose', label: '03 Compose', desc: 'Distraction-free writing canvas with backdrop preview behind, settings rail, live counters and haiku detection.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050505', padding: '64px 48px', color: '#fff' }}>
      <div style={{ marginBottom: 64, maxWidth: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ width: 32, height: 1, background: 'var(--primary)' }}></span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--primary)' }}>Versify · Desktop · 1280 wide</span>
        </div>
        <h1 className="font-headline" style={{ fontSize: 84, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.95, margin: 0 }}>
          Versify<span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>.</span><br/>Poems, in stereo.
        </h1>
        <p style={{ fontSize: 16, color: '#aaa', lineHeight: 1.55, margin: '24px 0 0', maxWidth: 620 }}>
          Same editorial voice — Spotify-grade left rail, persistent now-playing bar, magazine-style reading layout. Click a frame to open the live prototype.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button onClick={() => { setInitialRoute('home'); setView('live'); }} className="btn-primary" style={{ padding: '12px 24px' }}>▶ Open prototype</button>
          <a href="Versify.html" style={{ textDecoration: 'none' }}><button className="btn-ghost" style={{ padding: '12px 24px' }}>← Back to mobile version</button></a>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
        {frames.map((f, i) => (
          <div key={f.id}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
              <span className="font-headline" style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--primary)' }}>{String(i+1).padStart(2, '0')}</span>
              <h2 className="font-headline" style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>{f.label.replace(/^\d+\s/, '')}</h2>
            </div>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: '#888', maxWidth: 720, lineHeight: 1.55 }}>{f.desc}</p>
            <div onClick={() => { setInitialRoute(f.id); setView('live'); }} style={{ cursor: 'pointer', transition: 'transform 0.3s', maxWidth: 1280 }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <ChromeWindow tabs={[{ title: 'Versify' }]} url={'versify.app/' + f.id} width={1280} height={820}>
                <DesktopAppAtRoute initial={f.id} />
              </ChromeWindow>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 80, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', color: '#666', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
        Versify · Desktop · v1
      </div>
    </div>
  );
}

function DesktopAppAtRoute({ initial }) {
  // Mounts the app and forces an initial route via key reset.
  const [route, setRoute] = React.useState({ name: initial });
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0.34);

  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress(p => p >= 1 ? 0 : p + 0.003), 200);
    return () => clearInterval(t);
  }, [playing]);

  const open = poem => setRoute({ name: 'reader', poem });
  const nav = id => {
    if (id === 'home') setRoute({ name: 'home' });
    else if (id === 'compose') setRoute({ name: 'compose' });
    else setRoute({ name: id });
  };

  let content;
  if (route.name === 'home') content = <DesktopHome onOpen={open} onCompose={() => setRoute({ name: 'compose' })} />;
  else if (route.name === 'reader') content = <DesktopReader poem={route.poem || POEMS[0]} onBack={() => setRoute({ name: 'home' })} />;
  else if (route.name === 'compose') content = <DesktopCompose onCancel={() => setRoute({ name: 'home' })} />;

  // For the 'reader' preview frame on the canvas, auto-load a poem
  React.useEffect(() => {
    if (initial === 'reader' && !route.poem) setRoute({ name: 'reader', poem: POEMS[0] });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface)', overflow: 'hidden', color: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {route.name !== 'compose' && <NavRail active={route.name === 'reader' ? 'home' : route.name} onNav={nav} onCompose={() => setRoute({ name: 'compose' })} />}
        {content}
      </div>
      {route.name !== 'compose' && <NowPlayingBar poem={POEMS[0]} playing={playing} setPlaying={setPlaying} progress={progress} setProgress={setProgress} />}
    </div>
  );
}

// inject same fonts CSS as mobile (already loaded in head — but safe to repeat the helper rules)
const dsStyle = document.createElement('style');
dsStyle.textContent = `
:root {
  --surface: #0e0e0e;
  --surface-low: #181818;
  --surface-high: #232323;
  --on-surface: #f6f5f2;
  --on-surface-variant: #9a9a96;
  --primary: #57f47f;
  --primary-dim: #3ec96a;
  --primary-container: #0ec557;
  --on-primary: #003411;
  --tertiary: #88ebff;
  --error: #ff6b6b;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #050505; color: #f6f5f2; font-family: 'Manrope', sans-serif; }
.font-headline { font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 144, 'SOFT' 50; }
.font-body { font-family: 'Manrope', sans-serif; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
.material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
.chip { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,0.06); color: var(--on-surface-variant); font-size: 11px; font-weight: 600; letter-spacing: 0.04em; border: none; cursor: pointer; transition: all 0.15s; font-family: 'Manrope'; }
.chip.active { background: rgba(87,244,127,0.18); color: var(--primary); }
.chip:hover { background: rgba(255,255,255,0.1); }
.btn-primary { background: var(--primary); color: var(--on-primary); border: none; border-radius: 12px; padding: 12px 22px; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.02em; cursor: pointer; transition: transform 0.1s; }
.btn-primary:hover { transform: translateY(-1px); }
.btn-ghost { background: rgba(255,255,255,0.06); color: #fff; border: none; border-radius: 12px; padding: 12px 22px; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; }
.particle { position: absolute; border-radius: 50%; animation: float linear infinite; opacity: 0; pointer-events: none; }
@keyframes float { 0% { transform: translate(0, 0); opacity: 0; } 10%, 90% { opacity: 0.6; } 100% { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
.reveal-line { animation: revealLine 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
@keyframes revealLine { from { opacity: 0; transform: translateY(10px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
`;
document.head.appendChild(dsStyle);

ReactDOM.createRoot(document.getElementById('root')).render(<DesktopShowcase />);
