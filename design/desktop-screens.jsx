// Versify - Desktop screens (uses POEMS, COMMENTS, NOTIFICATIONS, CATEGORIES, BACKDROPS, Icon, Particles from data.jsx)

function NavRail({ active, onNav, onCompose }) {
  const items = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'explore', label: 'Search', icon: 'search' },
    { id: 'inbox', label: 'Inbox', icon: 'notifications' },
    { id: 'library', label: 'Library', icon: 'library_books' },
  ];
  const playlists = [
    { name: 'Rainy Day Sonnets', count: 18 },
    { name: 'Midnight Monologues', count: 24 },
    { name: 'Classical Reimagined', count: 12 },
    { name: 'Urban Solitude', count: 31 },
    { name: 'Drafts', count: 12, ghost: true },
  ];
  return (
    <aside style={{ width: 260, height: '100%', background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 22px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary)' }}>
          <Icon name="auto_stories" fill size={18} />
        </div>
        <div>
          <p className="font-headline" style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>Versify<span style={{ color: 'var(--primary)' }}>.</span></p>
          <p style={{ margin: '2px 0 0', fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Poems, in stereo</p>
        </div>
      </div>

      <button onClick={onCompose} style={{ margin: '8px 18px 18px', padding: '12px 16px', borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', color: 'var(--on-primary)', border: 'none', fontFamily: 'Manrope', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(87,244,127,0.25)' }}>
        <Icon name="edit_note" size={20} /> Begin a stanza
      </button>

      <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <button key={it.id} onClick={() => onNav(it.id)} style={{ all: 'unset', cursor: 'pointer', padding: '10px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, color: active === it.id ? '#fff' : 'var(--on-surface-variant)', background: active === it.id ? 'rgba(87,244,127,0.08)' : 'transparent', fontWeight: active === it.id ? 700 : 500, fontSize: 13 }}>
            <Icon name={it.icon} fill={active === it.id} size={20} color={active === it.id ? 'var(--primary)' : 'var(--on-surface-variant)'} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ margin: '24px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Your Playlists</span>
        <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex' }}><Icon name="add" size={16} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }} className="no-scrollbar">
        {playlists.map(p => (
          <button key={p.name} style={{ all: 'unset', cursor: 'pointer', padding: '8px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, width: 'calc(100% - 20px)' }}>
            <span style={{ width: 32, height: 32, borderRadius: 6, background: p.ghost ? 'rgba(255,255,255,0.04)' : 'var(--surface-high)', border: p.ghost ? '1px dashed rgba(255,255,255,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}>
              <Icon name={p.ghost ? 'edit_note' : 'queue_music'} size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: 'var(--on-surface-variant)' }}>{p.count} poems</p>
            </div>
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" style={{ width: 32, height: 32, borderRadius: '50%' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>Elara Vance</p>
          <p style={{ margin: 0, fontSize: 10, color: 'var(--on-surface-variant)' }}>@elara · Verified</p>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex' }}><Icon name="settings" size={18} /></button>
      </div>
    </aside>
  );
}

function NowPlayingBar({ poem, playing, setPlaying, progress, setProgress }) {
  return (
    <div style={{ height: 78, background: '#070707', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 24, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 280, flexShrink: 0 }}>
        <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <img src={poem.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="font-headline" style={{ margin: 0, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{poem.title}</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--on-surface-variant)' }}>{poem.author}</p>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex' }}><Icon name="favorite" fill size={16} /></button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex' }}><Icon name="shuffle" size={18} /></button>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><Icon name="skip_previous" fill size={20} /></button>
          <button onClick={() => setPlaying(!playing)} style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={playing ? 'pause' : 'play_arrow'} fill size={22} />
          </button>
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><Icon name="skip_next" fill size={20} /></button>
          <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex' }}><Icon name="repeat" size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <span style={{ fontSize: 10, color: 'var(--on-surface-variant)', minWidth: 32, textAlign: 'right', fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>1:12</span>
          <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (progress * 100) + '%', background: 'var(--primary)', borderRadius: 999 }}></div>
            <div style={{ position: 'absolute', left: (progress * 100) + '%', top: '50%', transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff' }}></div>
          </div>
          <span style={{ fontSize: 10, color: 'var(--on-surface-variant)', minWidth: 32, fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>3:24</span>
        </div>
      </div>

      <div style={{ width: 280, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexShrink: 0 }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex' }}><Icon name="lyrics" size={18} /></button>
        <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex' }}><Icon name="queue_music" size={18} /></button>
        <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex' }}><Icon name="volume_up" size={18} /></button>
        <div style={{ width: 80, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%', background: '#fff', borderRadius: 999 }}></div>
        </div>
      </div>
    </div>
  );
}

function DesktopHome({ onOpen, onCompose }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="no-scrollbar">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 520, background: 'radial-gradient(at 30% 0%, rgba(87,244,127,0.12), transparent 60%), radial-gradient(at 80% 0%, rgba(136,235,255,0.08), transparent 60%)', pointerEvents: 'none' }}></div>
      <Particles count={10} />

      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(180deg, rgba(14,14,14,0.95) 70%, transparent)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrow_back_ios_new" size={14} /></button>
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrow_forward_ios" size={14} /></button>
        </div>
        <div style={{ position: 'relative', width: 360 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', display: 'flex' }}><Icon name="search" size={18} /></span>
          <input placeholder="What poem speaks to you?" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 999, padding: '10px 16px 10px 44px', color: '#fff', fontSize: 13, fontFamily: 'Manrope', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 999, padding: '8px 16px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="workspace_premium" fill size={14} color="var(--primary)" /> Premium
          </button>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '20px 40px 40px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ width: 28, height: 1, background: 'var(--primary)' }}></span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--primary)' }}>Tuesday · Poem of the Day</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'stretch' }}>
          {/* Hero card left */}
          <div onClick={() => onOpen(POEMS[0])} style={{ cursor: 'pointer', position: 'relative', borderRadius: 24, overflow: 'hidden', minHeight: 360, background: 'var(--surface-low)' }}>
            <img src={POEMS[0].cover} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, transparent 50%, rgba(0,0,0,0.85) 100%)' }}></div>
            <div style={{ position: 'absolute', inset: 0, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {POEMS[0].tags.map(t => <span key={t} className="chip active" style={{ backdropFilter: 'blur(10px)' }}>{t}</span>)}
              </div>
              <div>
                <h2 className="font-headline" style={{ margin: 0, fontSize: 64, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.025em' }}>
                  Neon<br/><span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Whispers</span>
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
                  <img src={POEMS[0].avatar} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  <div>
                    <p className="font-headline" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{POEMS[0].author}</p>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{POEMS[0].readTime} · {POEMS[0].syllables} syllables</p>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(87,244,127,0.4)' }}><Icon name="play_arrow" fill size={28} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - editor's note + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 28, borderRadius: 24, background: 'linear-gradient(135deg, rgba(87,244,127,0.08), transparent)', border: '1px solid rgba(87,244,127,0.15)', flex: 1, position: 'relative', overflow: 'hidden' }}>
              <Icon name="format_quote" fill size={140} color="rgba(87,244,127,0.05)" />
              <span style={{ position: 'absolute', top: 12, right: 14 }}><Icon name="format_quote" fill size={64} color="rgba(87,244,127,0.06)" /></span>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--primary)' }}>Editor's note</p>
              <p className="font-headline" style={{ margin: '14px 0 0', fontSize: 19, fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.005em', fontStyle: 'italic' }}>"Vanes treats the city as a living organism — every line breathes. Read this aloud at dusk."</p>
              <p style={{ margin: '16px 0 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>— Sora Ito, Editor</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[['2.4K', 'Likes today'], ['18m', 'In playlists'], ['4.8', 'Mood · Wistful']].map(([v, l]) => (
                <div key={l} style={{ padding: 16, borderRadius: 16, background: 'var(--surface-low)' }}>
                  <p className="font-headline" style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{v}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse moods */}
      <section style={{ padding: '20px 40px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 className="font-headline" style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Browse <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>moods</span></h3>
          <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}>Show all →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {CATEGORIES.map(c => (
            <div key={c.name} style={{ position: 'relative', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', background: c.grad, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <span className="font-headline" style={{ position: 'absolute', top: 14, left: 14, fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{c.name}</span>
              <img src={c.img} style={{ position: 'absolute', bottom: -12, right: -16, width: '70%', height: '70%', objectFit: 'cover', borderRadius: 10, transform: 'rotate(15deg)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', opacity: 0.85 }} />
            </div>
          ))}
        </div>
      </section>

      {/* From poets you follow */}
      <section style={{ padding: '20px 40px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 className="font-headline" style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>From poets you <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>follow</span></h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {POEMS.map(p => (
            <button key={p.id} onClick={() => onOpen(p)} style={{ all: 'unset', cursor: 'pointer', padding: 18, borderRadius: 18, background: 'var(--surface-low)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-high)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-low)'}>
              <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                <img src={p.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', bottom: 8, right: 8, width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(87,244,127,0.3)' }}>
                  <Icon name="play_arrow" fill size={20} />
                </span>
              </div>
              <h4 className="font-headline" style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.title}</h4>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--on-surface-variant)' }}>{p.author}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Recently published */}
      <section style={{ padding: '20px 40px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 className="font-headline" style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Recently <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>published</span></h3>
        </div>
        <div style={{ background: 'var(--surface-low)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 1fr 80px 60px', padding: '12px 20px', fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span>#</span><span>Title</span><span>Author</span><span>Tags</span><span style={{ textAlign: 'right' }}>Read</span><span></span>
          </div>
          {POEMS.map((p, i) => (
            <div key={p.id + 'r'} onClick={() => onOpen(p)} style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 1fr 80px 60px', padding: '14px 20px', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s', borderBottom: i < POEMS.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontFamily: 'Plus Jakarta Sans' }}>{String(i+1).padStart(2, '0')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}><img src={p.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div>
                  <p className="font-headline" style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{p.title}</p>
                  <p style={{ margin: 0, fontSize: 10, color: 'var(--on-surface-variant)' }}>{p.publishedAt}</p>
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{p.author}</span>
              <div style={{ display: 'flex', gap: 4 }}>{p.tags.map(t => <span key={t} className="chip" style={{ fontSize: 10, padding: '3px 8px' }}>{t}</span>)}</div>
              <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', textAlign: 'right', fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>{p.readTime}</span>
              <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', justifySelf: 'end' }}><Icon name="favorite" size={16} /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DesktopReader({ poem, onBack }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', position: 'relative', background: '#0c0c0c' }} className="no-scrollbar">
      {/* Top hero */}
      <div style={{ position: 'relative', height: 420 }}>
        <img src={poem.cover} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,12,12,0.4) 0%, rgba(12,12,12,0.85) 70%, #0c0c0c 100%)' }}></div>
        <Particles count={8} />
        <header style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: 999, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(10px)' }}>
            <Icon name="arrow_back_ios_new" size={14} /> Back to feed
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="ios_share" size={14} /> Share</button>
            <button style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="bookmark" size={14} /> Save</button>
          </div>
        </header>
        <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 28, height: 1, background: 'var(--primary)' }}></span>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--primary)' }}>{poem.tags.join(' · ')}</span>
          </div>
          <h1 className="font-headline" style={{ margin: 0, fontSize: 96, fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.03em' }}>
            {poem.title.split(' ')[0]} <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{poem.title.split(' ').slice(1).join(' ')}</span>
          </h1>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 280px', gap: 48, padding: '48px 40px 80px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Left meta */}
        <aside style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <img src={poem.avatar} style={{ width: 64, height: 64, borderRadius: '50%' }} />
            <div>
              <p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{poem.author}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--on-surface-variant)' }}>{poem.handle}</p>
              <button className="btn-primary" style={{ marginTop: 10, padding: '6px 14px', fontSize: 11 }}>Follow</button>
            </div>
          </div>
          <div style={{ padding: 18, borderRadius: 16, background: 'var(--surface-low)' }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>About this poem</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
              <div><p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{poem.readTime}</p><p style={{ margin: 0, fontSize: 9, color: 'var(--on-surface-variant)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Read</p></div>
              <div><p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{poem.syllables}</p><p style={{ margin: 0, fontSize: 9, color: 'var(--on-surface-variant)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Syllables</p></div>
              <div><p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{poem.likes.toLocaleString()}</p><p style={{ margin: 0, fontSize: 9, color: 'var(--on-surface-variant)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Likes</p></div>
              <div><p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{poem.comments}</p><p style={{ margin: 0, fontSize: 9, color: 'var(--on-surface-variant)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Echoes</p></div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ flex: 1, padding: 12, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="favorite" size={16} /> Like</button>
            <button className="btn-ghost" style={{ flex: 1, padding: 12, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="playlist_add" size={16} /> Add to</button>
          </div>
        </aside>

        {/* Center: poem body */}
        <article style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
          {poem.body.map((stanza, i) => (
            <section key={i} style={{ marginBottom: 44, paddingLeft: i === 1 ? 24 : 0, borderLeft: i === 1 ? '1px solid rgba(87,244,127,0.25)' : 'none' }}>
              {stanza.map((line, j) => (
                <p key={j} className="font-body reveal-line" style={{ margin: 0, fontSize: 24, lineHeight: 1.55, color: i === 1 ? '#fff' : 'var(--on-surface-variant)', letterSpacing: '-0.005em', fontWeight: 400, animationDelay: (i * 0.4 + j * 0.08) + 's' }}>{line}</p>
              ))}
            </section>
          ))}
          <p className="font-body" style={{ margin: '40px 0 0', fontSize: 14, fontStyle: 'italic', color: 'var(--on-surface-variant)', opacity: 0.5 }}>— The end of the beginning.</p>

          {/* Comments preview */}
          <div style={{ marginTop: 64, paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22 }}>
              <h3 className="font-headline" style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{poem.comments} <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>echoes</span></h3>
              <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}>Most loved →</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, background: 'var(--surface-low)', marginBottom: 24 }}>
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <input placeholder="Add a stanza of thought…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, fontFamily: 'Manrope' }} />
              <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrow_upward" size={16} /></button>
            </div>
            {COMMENTS.slice(0, 3).map(c => (
              <div key={c.id + 'd'} style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
                <img src={c.avatar} style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="font-headline" style={{ fontSize: 13, fontWeight: 700 }}>{c.author}</span>
                    <span style={{ fontSize: 10, color: 'var(--on-surface-variant)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{c.time}</span>
                  </div>
                  <p className="font-body" style={{ margin: '6px 0 8px', fontSize: 14, lineHeight: 1.5 }}>{c.body}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--on-surface-variant)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="favorite" size={13} /> {c.likes}</span>
                    <span style={{ cursor: 'pointer' }}>Reply</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Right rail: similar poems */}
        <aside style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
          <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>If you liked this</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {POEMS.slice(1).map(p => (
              <div key={p.id + 'sim'} style={{ display: 'flex', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><img src={p.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-headline" style={{ margin: 0, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--on-surface-variant)' }}>{p.author}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--primary)' }}>{p.readTime}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DesktopCompose({ onCancel }) {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [backdrop, setBackdrop] = React.useState(0);
  const [tags, setTags] = React.useState(['Solitude']);
  const allTags = ['Love', 'Solitude', 'Nature', 'Urban', 'Memory', 'Night', 'Haiku', 'Ocean'];
  const lines = body.split('\n');
  const totalSyl = body.split(/\s+/).filter(Boolean).reduce((a, w) => a + Math.max(1, (w.match(/[aeiouy]+/gi) || []).length), 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: `linear-gradient(180deg, rgba(12,12,12,0.4), rgba(12,12,12,0.92)), url(${BACKDROPS[backdrop]}) center/cover fixed`, transition: 'background 0.5s' }}>
      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(12,12,12,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', borderRadius: 999, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}><Icon name="close" size={16} /> Discard</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(87,244,127,0.08)', color: 'var(--primary)', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>● Auto-saved</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ padding: '10px 18px', fontSize: 12 }}>Save draft</button>
          <button className="btn-primary" style={{ padding: '10px 18px', fontSize: 12 }}>Publish to Versify</button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
        {/* Left: writing canvas */}
        <div style={{ overflowY: 'auto', padding: '60px 80px 100px' }} className="no-scrollbar">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ width: 24, height: 1, background: 'var(--primary)' }}></span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--primary)' }}>New poem · Untitled draft</span>
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled" className="font-headline" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 64, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 28, lineHeight: 1 }} />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Begin your stanza…" className="font-body" rows={20} autoFocus style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 22, lineHeight: 1.55, resize: 'none', fontFamily: 'Manrope', caretColor: 'var(--primary)' }} />
          </div>
        </div>

        {/* Right: settings panel */}
        <aside style={{ background: 'rgba(8,8,8,0.7)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.04)', overflowY: 'auto', padding: '32px 24px' }} className="no-scrollbar">
          <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Live counters</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 28 }}>
            <div style={{ padding: 12, borderRadius: 10, background: 'var(--surface-low)' }}>
              <p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{lines.length}</p>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Lines</p>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: 'var(--surface-low)' }}>
              <p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{totalSyl}</p>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Syllables</p>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: totalSyl === 17 ? 'rgba(87,244,127,0.1)' : 'var(--surface-low)' }}>
              <p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: totalSyl === 17 ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{totalSyl === 17 ? '✓' : '17'}</p>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Haiku</p>
            </div>
          </div>

          <button style={{ width: '100%', padding: 14, borderRadius: 12, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Manrope', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>
            <Icon name="mic" fill size={16} /> Record narration
          </button>

          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Backdrop</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 28 }}>
            {BACKDROPS.map((b, i) => (
              <button key={i} onClick={() => setBackdrop(i)} style={{ all: 'unset', cursor: 'pointer', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', position: 'relative', boxShadow: i === backdrop ? '0 0 0 2px var(--primary)' : 'none' }}>
                <img src={b} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Tags</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
            {allTags.map(t => (
              <button key={t} onClick={() => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t])} className={'chip ' + (tags.includes(t) ? 'active' : '')}>{t}</button>
            ))}
          </div>

          <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Visibility</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['public', 'public', 'Public to Versify'], ['group', 'followers', 'Followers only'], ['edit_note', 'draft', 'Save as draft']].map(([ic, id, l], i) => (
              <button key={id} style={{ all: 'unset', cursor: 'pointer', padding: 12, borderRadius: 10, background: i === 0 ? 'rgba(87,244,127,0.08)' : 'transparent', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#fff' }}>
                <Icon name={ic} size={16} color={i === 0 ? 'var(--primary)' : 'var(--on-surface-variant)'} /> {l}
                {i === 0 && <Icon name="check" size={14} color="var(--primary)" />}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { NavRail, NowPlayingBar, DesktopHome, DesktopReader, DesktopCompose });
