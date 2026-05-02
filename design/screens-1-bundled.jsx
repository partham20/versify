// Versify - Onboarding, Home, Reading, Comments

function Onboarding({ onComplete }) {
  const [step, setStep] = React.useState(0);
  const slides = [
    { tag: 'Welcome', title: ['A sanctuary', 'for ', { italic: 'verses' }, '.'], body: 'Read, write and listen to poetry crafted by a community of voices in the dark.' },
    { tag: 'Write', title: ['Words that ', { italic: 'breathe' }, '.'], body: 'A distraction-free canvas with syllable counters, voice recording and editorial backdrops.' },
    { tag: 'Listen', title: ['Hear the ', { italic: 'cadence' }, '.'], body: 'Every poem can be played back in its author\'s own voice. Build playlists, set the mood.' },
  ];
  const cur = slides[step];
  const covers = [
    (window.__resources.img2),
    (window.__resources.img4),
    (window.__resources.img8),
  ];
  return (
    <div style={{ position: 'relative', minHeight: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transition: 'background-image 0.8s' }}>
        <img src={covers[step]} key={step} className="screen-in" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,14,14,0.3) 0%, rgba(14,14,14,0.85) 60%, var(--surface) 100%)' }}></div>
      </div>
      <Particles count={10} />
      <div style={{ position: 'relative', zIndex: 2, padding: '80px 28px 40px', minHeight: 844, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-headline" style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Versify</span>
          <button onClick={onComplete} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Skip</button>
        </div>
        <div style={{ flex: 1 }}></div>
        <div className="screen-in" key={'s' + step}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 24, height: 1, background: 'var(--primary)' }}></span>
            <span className="font-headline" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--primary)' }}>{cur.tag}</span>
          </div>
          <h2 className="font-headline" style={{ margin: 0, fontSize: 48, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.02em' }}>
            {cur.title.map((t, i) => typeof t === 'string' ? <React.Fragment key={i}>{t}</React.Fragment> : <span key={i} style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{t.italic}</span>)}
          </h2>
          <p className="font-body" style={{ marginTop: 24, fontSize: 16, lineHeight: 1.6, color: 'var(--on-surface-variant)', maxWidth: 320 }}>{cur.body}</p>
        </div>
        <div style={{ display: 'flex', gap: 6, margin: '40px 0 28px' }}>
          {slides.map((_, i) => (
            <span key={i} style={{ height: 3, flex: i === step ? 2 : 1, background: i === step ? 'var(--primary)' : 'rgba(255,255,255,0.15)', borderRadius: 999, transition: 'all 0.3s' }}></span>
          ))}
        </div>
        <button className="btn-primary" onClick={() => step === slides.length - 1 ? onComplete() : setStep(step + 1)} style={{ width: '100%', padding: '16px 28px', fontSize: 15 }}>
          {step === slides.length - 1 ? 'Begin' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

function HomeFeed({ onOpen, onNav, liked, toggleLike }) {
  return (
    <div className="screen-in" style={{ paddingBottom: 120, position: 'relative' }}>
      <TopBar />
      <Particles count={8} />
      <div style={{ padding: '8px 20px 20px' }}>
        <div style={{ marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--primary)' }}>Tuesday · Poem of the Day</p>
        </div>
        <h2 className="font-headline" style={{ margin: '0 0 18px', fontSize: 32, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          Your Daily<br/><span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Mix</span>.
        </h2>

        {/* Hero card */}
        <button onClick={() => onOpen(POEMS[0])} style={{ all: 'unset', cursor: 'pointer', width: '100%', display: 'block' }}>
          <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', aspectRatio: '4/5', background: 'var(--surface-low)' }}>
            <img src={POEMS[0].cover} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85))' }}></div>
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6 }}>
              {POEMS[0].tags.map(t => <span key={t} className="chip active" style={{ backdropFilter: 'blur(10px)', background: 'rgba(87,244,127,0.18)' }}>{t}</span>)}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 }}>
              <h3 className="font-headline" style={{ margin: 0, fontSize: 36, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
                Neon<br/><span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Whispers</span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <img src={POEMS[0].avatar} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                <span className="font-headline" style={{ fontSize: 13, fontWeight: 700 }}>{POEMS[0].author}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></span>
                <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{POEMS[0].readTime}</span>
              </div>
            </div>
            <div style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(87,244,127,0.4)' }}>
              <Icon name="play_arrow" fill size={22} />
            </div>
          </div>
        </button>
      </div>

      {/* Trending haikus - horizontal */}
      <div style={{ padding: '24px 0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 20px 16px' }}>
          <h3 className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Trending haikus</h3>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer' }}>See all</button>
        </div>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 8px' }}>
          {[POEMS[3], POEMS[3], POEMS[3]].map((p, i) => (
            <div key={i} style={{ minWidth: 220, padding: 22, borderRadius: 24, background: 'var(--surface-low)', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(['Silver moon hangs high,', 'Whispers in the velvet dark,', 'Shadows dance alone.'])[i] || null}
                {p.body[0].map((line, j) => (
                  <p key={j} className="font-body reveal-line" style={{ margin: 0, fontSize: 15, lineHeight: 1.5, animationDelay: (j * 0.15) + 's' }}>{line}</p>
                ))}
              </div>
              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>@luna_poetica</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: i === 0 ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                  <Icon name="favorite" fill={i === 0} size={14} />
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{[1200, 842, 503][i]}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* From poets you follow */}
      <div style={{ padding: '24px 20px' }}>
        <h3 className="font-headline" style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>From poets you follow</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {[POEMS[1], POEMS[2]].map((p, i) => (
            <button key={p.id} onClick={() => onOpen(p)} style={{ all: 'unset', cursor: 'pointer', display: 'block' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 100, height: 132, borderRadius: 18, overflow: 'hidden', flexShrink: 0, background: 'var(--surface-high)' }}>
                  <img src={p.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--primary)' }}>{p.author}</span>
                  </div>
                  <h4 className="font-headline" style={{ margin: '4px 0 10px', fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.05 }}>{p.title}</h4>
                  <p className="font-body" style={{ margin: 0, fontSize: 13, fontStyle: 'italic', color: 'var(--on-surface-variant)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{p.excerpt}"</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <span onClick={(e) => { e.stopPropagation(); toggleLike(p.id); }} style={{ display: 'flex', alignItems: 'center', gap: 5, color: liked[p.id] ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                      <Icon name="favorite" fill={!!liked[p.id]} size={16} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{(p.likes + (liked[p.id] ? 1 : 0)).toLocaleString()}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--on-surface-variant)' }}>
                      <Icon name="chat_bubble" size={15} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{p.comments}</span>
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--on-surface-variant)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{p.readTime}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <BottomNav active="home" onNav={onNav} />
    </div>
  );
}

function PoemView({ poem, onBack, onNav, liked, toggleLike, bookmarked, toggleBookmark, onComments }) {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0.34);
  React.useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress(p => p >= 1 ? 0 : p + 0.005), 200);
    return () => clearInterval(t);
  }, [playing]);
  const isLiked = !!liked[poem.id];
  const isBook = !!bookmarked[poem.id];
  return (
    <div className="screen-in" style={{ position: 'relative', minHeight: '100%' }}>
      {/* Cover background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 480, overflow: 'hidden' }}>
        <img src={poem.cover} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,14,14,0.2) 0%, rgba(14,14,14,0.7) 50%, var(--surface) 95%)' }}></div>
      </div>
      <Particles count={6} />
      {/* Top nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '60px 20px 14px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(38,38,38,0.5)', backdropFilter: 'blur(20px)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="expand_more" size={22} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Now Reading</p>
          <p className="font-headline" style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Versify</p>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(38,38,38,0.5)', backdropFilter: 'blur(20px)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="more_horiz" size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '40px 28px 200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ width: 22, height: 1, background: 'var(--primary)' }}></span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--primary)' }}>{poem.tags.join(' · ')}</span>
        </div>
        <h1 className="font-headline" style={{ margin: 0, fontSize: 56, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.025em' }}>
          {poem.title.split(' ')[0]}<br/>
          <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{poem.title.split(' ').slice(1).join(' ')}</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <img src={poem.avatar} style={{ width: 36, height: 36, borderRadius: '50%', filter: 'grayscale(0.3) brightness(1.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <div>
            <p className="font-headline" style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{poem.author}</p>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Published {poem.publishedAt}</p>
          </div>
        </div>

        {/* Body */}
        <article style={{ marginTop: 50, display: 'flex', flexDirection: 'column', gap: 36 }}>
          {poem.body.map((stanza, i) => (
            <section key={i} style={{ paddingLeft: i === 1 ? 18 : 0, borderLeft: i === 1 ? '1px solid rgba(87,244,127,0.25)' : 'none', marginLeft: i === 1 ? -2 : 0 }}>
              {stanza.map((line, j) => (
                <p key={j} className="font-body reveal-line" style={{ margin: 0, fontSize: 19, lineHeight: 1.55, color: i === 1 ? '#fff' : 'var(--on-surface-variant)', animationDelay: (i * 0.5 + j * 0.1) + 's' }}>{line}</p>
              ))}
            </section>
          ))}
          <p className="font-body" style={{ margin: 0, fontSize: 14, fontStyle: 'italic', color: 'var(--on-surface-variant)', opacity: 0.5 }}>— The end of the beginning.</p>
        </article>

        {/* Reader stats */}
        <div style={{ marginTop: 48, padding: '20px 22px', borderRadius: 22, background: 'var(--surface-low)', display: 'flex', justifyContent: 'space-between' }}>
          {[
            { v: poem.readTime, l: 'Read time' },
            { v: poem.syllables, l: 'Syllables' },
            { v: '4.8', l: 'Mood · Wistful' }
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <p className="font-headline" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{s.v}</p>
              <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Interaction bar */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 22 }}>
            <button onClick={() => toggleLike(poem.id)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: isLiked ? 'var(--primary)' : '#fff', cursor: 'pointer' }}>
              <Icon name="favorite" fill={isLiked} size={22} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{(poem.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
            </button>
            <button onClick={onComments} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#fff', cursor: 'pointer' }}>
              <Icon name="chat_bubble" size={22} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{poem.comments}</span>
            </button>
            <button style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#fff', cursor: 'pointer' }}>
              <Icon name="ios_share" size={22} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Send</span>
            </button>
          </div>
          <button onClick={() => toggleBookmark(poem.id)} style={{ width: 50, height: 50, borderRadius: '50%', background: isBook ? 'var(--primary)' : '#fff', border: 'none', color: isBook ? 'var(--on-primary)' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="bookmark" fill={isBook} size={22} />
          </button>
        </div>
      </div>

      {/* Audio player */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 24, zIndex: 35 }}>
        <div className="glass" style={{ borderRadius: 22, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'relative', height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.1)', marginBottom: 14 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (progress * 100) + '%', background: 'var(--primary)', borderRadius: 999 }}></div>
            <div style={{ position: 'absolute', left: (progress * 100) + '%', top: '50%', transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff' }}></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary)' }}>
                <Icon name="graphic_eq" size={20} />
              </div>
              <div>
                <p className="font-headline" style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>Narrated by {poem.author.split(' ')[0]}</p>
                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--primary)' }}>Dolby Atmos</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 0 }}><Icon name="skip_previous" fill size={22} /></button>
              <button onClick={() => setPlaying(!playing)} style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name={playing ? 'pause' : 'play_arrow'} fill size={26} />
              </button>
              <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 0 }}><Icon name="skip_next" fill size={22} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentsView({ poem, onBack }) {
  const [text, setText] = React.useState('');
  const [comments, setComments] = React.useState(COMMENTS);
  const submit = () => {
    if (!text.trim()) return;
    setComments([{ id: 'c' + Date.now(), author: 'You', handle: '@you', avatar: (window.__resources.img13), time: 'now', body: text, likes: 0, replies: 0 }, ...comments]);
    setText('');
  };
  return (
    <div className="screen-in" style={{ minHeight: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, padding: '60px 20px 16px', background: 'linear-gradient(180deg, var(--surface) 80%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.04)', border: 'none', width: 36, height: 36, borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrow_back_ios_new" size={16} /></button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>{comments.length} stanzas of conversation</p>
          <p className="font-headline" style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{poem.title}</p>
        </div>
        <span style={{ width: 36 }}></span>
      </div>

      <div style={{ flex: 1, padding: '12px 20px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 12 }}>
            <img src={c.avatar} style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="font-headline" style={{ fontSize: 13, fontWeight: 700 }}>{c.author}</span>
                <span style={{ fontSize: 10, color: 'var(--on-surface-variant)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{c.time}</span>
              </div>
              <p className="font-body" style={{ margin: '6px 0 8px', fontSize: 14, lineHeight: 1.5, color: 'var(--on-surface)' }}>{c.body}</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--on-surface-variant)' }}><Icon name="favorite" size={13} />{c.likes}</span>
                <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', cursor: 'pointer' }}>Reply</span>
                {c.replies > 0 && <span style={{ fontSize: 11, color: 'var(--primary)' }}>{c.replies} replies →</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 12, right: 12, bottom: 24, zIndex: 30 }}>
        <div className="glass" style={{ borderRadius: 999, padding: 6, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          <img src={window.__resources.img13} style={{ width: 32, height: 32, borderRadius: '50%' }} />
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Add a stanza of thought…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: 'Manrope', fontSize: 14 }} />
          <button onClick={submit} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: text.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.06)', color: text.trim() ? 'var(--on-primary)' : 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
            <Icon name="arrow_upward" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding, HomeFeed, PoemView, CommentsView });
