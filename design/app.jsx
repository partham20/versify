// Versify - main app shell

const FONTS_CSS = `
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
html, body { margin: 0; padding: 0; background: #000; color: var(--on-surface); font-family: 'Manrope', sans-serif; }
.font-headline { font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 144, 'SOFT' 50; }
.font-body { font-family: 'Manrope', sans-serif; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
.msf { font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }

.chip { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.06); color: var(--on-surface-variant); font-size: 11px; font-weight: 600; letter-spacing: 0.04em; border: none; cursor: pointer; transition: all 0.15s; }
.chip.active { background: rgba(87,244,127,0.18); color: var(--primary); }
.chip:hover { background: rgba(255,255,255,0.1); }
.btn-primary { background: var(--primary); color: var(--on-primary); border: none; border-radius: 14px; padding: 14px 24px; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.02em; cursor: pointer; transition: transform 0.1s; }
.btn-primary:hover { transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-ghost { background: rgba(255,255,255,0.06); color: #fff; border: none; border-radius: 14px; padding: 14px 24px; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; }
.glass { background: rgba(20,20,20,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }

.phone { width: 390px; height: 844px; background: #000; border-radius: 56px; padding: 11px; box-shadow: 0 0 0 2px #1f1f1f, 0 60px 120px -30px rgba(0,0,0,0.6); position: relative; }
.phone-screen { width: 100%; height: 100%; background: var(--surface); border-radius: 46px; overflow: hidden; position: relative; }
.phone-island { position: absolute; top: 11px; left: 50%; transform: translateX(-50%); width: 124px; height: 35px; background: #000; border-radius: 999px; z-index: 100; }
.phone-status { position: absolute; top: 16px; left: 0; right: 0; padding: 0 36px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 700; color: #fff; z-index: 50; pointer-events: none; }
.phone-status > :first-child { padding-left: 12px; }
.phone-status > :last-child { padding-right: 12px; }
.phone-content { position: absolute; inset: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.phone-home { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 134px; height: 5px; background: rgba(255,255,255,0.4); border-radius: 999px; z-index: 110; pointer-events: none; }

.particle { position: absolute; border-radius: 50%; animation: float linear infinite; opacity: 0; pointer-events: none; }
@keyframes float {
  0% { transform: translate(0, 0); opacity: 0; }
  10%, 90% { opacity: 0.6; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}

.screen-in { animation: screenIn 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
@keyframes screenIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.reveal-line { animation: revealLine 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
@keyframes revealLine { from { opacity: 0; transform: translateY(10px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }

.rec-pulse { animation: recPulse 1.2s ease-in-out infinite; }
@keyframes recPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,107,0.5); } 50% { box-shadow: 0 0 0 14px rgba(255,107,107,0); } }

.canvas-bg { background: #050505; min-height: 100vh; padding: 80px 60px; }
.section-title { font-family: 'Fraunces', serif; font-size: 42px; font-weight: 800; letter-spacing: -0.025em; color: #fff; margin: 0 0 8px; }
.section-sub { font-size: 13px; color: #888; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; margin: 0 0 32px; }
.row { display: flex; gap: 60px; flex-wrap: wrap; margin-bottom: 100px; align-items: flex-start; }
.frame-label { font-family: 'Fraunces', serif; font-size: 18px; color: #ddd; margin: 24px 0 4px; font-weight: 700; }
.frame-desc { font-size: 12px; color: #777; max-width: 360px; line-height: 1.5; }
`;

function App() {
  const [route, setRoute] = React.useState({ name: 'home' });
  const [liked, setLiked] = React.useState({ p2: true, p4: true });
  const [bookmarked, setBookmarked] = React.useState({});
  const toggleLike = id => setLiked(l => ({ ...l, [id]: !l[id] }));
  const toggleBookmark = id => setBookmarked(b => ({ ...b, [id]: !b[id] }));

  const nav = id => {
    if (id === 'home') setRoute({ name: 'home' });
    else if (id === 'explore') setRoute({ name: 'explore' });
    else if (id === 'compose') setRoute({ name: 'compose' });
    else if (id === 'notif') setRoute({ name: 'notif' });
    else if (id === 'profile') setRoute({ name: 'profile' });
  };

  const open = poem => setRoute({ name: 'poem', poem });

  let screen, label;
  switch (route.name) {
    case 'onboarding': screen = <Onboarding onComplete={() => setRoute({ name: 'home' })} />; label = '00 Onboarding'; break;
    case 'home': screen = <HomeFeed onOpen={open} onNav={nav} liked={liked} toggleLike={toggleLike} />; label = '01 Home'; break;
    case 'poem': screen = <PoemView poem={route.poem} onBack={() => setRoute({ name: 'home' })} onNav={nav} liked={liked} toggleLike={toggleLike} bookmarked={bookmarked} toggleBookmark={toggleBookmark} onComments={() => setRoute({ name: 'comments', poem: route.poem })} />; label = '02 Poem'; break;
    case 'comments': screen = <CommentsView poem={route.poem} onBack={() => setRoute({ name: 'poem', poem: route.poem })} />; label = '03 Comments'; break;
    case 'compose': screen = <Compose onCancel={() => setRoute({ name: 'home' })} onPublish={() => setRoute({ name: 'home' })} />; label = '04 Compose'; break;
    case 'explore': screen = <Explore onOpen={open} onNav={nav} />; label = '05 Explore'; break;
    case 'profile': screen = <Profile onNav={nav} onOpen={open} />; label = '06 Profile'; break;
    case 'notif': screen = <Notifications onNav={nav} />; label = '07 Inbox'; break;
  }

  // Showcase view: static phone frames side-by-side
  const [view, setView] = React.useState('canvas'); // canvas | live

  if (view === 'live') {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        <button onClick={() => setView('canvas')} style={{ position: 'absolute', top: 24, left: 24, background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>← All Screens</button>
        <PhoneFrame screenLabel={label}>{screen}</PhoneFrame>
      </div>
    );
  }

  // Canvas view: a curated layout of frames
  const frames = [
    { name: 'onboarding', label: 'Onboarding · Welcome', desc: 'Editorial, three-step intro that sets the cinematic tone. Background changes per step.' },
    { name: 'home', label: 'Home · Daily Mix', desc: 'Poem of the day hero card, trending haikus rail, and feed from poets you follow.' },
    { name: 'poem', label: 'Reading View', desc: 'Cinematic full-bleed cover, line-by-line reveal animation, and a glass audio player for narrated poems.' },
    { name: 'compose', label: 'Compose · Step 1 Write', desc: 'Distraction-free canvas with a floating syllable counter and voice recording.' },
    { name: 'compose-2', label: 'Compose · Step 2 Backdrop', desc: 'Dress the poem: choose a backdrop and tags, with a live preview card.' },
    { name: 'compose-3', label: 'Compose · Step 3 Publish', desc: 'Final preview and visibility settings before publishing to Versify.' },
    { name: 'comments', label: 'Comments · Stanzas', desc: 'Conversational thread with a glassy floating composer.' },
    { name: 'explore', label: 'Search · Browse Moods', desc: 'Search by mood category, tag rails, and a featured poets carousel.' },
    { name: 'profile', label: 'Profile · Library', desc: 'Verified poet profile with featured masterpiece, drafts, and stats.' },
    { name: 'profile-2', label: 'Profile · Playlists', desc: 'Curated reading collections like Spotify-for-poetry.' },
    { name: 'notif', label: 'Inbox · Whispers Back', desc: 'Filtered notifications with kind-specific micro-icons.' },
  ];

  // pre-render each frame with its proper internal state
  const renderFrame = (name) => {
    if (name === 'onboarding') return <Onboarding onComplete={() => {}} />;
    if (name === 'home') return <HomeFeed onOpen={() => {}} onNav={() => {}} liked={liked} toggleLike={toggleLike} />;
    if (name === 'poem') return <PoemView poem={POEMS[0]} onBack={() => {}} onNav={() => {}} liked={liked} toggleLike={toggleLike} bookmarked={bookmarked} toggleBookmark={toggleBookmark} onComments={() => {}} />;
    if (name === 'compose') return <ComposeAtStep step={0} />;
    if (name === 'compose-2') return <ComposeAtStep step={1} />;
    if (name === 'compose-3') return <ComposeAtStep step={2} />;
    if (name === 'comments') return <CommentsView poem={POEMS[0]} onBack={() => {}} />;
    if (name === 'explore') return <Explore onOpen={() => {}} onNav={() => {}} />;
    if (name === 'profile') return <Profile onNav={() => {}} onOpen={() => {}} />;
    if (name === 'profile-2') return <ProfileAtTab tab="playlists" />;
    if (name === 'notif') return <Notifications onNav={() => {}} />;
  };

  return (
    <div className="canvas-bg">
      {/* Hero header */}
      <div style={{ marginBottom: 100, maxWidth: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ width: 32, height: 1, background: 'var(--primary)' }}></span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--primary)' }}>Hi-Fi Prototype · iOS</span>
        </div>
        <h1 className="font-headline" style={{ fontSize: 96, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.95, margin: 0, color: '#fff' }}>
          Versify<span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>.</span><br/>Poems, in stereo.
        </h1>
        <p style={{ fontSize: 17, color: '#aaa', lineHeight: 1.55, margin: '28px 0 0', maxWidth: 620 }}>
          A sanctuary for poets. Editorial typography meets a bioluminescent palette.
          Eleven cinematic screens covering reading, writing, listening, and the social rituals around poetry.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button onClick={() => { setRoute({ name: 'onboarding' }); setView('live'); }} className="btn-primary" style={{ padding: '14px 28px' }}>▶ Try the prototype</button>
          <button onClick={() => { setRoute({ name: 'home' }); setView('live'); }} className="btn-ghost" style={{ padding: '14px 28px' }}>Skip to home</button>
        </div>
      </div>

      {/* Frames in rows of 3 */}
      {chunk(frames, 3).map((row, ri) => (
        <div key={ri} className="row">
          {row.map(f => (
            <div key={f.name} style={{ flexShrink: 0 }}>
              <div onClick={() => {
                const realName = f.name.replace(/-\d$/, '');
                setRoute({ name: realName, poem: POEMS[0] }); setView('live');
              }} style={{ cursor: 'pointer', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <PhoneFrame screenLabel={f.label}>{renderFrame(f.name)}</PhoneFrame>
              </div>
              <p className="frame-label">{f.label}</p>
              <p className="frame-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      ))}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 40, color: '#666', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
        End of the canvas · Versify v1
      </div>
    </div>
  );
}

function chunk(arr, n) { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; }

// Helper wrappers that fast-forward to a specific internal state
function ComposeAtStep({ step }) {
  // Simulate Compose at a given step by mounting twice; cheaper to just clone w/ key trick
  const ref = React.useRef();
  React.useEffect(() => {
    // best-effort: click "Next" `step` times after mount
    if (!ref.current) return;
    const btns = ref.current.querySelectorAll('button');
  }, [step]);
  // Easier: render Compose but auto-advance via initialStep prop. We re-implement minimal versioned wrapper
  return <ComposeForcedStep step={step} />;
}

function ComposeForcedStep({ step }) {
  // wrap Compose by mounting and synchronously stepping forward via ref to setStep
  // Workaround: temporarily replace useState to capture & advance
  const Cmp = Compose;
  // Use key to fully reset; rely on auto-advance buttons we click after mount
  const containerRef = React.useRef();
  React.useEffect(() => {
    if (step === 0 || !containerRef.current) return;
    // Click the "Next" header button `step` times
    const tick = (n) => {
      if (n <= 0) return;
      // type some body text first so Next isn't disabled on step 0
      const ta = containerRef.current.querySelector('textarea');
      if (ta && !ta.value) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(ta, 'Silver moon hangs high,\nWhispers in the velvet dark,\nShadows dance alone.');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const titleInput = containerRef.current.querySelector('input');
      if (titleInput && !titleInput.value) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(titleInput, 'Silver Moon');
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      requestAnimationFrame(() => {
        const nextBtn = [...containerRef.current.querySelectorAll('button')].find(b => /next|publish/i.test(b.textContent || ''));
        if (nextBtn) nextBtn.click();
        setTimeout(() => tick(n - 1), 30);
      });
    };
    tick(step);
  }, [step]);
  return <div ref={containerRef} style={{ height: '100%' }}><Cmp onCancel={() => {}} onPublish={() => {}} /></div>;
}

function ProfileAtTab({ tab }) {
  const containerRef = React.useRef();
  React.useEffect(() => {
    if (!containerRef.current) return;
    setTimeout(() => {
      const btn = [...containerRef.current.querySelectorAll('button')].find(b => (b.textContent || '').trim().toLowerCase() === tab);
      if (btn) btn.click();
    }, 50);
  }, [tab]);
  return <div ref={containerRef} style={{ height: '100%' }}><Profile onNav={() => {}} onOpen={() => {}} /></div>;
}

const styleTag = document.createElement('style');
styleTag.textContent = FONTS_CSS;
document.head.appendChild(styleTag);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
