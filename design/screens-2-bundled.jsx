// Versify - Compose, Explore, Profile, Notifications

function Compose({ onCancel, onPublish }) {
  const [step, setStep] = React.useState(0); // 0 write, 1 backdrop+tags, 2 publish
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [recording, setRecording] = React.useState(false);
  const [recDuration, setRecDuration] = React.useState(0);
  const [backdrop, setBackdrop] = React.useState(0);
  const [visibility, setVisibility] = React.useState('public');
  const [tags, setTags] = React.useState(['Solitude']);
  const allTags = ['Love', 'Solitude', 'Nature', 'Urban', 'Memory', 'Night', 'Haiku', 'Ocean'];

  const lines = body.split('\n');
  const totalSyl = body.split(/\s+/).filter(Boolean).reduce((a, w) => a + Math.max(1, (w.match(/[aeiouy]+/gi) || []).length), 0);

  React.useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecDuration(d => d + 0.1), 100);
    return () => clearInterval(t);
  }, [recording]);

  const headerTitle = ['Write', 'Dress it', 'Publish'][step];

  return (
    <div className="screen-in" style={{ minHeight: '100%', position: 'relative', background: step === 1 ? `linear-gradient(180deg, rgba(14,14,14,0.4), rgba(14,14,14,0.85)), url(${BACKDROPS[backdrop]}) center/cover` : undefined, transition: 'background 0.5s' }}>
      <Particles count={6} />
      <div style={{ position: 'sticky', top: 0, zIndex: 30, padding: '60px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: step !== 1 ? 'linear-gradient(180deg, var(--surface) 80%, transparent)' : 'transparent' }}>
        <button onClick={step === 0 ? onCancel : () => setStep(step - 1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', width: 36, height: 36, borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={step === 0 ? 'close' : 'arrow_back_ios_new'} size={16} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Step {step + 1} of 3</p>
          <p className="font-headline" style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{headerTitle}</p>
        </div>
        <button onClick={() => step < 2 ? setStep(step + 1) : onPublish({ title, body, backdrop, visibility, tags })} disabled={step === 0 && !body.trim()} style={{ background: 'none', border: 'none', color: (step === 0 && !body.trim()) ? 'var(--on-surface-variant)' : 'var(--primary)', fontWeight: 700, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
          {step === 2 ? 'Publish' : 'Next'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, padding: '0 20px 16px' }}>
        {[0,1,2].map(i => <span key={i} style={{ flex: 1, height: 2, background: i <= step ? 'var(--primary)' : 'rgba(255,255,255,0.1)', borderRadius: 999, transition: 'all 0.3s' }}></span>)}
      </div>

      {step === 0 && (
        <div style={{ padding: '20px 28px 40px' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled" className="font-headline" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Begin your stanza…" className="font-body" autoFocus rows={14} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 19, lineHeight: 1.6, resize: 'none', fontFamily: 'Manrope', caretColor: 'var(--primary)' }} />

          {/* Live counter strip */}
          <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: 354, zIndex: 30 }}>
            <div className="glass" style={{ borderRadius: 22, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 18 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans' }}>{lines.length}</p>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Lines</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans' }}>{totalSyl}</p>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Syllables</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: totalSyl === 17 ? 'var(--primary)' : 'var(--on-surface-variant)', fontFamily: 'Plus Jakarta Sans' }}>{totalSyl === 17 ? '✓' : '17'}</p>
                  <p style={{ margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Haiku</p>
                </div>
              </div>
              <button onClick={() => setRecording(!recording)} className={recording ? 'rec-pulse' : ''} style={{ width: 40, height: 40, borderRadius: '50%', background: recording ? 'var(--error)' : 'var(--primary)', border: 'none', color: recording ? '#fff' : 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name={recording ? 'stop' : 'mic'} fill size={20} />
              </button>
            </div>
            {recording && (
              <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11, color: 'var(--error)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
                ● Recording {recDuration.toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ padding: '20px 24px 40px', position: 'relative', zIndex: 2 }}>
          {/* Live preview */}
          <div style={{ padding: 22, borderRadius: 22, background: 'rgba(14,14,14,0.55)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 28 }}>
            <h3 className="font-headline" style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{title || 'Untitled'}</h3>
            <p className="font-body" style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.55, color: 'var(--on-surface-variant)', whiteSpace: 'pre-wrap' }}>{body || 'Your verses will appear here…'}</p>
          </div>

          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Choose a backdrop</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
            {BACKDROPS.map((b, i) => (
              <button key={i} onClick={() => setBackdrop(i)} style={{ all: 'unset', cursor: 'pointer', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', position: 'relative', boxShadow: i === backdrop ? '0 0 0 2px var(--primary)' : 'none' }}>
                <img src={b} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {i === backdrop && <span style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={14} /></span>}
              </button>
            ))}
          </div>

          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Tags</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allTags.map(t => (
              <button key={t} onClick={() => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t])} className={'chip ' + (tags.includes(t) ? 'active' : '')}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ padding: '20px 24px 40px' }}>
          {/* Final preview card */}
          <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', aspectRatio: '4/5', marginBottom: 24 }}>
            <img src={BACKDROPS[backdrop]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85))' }}></div>
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tags.slice(0, 3).map(t => <span key={t} className="chip active" style={{ backdropFilter: 'blur(10px)' }}>{t}</span>)}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22 }}>
              <h2 className="font-headline" style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{title || 'Untitled'}</h2>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--on-surface-variant)', whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{body}</p>
            </div>
          </div>

          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Visibility</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {[
              { id: 'public', icon: 'public', label: 'Public to Versify', desc: 'Visible to all readers' },
              { id: 'followers', icon: 'group', label: 'Followers only', desc: 'Just the inner circle' },
              { id: 'draft', icon: 'edit_note', label: 'Save as draft', desc: 'Keep it private' },
            ].map(v => (
              <button key={v.id} onClick={() => setVisibility(v.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, background: visibility === v.id ? 'rgba(87,244,127,0.08)' : 'var(--surface-low)', boxShadow: visibility === v.id ? 'inset 0 0 0 1px rgba(87,244,127,0.3)' : 'none' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: visibility === v.id ? 'var(--primary)' : 'rgba(255,255,255,0.06)', color: visibility === v.id ? 'var(--on-primary)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={v.icon} size={20} />
                </span>
                <div style={{ flex: 1 }}>
                  <p className="font-headline" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{v.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--on-surface-variant)' }}>{v.desc}</p>
                </div>
                {visibility === v.id && <Icon name="check_circle" fill size={20} color="var(--primary)" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Explore({ onOpen, onNav }) {
  const [query, setQuery] = React.useState('');
  return (
    <div className="screen-in" style={{ paddingBottom: 120, position: 'relative' }}>
      <TopBar />
      <Particles count={6} />
      <div style={{ padding: '8px 20px 24px' }}>
        <h2 className="font-headline" style={{ margin: '0 0 18px', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>Search</h2>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={20} color="var(--on-surface-variant)" />
          <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', display: 'flex' }}><Icon name="search" size={20} /></span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="What poem speaks to you?" className="font-headline" style={{ width: '100%', background: 'var(--surface-high)', border: 'none', borderRadius: 16, padding: '16px 16px 16px 50px', color: '#fff', fontSize: 14, fontWeight: 600, outline: 'none' }} />
        </div>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <h3 className="font-headline" style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Browse moods</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {CATEGORIES.map(c => (
            <div key={c.name} style={{ position: 'relative', aspectRatio: '1', borderRadius: 18, overflow: 'hidden', background: c.grad, cursor: 'pointer' }}>
              <span className="font-headline" style={{ position: 'absolute', top: 16, left: 16, fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{c.name}</span>
              <img src={c.img} style={{ position: 'absolute', bottom: -10, right: -16, width: '70%', height: '70%', objectFit: 'cover', borderRadius: 12, transform: 'rotate(12deg)', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', opacity: 0.85 }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        <h3 className="font-headline" style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>Featured poets</h3>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {POEMS.map(p => (
            <button key={p.id + 'f'} onClick={() => onOpen(p)} style={{ all: 'unset', cursor: 'pointer', minWidth: 130, flexShrink: 0 }}>
              <div style={{ width: 130, height: 130, borderRadius: '50%', overflow: 'hidden', marginBottom: 10, position: 'relative' }}>
                <img src={p.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', bottom: 4, right: 4, width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="play_arrow" fill size={16} /></span>
              </div>
              <p className="font-headline" style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{p.author}</p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--on-surface-variant)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{p.handle}</p>
            </button>
          ))}
        </div>
      </div>
      <BottomNav active="explore" onNav={onNav} />
    </div>
  );
}

function Profile({ onNav, onOpen }) {
  const [tab, setTab] = React.useState('poems');
  return (
    <div className="screen-in" style={{ paddingBottom: 120, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360, background: 'radial-gradient(at 20% 0%, rgba(87,244,127,0.18), transparent 60%), radial-gradient(at 80% 0%, rgba(136,235,255,0.10), transparent 60%)' }}></div>
      <TopBar avatar={false} title="Profile" action={<button style={{ background: 'rgba(255,255,255,0.04)', border: 'none', width: 36, height: 36, borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="more_horiz" size={20} /></button>} />
      <Particles count={5} />

      {/* Header */}
      <div style={{ padding: '12px 24px 24px', position: 'relative', zIndex: 2 }}>
        <div style={{ width: 110, height: 110, borderRadius: 22, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <img src={window.__resources.img20} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18 }}>
          <Icon name="verified" fill size={14} color="var(--primary)" />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Verified Poet</span>
        </div>
        <h1 className="font-headline" style={{ margin: '6px 0 0', fontSize: 44, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.025em' }}>Elara<br/><span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Vance</span></h1>
        <p className="font-body" style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--on-surface-variant)', maxWidth: 280 }}>Writer of the in-between hours. Brooklyn → Lisbon. Currently working on <i>The Midnight Garden</i>.</p>

        <div style={{ display: 'flex', gap: 24, marginTop: 22 }}>
          {[['142', 'Poems'], ['12.8K', 'Followers'], ['492', 'Following']].map(([v, l], i) => (
            <div key={i}>
              <p className="font-headline" style={{ margin: 0, fontSize: 20, fontWeight: 800, color: i === 0 ? 'var(--primary)' : '#fff' }}>{v}</p>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{l}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button className="btn-primary" style={{ flex: 1 }}>Edit Profile</button>
          <button className="btn-ghost" style={{ width: 50, padding: 0, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ios_share" size={18} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {['poems', 'playlists', 'liked'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', padding: '10px 14px', color: tab === t ? '#fff' : 'var(--on-surface-variant)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer', position: 'relative' }}>
            {t}
            {tab === t && <span style={{ position: 'absolute', bottom: -1, left: 14, right: 14, height: 2, background: 'var(--primary)' }}></span>}
          </button>
        ))}
      </div>

      {tab === 'poems' && (
        <div style={{ padding: '20px' }}>
          {/* featured */}
          <div onClick={() => onOpen(POEMS[0])} style={{ cursor: 'pointer', position: 'relative', padding: 24, borderRadius: 22, background: 'var(--surface-low)', overflow: 'hidden', marginBottom: 14 }}>
            <Icon name="format_quote" fill size={120} color="rgba(255,255,255,0.04)" />
            <span style={{ position: 'absolute', top: 12, right: 12 }}><Icon name="format_quote" fill size={64} color="rgba(255,255,255,0.04)" /></span>
            <span style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--primary-dim)' }}>Masterpiece</span>
            <h3 className="font-headline" style={{ margin: '8px 0 12px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.015em', lineHeight: 1.1 }}>The Midnight Garden of Whispers</h3>
            <p className="font-body" style={{ margin: 0, fontSize: 13, lineHeight: 1.55, fontStyle: 'italic', color: 'var(--on-surface-variant)', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>In the silence of the velvet night, where the moonbeams weave a silver thread, I found the ghosts of blossoms past, rising from their earthen bed…</p>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>412 syllables · 4 min</span>
              <span style={{ display: 'flex', gap: 8, color: 'var(--primary)' }}><Icon name="favorite" fill size={16} /></span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[POEMS[1], POEMS[2]].map(p => (
              <div key={p.id} onClick={() => onOpen(p)} style={{ cursor: 'pointer', padding: 16, borderRadius: 18, background: 'var(--surface-high)' }}>
                <h4 className="font-headline" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{p.title}</h4>
                <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--on-surface-variant)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.excerpt}</p>
                <p style={{ margin: '12px 0 0', fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{p.publishedAt}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, padding: 16, borderRadius: 18, background: 'var(--surface-low)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(87,244,127,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="auto_stories" size={22} /></span>
            <div style={{ flex: 1 }}>
              <p className="font-headline" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Unpublished drafts</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--on-surface-variant)' }}>12 stanzas in progress</p>
            </div>
            <Icon name="arrow_forward_ios" size={14} color="var(--on-surface-variant)" />
          </div>
        </div>
      )}

      {tab === 'playlists' && (
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            { name: 'Rainy Day Sonnets', count: '18 poems · 42m', img: (window.__resources.img21) },
            { name: 'Midnight Monologues', count: '24 poems · 1h 12m', img: (window.__resources.img22) },
            { name: 'Classical Reimagined', count: '12 poems · 38m', img: (window.__resources.img23) },
            { name: 'Urban Solitude', count: '31 poems · 54m', img: (window.__resources.img19) },
          ].map(pl => (
            <div key={pl.name} style={{ cursor: 'pointer' }}>
              <div style={{ aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: 'var(--surface-high)' }}>
                <img src={pl.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p className="font-headline" style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700 }}>{pl.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{pl.count}</p>
            </div>
          ))}
          <div style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
            <Icon name="add_circle" size={32} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>New Playlist</span>
          </div>
        </div>
      )}

      {tab === 'liked' && (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {POEMS.map(p => (
            <div key={p.id + 'l'} onClick={() => onOpen(p)} style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><img src={p.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-headline" style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{p.title}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--on-surface-variant)' }}>{p.author}</p>
              </div>
              <Icon name="favorite" fill size={18} color="var(--primary)" />
            </div>
          ))}
        </div>
      )}
      <BottomNav active="profile" onNav={onNav} />
    </div>
  );
}

function Notifications({ onNav }) {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? NOTIFICATIONS : NOTIFICATIONS.filter(n => n.kind === filter);
  const iconMap = { like: ['favorite', 'var(--primary)'], follow: ['person_add', 'var(--tertiary)'], comment: ['chat_bubble', '#fff'], feature: ['workspace_premium', 'var(--primary)'], mention: ['alternate_email', 'var(--tertiary)'] };
  return (
    <div className="screen-in" style={{ paddingBottom: 120, position: 'relative' }}>
      <TopBar avatar={false} title="Inbox" action={<button style={{ background: 'rgba(255,255,255,0.04)', border: 'none', width: 36, height: 36, borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="settings" size={20} color="var(--primary)" /></button>} />
      <Particles count={5} />

      <div style={{ padding: '8px 20px 20px' }}>
        <h2 className="font-headline" style={{ margin: '0 0 18px', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Whispers <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>back</span>.
        </h2>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
          {[['all', 'All'], ['like', 'Likes'], ['comment', 'Replies'], ['follow', 'Follows'], ['mention', 'Mentions']].map(([id, l]) => (
            <button key={id} onClick={() => setFilter(id)} className={'chip ' + (filter === id ? 'active' : '')} style={{ flexShrink: 0 }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>This week</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(n => {
            const [ic, col] = iconMap[n.kind];
            return (
              <div key={n.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 12px', borderRadius: 16, cursor: 'pointer', background: n.id === 'n1' ? 'rgba(87,244,127,0.04)' : 'transparent' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {n.avatar ? (
                    <img src={n.avatar} style={{ width: 42, height: 42, borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary)' }}><Icon name="auto_awesome" fill size={20} /></div>
                  )}
                  <span style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={ic} fill={n.kind === 'like'} size={12} color={col} />
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-body" style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
                    <span className="font-headline" style={{ fontWeight: 700 }}>{n.actor}</span>
                    <span style={{ color: 'var(--on-surface-variant)' }}> {n.body} </span>
                    {n.target && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{n.target}</span>}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{n.time}</p>
                </div>
                {n.kind === 'follow' && <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 11 }}>Follow</button>}
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav active="notif" onNav={onNav} />
    </div>
  );
}

Object.assign(window, { Compose, Explore, Profile, Notifications });
