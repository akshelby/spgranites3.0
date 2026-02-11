interface KitchenSceneProps {
  textureStyle: React.CSSProperties;
}

export default function KitchenScene({ textureStyle }: KitchenSceneProps) {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="wall-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e2d8" />
          <stop offset="100%" stopColor="#ddd7cd" />
        </linearGradient>
        <linearGradient id="cabinet-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f0e8" />
          <stop offset="100%" stopColor="#e8e0d4" />
        </linearGradient>
        <linearGradient id="cabinet-shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="floor-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b8a8" />
          <stop offset="100%" stopColor="#b8ac9c" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="500" fill="url(#wall-grad)" />
      <rect x="0" y="340" width="800" height="160" fill="url(#floor-grad)" />
      <line x1="0" y1="340" x2="800" y2="340" stroke="#d0c8b8" strokeWidth="1" />

      <rect x="50" y="40" width="200" height="130" rx="3" fill="url(#cabinet-grad)" stroke="#c8c0b4" strokeWidth="1" />
      <rect x="280" y="40" width="200" height="130" rx="3" fill="url(#cabinet-grad)" stroke="#c8c0b4" strokeWidth="1" />
      <line x1="150" y1="40" x2="150" y2="170" stroke="#c8c0b4" strokeWidth="1" />
      <line x1="380" y1="40" x2="380" y2="170" stroke="#c8c0b4" strokeWidth="1" />
      <rect x="65" y="85" width="20" height="2" rx="1" fill="#b0a898" />
      <rect x="165" y="85" width="20" height="2" rx="1" fill="#b0a898" />
      <rect x="295" y="85" width="20" height="2" rx="1" fill="#b0a898" />
      <rect x="395" y="85" width="20" height="2" rx="1" fill="#b0a898" />

      <rect x="540" y="50" width="110" height="120" rx="3" fill="#3a3a3a" />
      <rect x="545" y="55" width="100" height="105" rx="2" fill="#2a2a2a" />
      <rect x="555" y="60" width="80" height="45" rx="1" fill="#1a1a1a" />
      <rect x="555" y="110" width="80" height="45" rx="1" fill="#1a1a1a" />
      <circle cx="595" cy="82" r="2" fill="#555" />
      <circle cx="595" cy="132" r="2" fill="#555" />

      <rect x="690" y="50" width="60" height="80" rx="3" fill="url(#cabinet-grad)" stroke="#c8c0b4" strokeWidth="1" />
      <rect x="705" y="75" width="12" height="2" rx="1" fill="#b0a898" />
      <rect x="705" y="95" width="12" height="2" rx="1" fill="#b0a898" />

      <rect x="30" y="195" width="740" height="145" rx="3" fill="url(#cabinet-grad)" stroke="#c8c0b4" strokeWidth="1" />
      <line x1="200" y1="195" x2="200" y2="340" stroke="#c8c0b4" strokeWidth="1" />
      <line x1="370" y1="195" x2="370" y2="340" stroke="#c8c0b4" strokeWidth="1" />
      <line x1="540" y1="195" x2="540" y2="340" stroke="#c8c0b4" strokeWidth="1" />
      <rect x="100" y="260" width="30" height="2" rx="1" fill="#b0a898" />
      <rect x="270" y="260" width="30" height="2" rx="1" fill="#b0a898" />
      <rect x="440" y="260" width="30" height="2" rx="1" fill="#b0a898" />
      <rect x="620" y="260" width="30" height="2" rx="1" fill="#b0a898" />

      <rect x="345" y="200" width="80" height="70" rx="3" fill="#d0d0d0" stroke="#b8b8b8" strokeWidth="1" />
      <ellipse cx="385" cy="235" rx="30" ry="22" fill="#c0c0c0" stroke="#b0b0b0" strokeWidth="1" />
      <rect x="380" y="195" width="10" height="20" rx="2" fill="#a0a0a0" />
      <circle cx="385" cy="195" r="4" fill="#b8b8b8" stroke="#a0a0a0" strokeWidth="1" />

      <foreignObject x="25" y="175" width="750" height="25">
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

      <rect x="25" y="175" width="750" height="25" fill="url(#cabinet-shadow)" />

      <rect x="25" y="198" width="750" height="3" fill="rgba(0,0,0,0.06)" rx="1" />
    </svg>
  );
}
