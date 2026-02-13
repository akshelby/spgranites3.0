interface DiningSceneProps {
  textureStyle: React.CSSProperties;
}

export default function DiningScene({ textureStyle }: DiningSceneProps) {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="d-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2ede5" />
          <stop offset="100%" stopColor="#e8e3db" />
        </linearGradient>
        <linearGradient id="d-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b4a0" />
          <stop offset="100%" stopColor="#b8a894" />
        </linearGradient>
        <linearGradient id="d-leg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7a6a58" />
          <stop offset="40%" stopColor="#8a7a68" />
          <stop offset="100%" stopColor="#6a5a48" />
        </linearGradient>
        <linearGradient id="d-chair-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8d0c4" />
          <stop offset="100%" stopColor="#c8c0b4" />
        </linearGradient>
        <linearGradient id="d-chair-seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddd5c9" />
          <stop offset="100%" stopColor="#d0c8bc" />
        </linearGradient>
        <linearGradient id="d-chair-leg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a7a68" />
          <stop offset="50%" stopColor="#9a8a78" />
          <stop offset="100%" stopColor="#7a6a58" />
        </linearGradient>
        <linearGradient id="d-pendant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>
        <linearGradient id="d-window-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8d4f0" />
          <stop offset="60%" stopColor="#c8e4f8" />
          <stop offset="100%" stopColor="#e0f0e8" />
        </linearGradient>
        <linearGradient id="d-shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="d-frame-shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c0b8a8" />
          <stop offset="100%" stopColor="#d0c8b8" />
        </linearGradient>
      </defs>

      {/* Wall */}
      <rect x="0" y="0" width="800" height="500" fill="url(#d-wall)" />

      {/* Floor with herringbone hint */}
      <rect x="0" y="380" width="800" height="120" fill="url(#d-floor)" />
      <line x1="0" y1="380" x2="800" y2="380" stroke="#bab0a0" strokeWidth="0.5" />
      {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720].map((x) => (
        <line key={`dfv-${x}`} x1={x} y1="380" x2={x + 20} y2="500" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
      ))}

      {/* ====== LARGE WINDOW / ARTWORK ====== */}
      <rect x="250" y="30" width="300" height="170" rx="2" fill="#e8e4dc" stroke="#c8c0b4" strokeWidth="3" />
      <rect x="256" y="36" width="288" height="158" fill="url(#d-window-sky)" />
      {/* Landscape art - hills */}
      <ellipse cx="400" cy="170" rx="150" ry="40" fill="#8ab870" opacity="0.4" />
      <ellipse cx="350" cy="175" rx="100" ry="30" fill="#7aad60" opacity="0.35" />
      <ellipse cx="460" cy="178" rx="80" ry="25" fill="#6a9d50" opacity="0.3" />
      {/* Sun */}
      <circle cx="450" cy="70" r="20" fill="#ffd700" opacity="0.2" />
      <circle cx="450" cy="70" r="12" fill="#ffe44d" opacity="0.3" />

      {/* Frame for painting on left wall */}
      <rect x="50" y="60" width="70" height="90" rx="2" fill="#d8d0c4" stroke="#c0b8a8" strokeWidth="2" />
      <rect x="56" y="66" width="58" height="78" rx="1" fill="#e0d8cc" />
      <rect x="60" y="70" width="50" height="70" rx="0" fill="#ddd5c9" />
      {/* Abstract art strokes */}
      <path d="M65,100 Q75,85 85,100 Q95,115 105,95" stroke="#a08868" strokeWidth="1.5" fill="none" />
      <circle cx="80" cy="90" r="8" fill="rgba(160,136,104,0.15)" />

      {/* ====== PENDANT LIGHTS ====== */}
      <line x1="320" y1="0" x2="320" y2="50" stroke="#444" strokeWidth="1" />
      <line x1="480" y1="0" x2="480" y2="45" stroke="#444" strokeWidth="1" />
      <path d="M300,50 Q310,70 320,70 Q330,70 340,50" fill="url(#d-pendant)" stroke="#333" strokeWidth="0.5" />
      <path d="M460,45 Q470,65 480,65 Q490,65 500,45" fill="url(#d-pendant)" stroke="#333" strokeWidth="0.5" />
      <circle cx="320" cy="68" r="3" fill="#fff8dc" opacity="0.7" />
      <circle cx="480" cy="63" r="3" fill="#fff8dc" opacity="0.7" />
      {/* Light glow */}
      <ellipse cx="320" cy="90" rx="40" ry="10" fill="rgba(255,248,220,0.06)" />
      <ellipse cx="480" cy="85" rx="40" ry="10" fill="rgba(255,248,220,0.06)" />

      {/* ====== BACK CHAIRS ====== */}
      {[230, 340, 460, 570].map((x) => (
        <g key={`bc-${x}`}>
          <rect x={x - 22} y="168" width="44" height="60" rx="3" fill="url(#d-chair-back)" stroke="#bab2a2" strokeWidth="0.5" />
          <line x1={x - 12} y1="176" x2={x - 12} y2="218" stroke="#b0a898" strokeWidth="0.8" />
          <line x1={x} y1="176" x2={x} y2="218" stroke="#b0a898" strokeWidth="0.8" />
          <line x1={x + 12} y1="176" x2={x + 12} y2="218" stroke="#b0a898" strokeWidth="0.8" />
        </g>
      ))}

      {/* ====== TABLE TOP (stone texture) ====== */}
      <foreignObject x="170" y="235" width="460" height="22">
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '2px',
            transition: 'all 0.4s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
            ...textureStyle,
          }}
        />
      </foreignObject>
      {/* Table edge highlight */}
      <rect x="170" y="235" width="460" height="1" fill="rgba(255,255,255,0.12)" />
      {/* Table bottom shadow */}
      <rect x="170" y="257" width="460" height="4" fill="rgba(0,0,0,0.05)" rx="1" />

      {/* Table apron */}
      <rect x="178" y="257" width="444" height="8" rx="1" fill="#8a7a68" opacity="0.3" />

      {/* ====== TABLE LEGS ====== */}
      <rect x="188" y="265" width="10" height="115" rx="2" fill="url(#d-leg)" />
      <rect x="602" y="265" width="10" height="115" rx="2" fill="url(#d-leg)" />

      {/* ====== FRONT CHAIRS ====== */}
      {[250, 360, 450, 550].map((x) => (
        <g key={`fc-${x}`}>
          <rect x={x - 20} y="275" width="40" height="8" rx="3" fill="url(#d-chair-seat)" stroke="#bab2a2" strokeWidth="0.3" />
          <rect x={x - 16} y="283" width="4" height="95" rx="1" fill="url(#d-chair-leg)" />
          <rect x={x + 12} y="283" width="4" height="95" rx="1" fill="url(#d-chair-leg)" />
        </g>
      ))}

      {/* ====== TABLE ITEMS ====== */}
      {/* Centerpiece / vase */}
      <rect x="388" y="224" width="12" height="14" rx="2" fill="#706050" />
      <ellipse cx="394" cy="220" rx="8" ry="6" fill="#5a9e42" />
      <ellipse cx="391" cy="218" rx="5" ry="4" fill="#68ad50" />

      {/* Place setting hints (plates) */}
      <ellipse cx="280" cy="246" rx="12" ry="4" fill="rgba(255,255,255,0.1)" stroke="rgba(200,200,200,0.2)" strokeWidth="0.5" />
      <ellipse cx="500" cy="246" rx="12" ry="4" fill="rgba(255,255,255,0.1)" stroke="rgba(200,200,200,0.2)" strokeWidth="0.5" />

      {/* ====== SIDE TABLE / SHELF ====== */}
      <rect x="680" y="200" width="80" height="140" rx="3" fill="none" stroke="#c8c0b4" strokeWidth="1" />
      <line x1="680" y1="260" x2="760" y2="260" stroke="#c8c0b4" strokeWidth="0.5" />
      <line x1="680" y1="310" x2="760" y2="310" stroke="#c8c0b4" strokeWidth="0.5" />
      {/* Books on shelf */}
      <rect x="690" y="245" width="8" height="14" rx="0.5" fill="#c4785a" opacity="0.6" />
      <rect x="700" y="247" width="6" height="12" rx="0.5" fill="#5a8ab0" opacity="0.5" />
      <rect x="708" y="244" width="7" height="15" rx="0.5" fill="#8aad6a" opacity="0.5" />

      {/* ====== SHADOWS ====== */}
      {/* Floor shadow under table */}
      <ellipse cx="400" cy="382" rx="230" ry="6" fill="rgba(0,0,0,0.04)" />
    </svg>
  );
}
