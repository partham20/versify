// Versify - shared data + small components

const POEMS = [
  {
    id: 'p1',
    title: 'Neon Whispers',
    author: 'Julian Vanes',
    handle: '@julian.v',
    avatar: (window.__resources.img1),
    cover: (window.__resources.img2),
    tags: ['Nature', 'Solitude'],
    readTime: '3 min',
    syllables: 142,
    likes: 2400,
    comments: 128,
    publishedAt: '12 Oct',
    excerpt: 'The city breathes in pulses of emerald light, a rhythmic thrum beneath the concrete skin...',
    body: [
      ['The city breathes in pulses of emerald light,', 'A rhythmic thrum beneath the concrete skin.', 'We are but echoes in the throat of the night,', 'Waiting for the silence to begin.'],
      ['Shadows stretch like ink on a velvet floor,', 'Mapping out the paths we failed to take.', 'Every open window, every locked door,', 'Is a promise we were meant to break.'],
      ['Listen to the hum of the electric wire,', 'Tracing patterns in the smog-thick air.', 'The heart is just a flickering, low-burning fire,', "Searching for a ghost that isn't there."]
    ]
  },
  {
    id: 'p2',
    title: 'Geometric Solace',
    author: 'Elias Thorne',
    handle: '@elias.t',
    avatar: (window.__resources.img3),
    cover: (window.__resources.img4),
    tags: ['Urban', 'Brutalism'],
    readTime: '4 min',
    syllables: 188,
    likes: 1820,
    comments: 94,
    publishedAt: '08 Oct',
    excerpt: 'The concrete does not ask for forgiveness, it simply stands, a brutalist anchor in a fluid world...',
    body: [
      ['The concrete does not ask for forgiveness,', 'it simply stands, a brutalist anchor', 'in a fluid world of soft excuses.'],
      ['We find our edges where the light breaks', 'against the stone. There is a kind of peace', 'in straight lines the wind cannot bend.']
    ]
  },
  {
    id: 'p3',
    title: 'Tide & Memory',
    author: 'Sarah Vance',
    handle: '@sarah.v',
    avatar: (window.__resources.img5),
    cover: (window.__resources.img6),
    tags: ['Ocean', 'Memory'],
    readTime: '2 min',
    syllables: 96,
    likes: 1300,
    comments: 62,
    publishedAt: '05 Oct',
    excerpt: 'The ocean pulls the secrets from the sand, every wave a persistent erasure of who we were...',
    body: [
      ['The ocean pulls the secrets from the sand,', 'every wave a persistent erasure of who we were.'],
      ['No sound quite like the receding water,', 'taking back the small shells', 'and the memories we left by the shoreline.']
    ]
  },
  {
    id: 'p4',
    title: 'Silver Moon',
    author: 'Luna Poetica',
    handle: '@luna_poetica',
    avatar: (window.__resources.img7),
    cover: (window.__resources.img8),
    tags: ['Haiku', 'Night'],
    readTime: '1 min',
    syllables: 17,
    likes: 1200,
    comments: 24,
    publishedAt: '14 Oct',
    excerpt: 'Silver moon hangs high, whispers in the velvet dark, shadows dance alone.',
    body: [['Silver moon hangs high,', 'Whispers in the velvet dark,', 'Shadows dance alone.']]
  },
];

const COMMENTS = [
  { id: 'c1', author: 'Aria Chen', handle: '@aria', avatar: (window.__resources.img9), time: '2h', body: 'The line about the throat of the night — devastating. I read it three times.', likes: 18, replies: 2 },
  { id: 'c2', author: 'Marcus Thorne', handle: '@m.thorne', avatar: (window.__resources.img10), time: '4h', body: 'Putting this on my Rainy Day Sonnets playlist. This is the one I needed today.', likes: 9, replies: 0 },
  { id: 'c3', author: 'Frost Writer', handle: '@frost_writer', avatar: (window.__resources.img11), time: '6h', body: 'every locked door / is a promise we were meant to break — tattoo material.', likes: 32, replies: 5 },
  { id: 'c4', author: 'Cyber Scribe', handle: '@cyber_scribe', avatar: (window.__resources.img12), time: '1d', body: 'The way you let the city breathe. Anyone else hearing this aloud?', likes: 7, replies: 1 },
];

const NOTIFICATIONS = [
  { id: 'n1', kind: 'like', actor: 'Elara Vance', avatar: (window.__resources.img13), body: 'liked your poem', target: 'Neon Whispers', time: '12m' },
  { id: 'n2', kind: 'follow', actor: 'Marcus Thorne', avatar: (window.__resources.img10), body: 'started following you', time: '1h' },
  { id: 'n3', kind: 'comment', actor: 'Aria Chen', avatar: (window.__resources.img9), body: 'commented on', target: 'Neon Whispers', time: '2h' },
  { id: 'n4', kind: 'feature', actor: 'Versify Editorial', avatar: null, body: 'featured your poem in', target: 'Editor\'s Picks', time: '5h' },
  { id: 'n5', kind: 'like', actor: 'Julian Vanes', avatar: (window.__resources.img1), body: 'liked your poem', target: 'Echoes of Neon', time: '1d' },
  { id: 'n6', kind: 'mention', actor: 'Sarah Vance', avatar: (window.__resources.img5), body: 'mentioned you in a stanza', time: '2d' },
];

const CATEGORIES = [
  { name: 'Melancholy', grad: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', img: (window.__resources.img14) },
  { name: 'Love', grad: 'linear-gradient(135deg, #9f1239, #fb7185)', img: (window.__resources.img15) },
  { name: 'Abstract', grad: 'linear-gradient(135deg, #7e22ce, #c084fc)', img: (window.__resources.img16) },
  { name: 'Nature', grad: 'linear-gradient(135deg, #065f46, #34d399)', img: (window.__resources.img17) },
  { name: 'Solitude', grad: 'linear-gradient(135deg, #1c1917, #57534e)', img: (window.__resources.img18) },
  { name: 'Urban', grad: 'linear-gradient(135deg, #18181b, #71717a)', img: (window.__resources.img19) },
];

const BACKDROPS = [
  (window.__resources.img2),
  (window.__resources.img17),
  (window.__resources.img4),
  (window.__resources.img8),
  (window.__resources.img15),
  (window.__resources.img19),
];

// ─── small shared components ─────────────────────────────────

function Icon({ name, fill = false, size = 24, color }) {
  return (
    <span
      className={'material-symbols-outlined ' + (fill ? 'msf' : '')}
      style={{ fontSize: size, color: color }}
    >{name}</span>
  );
}

function PhoneStatus({ time = '9:41' }) {
  return (
    <div className="phone-status">
      <span>{time}</span>
      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6.5" width="3" height="4.5" rx="0.7" fill="#fff"/><rect x="4.3" y="4" width="3" height="7" rx="0.7" fill="#fff"/><rect x="8.6" y="2" width="3" height="9" rx="0.7" fill="#fff"/><rect x="12.9" y="0" width="3" height="11" rx="0.7" fill="#fff"/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="#fff" strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="17" height="7" rx="2" fill="#fff"/><path d="M22 3.5V7c0.7 -0.2 1 -0.8 1 -1.7s-0.3 -1.5 -1 -1.7z" fill="#fff" fillOpacity="0.4"/></svg>
      </span>
    </div>
  );
}

function PhoneFrame({ children, screenLabel }) {
  return (
    <div className="phone" data-screen-label={screenLabel}>
      <div className="phone-screen">
        <div className="phone-island"></div>
        <PhoneStatus />
        <div className="phone-content no-scrollbar">{children}</div>
        <div className="phone-home"></div>
      </div>
    </div>
  );
}

function BottomNav({ active = 'home', onNav }) {
  const items = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'explore', label: 'Search', icon: 'search' },
    { id: 'compose', label: 'Write', icon: 'edit' },
    { id: 'notif', label: 'Inbox', icon: 'notifications' },
    { id: 'profile', label: 'Library', icon: 'library_books' },
  ];
  return (
    <nav style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '14px 14px 28px',
      background: 'rgba(14,14,14,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTopLeftRadius: 36, borderTopRightRadius: 36,
      boxShadow: '0 -1px 0 rgba(255,255,255,0.04), 0 -8px 32px rgba(0,0,0,0.4)',
      zIndex: 40,
    }}>
      {items.map(it => {
        const isCompose = it.id === 'compose';
        const isActive = active === it.id;
        if (isCompose) {
          return (
            <button key={it.id} onClick={() => onNav?.(it.id)} style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'linear-gradient(135deg, #57f47f, #0ec557)',
              color: '#003411', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(87,244,127,0.35)',
              marginTop: -8,
            }}>
              <Icon name="edit_note" size={26} />
            </button>
          );
        }
        return (
          <button key={it.id} onClick={() => onNav?.(it.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
            padding: 4,
          }}>
            <Icon name={it.icon} fill={isActive} size={22} />
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TopBar({ title = 'Versify', avatar, onAvatar, action }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 20px 12px',
      paddingTop: 60,
      background: 'linear-gradient(180deg, var(--surface) 70%, transparent)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {avatar !== false && (
          <button onClick={onAvatar} style={{
            width: 36, height: 36, borderRadius: '50%',
            overflow: 'hidden', border: 'none',
            background: 'var(--surface-high)', cursor: 'pointer', padding: 0,
          }}>
            <img src={avatar || (window.__resources.img13)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        )}
        <h1 className="font-headline" style={{
          margin: 0, fontSize: 13, fontWeight: 800,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff',
        }}>{title}</h1>
      </div>
      {action || (
        <button style={{
          background: 'rgba(255,255,255,0.04)', border: 'none',
          width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)', cursor: 'pointer',
        }}>
          <Icon name="settings" size={20} />
        </button>
      )}
    </header>
  );
}

function Particles({ count = 14 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 41) % 100;
        const top = (i * 67) % 100;
        const dx = (Math.sin(i) * 60).toFixed(0) + 'px';
        const dy = (-100 - (i * 9) % 80) + 'px';
        const dur = 8 + (i % 6) * 2;
        const delay = (i * 0.7) % 6;
        const sz = 2 + (i % 3);
        return (
          <span key={i} className="particle" style={{
            left: left + '%', top: top + '%',
            width: sz, height: sz,
            '--dx': dx, '--dy': dy,
            animationDuration: dur + 's',
            animationDelay: -delay + 's',
            background: i % 3 === 0 ? '#88ebff' : '#57f47f',
            opacity: 0.6,
          }} />
        );
      })}
    </div>
  );
}

// expose globals
Object.assign(window, {
  POEMS, COMMENTS, NOTIFICATIONS, CATEGORIES, BACKDROPS,
  Icon, PhoneFrame, BottomNav, TopBar, Particles, PhoneStatus,
});
