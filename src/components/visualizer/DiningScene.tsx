interface DiningSceneProps {
  textureStyle: React.CSSProperties;
}

export default function DiningScene({ textureStyle }: DiningSceneProps) {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="dining-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0ebe3" />
          <stop offset="100%" stopColor="#e5e0d8" />
        </linearGradient>
        <linearGradient id="dining-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8b8a4" />
          <stop offset="100%" stopColor="#baa898" />
        </linearGradient>
        <linearGradient id="leg-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a7a68" />
          <stop offset="50%" stopColor="#9a8a78" />
          <stop offset="100%" stopColor="#7a6a58" />
        </linearGradient>
        <linearGradient id="chair-seat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4cabb" />
          <stop offset="100%" stopColor="#c8bead" />
        </linearGradient>
        <linearGradient id="chair-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8bead" />
          <stop offset="100%" stopColor="#beb4a3" />
        </linearGradient>
        <linearGradient id="pendant-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="500" fill="url(#dining-wall)" />
      <rect x="0" y="370" width="800" height="130" fill="url(#dining-floor)" />
      <line x1="0" y1="370" x2="800" y2="370" stroke="#d5cdc0" strokeWidth="1" />

      <line x1="300" y1="0" x2="300" y2="30" stroke="#555" strokeWidth="1.5" />
      <line x1="500" y1="0" x2="500" y2="30" stroke="#555" strokeWidth="1.5" />
      <path d="M280,30 Q300,50 320,30" fill="url(#pendant-light)" />
      <path d="M480,30 Q500,50 520,30" fill="url(#pendant-light)" />
      <circle cx="300" cy="42" r="3" fill="#ffd700" opacity="0.6" />
      <circle cx="500" cy="42" r="3" fill="#ffd700" opacity="0.6" />
      <ellipse cx="300" cy="55" rx="60" ry="15" fill="rgba(255,215,0,0.04)" />
      <ellipse cx="500" cy="55" rx="60" ry="15" fill="rgba(255,215,0,0.04)" />

      <rect x="620" y="100" width="130" height="200" rx="3" fill="none" stroke="#c8c0b4" strokeWidth="1.5" />
      <line x1="620" y1="200" x2="750" y2="200" stroke="#c8c0b4" strokeWidth="1" />
      <rect x="640" y="120" width="90" height="60" rx="2" fill="#e0dbd3" />

      <rect x="50" y="200" width="80" height="120" rx="3" fill="none" stroke="#c8c0b4" strokeWidth="1" />
      <rect x="60" y="210" width="60" height="50" rx="2" fill="#e8e3db" />

      {[200, 350, 500, 600].map((x) => (
        <g key={`chair-back-${x}`}>
          <rect x={x - 25} y="140" width="50" height="70" rx="4" fill="url(#chair-back)" stroke="#b8ae9d" strokeWidth="1" />
          <line x1={x - 15} y1="150" x2={x - 15} y2="200" stroke="#b0a695" strokeWidth="1" />
          <line x1={x} y1="150" x2={x} y2="200" stroke="#b0a695" strokeWidth="1" />
          <line x1={x + 15} y1="150" x2={x + 15} y2="200" stroke="#b0a695" strokeWidth="1" />
        </g>
      ))}

      <foreignObject x="150" y="220" width="500" height="22">
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '2px',
            transition: 'all 0.4s ease',
            ...textureStyle,
          }}
        />
      </foreignObject>
      <rect x="150" y="240" width="500" height="3" fill="rgba(0,0,0,0.06)" rx="1" />

      <rect x="170" y="242" width="12" height="130" rx="2" fill="url(#leg-grad)" />
      <rect x="618" y="242" width="12" height="130" rx="2" fill="url(#leg-grad)" />
      <rect x="170" y="242" width="460" height="8" rx="2" fill="rgba(0,0,0,0.03)" />

      {[220, 370, 470, 580].map((x) => (
        <g key={`chair-front-${x}`}>
          <rect x={x - 22} y="260" width="44" height="8" rx="3" fill="url(#chair-seat)" stroke="#b8ae9d" strokeWidth="0.5" />
          <rect x={x - 18} y="268" width="4" height="100" rx="1" fill="#a09080" />
          <rect x={x + 14} y="268" width="4" height="100" rx="1" fill="#a09080" />
        </g>
      ))}

      <ellipse cx="300" cy="232" rx="12" ry="4" fill="rgba(80,80,80,0.1)" />
      <ellipse cx="500" cy="232" rx="12" ry="4" fill="rgba(80,80,80,0.1)" />
      <ellipse cx="400" cy="235" rx="6" ry="10" fill="rgba(80,80,80,0.08)" />
    </svg>
  );
}
