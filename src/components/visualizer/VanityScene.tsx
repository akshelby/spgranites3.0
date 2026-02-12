interface VanitySceneProps {
  textureStyle: React.CSSProperties;
}

export default function VanityScene({ textureStyle }: VanitySceneProps) {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="vanity-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eae5dd" />
          <stop offset="100%" stopColor="#e0dbd3" />
        </linearGradient>
        <linearGradient id="vanity-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8d0c4" />
          <stop offset="100%" stopColor="#cec6ba" />
        </linearGradient>
        <linearGradient id="vanity-cabinet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a4440" />
          <stop offset="100%" stopColor="#3a3430" />
        </linearGradient>
        <linearGradient id="mirror-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8e8f0" />
          <stop offset="30%" stopColor="#c8d8e4" />
          <stop offset="70%" stopColor="#d0e0ec" />
          <stop offset="100%" stopColor="#bcd0dc" />
        </linearGradient>
        <linearGradient id="faucet-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b8b0a8" />
          <stop offset="50%" stopColor="#d0c8c0" />
          <stop offset="100%" stopColor="#a8a098" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="800" height="500" fill="url(#vanity-wall)" />

      <rect x="0" y="0" width="800" height="500" fill="url(#vanity-floor)" y1="400" />
      <rect x="0" y="400" width="800" height="100" fill="url(#vanity-floor)" />
      <line x1="0" y1="400" x2="800" y2="400" stroke="#cec4b6" strokeWidth="1" />

      <g>
        <rect x="200" y="30" width="400" height="6" rx="3" fill="#b8b0a4" />
        <rect x="210" y="36" width="380" height="170" rx="4" fill="url(#mirror-grad)" stroke="#c0b8ac" strokeWidth="2" />
        <rect x="215" y="41" width="370" height="160" rx="2" fill="url(#mirror-grad)" opacity="0.7" />
        <rect x="215" y="41" width="370" height="80" fill="rgba(255,255,255,0.06)" />
      </g>

      <g>
        <circle cx="175" cy="105" r="25" fill="none" stroke="#d0c8bc" strokeWidth="3" />
        <circle cx="175" cy="105" r="20" fill="rgba(255,248,220,0.15)" />
        <circle cx="175" cy="105" r="3" fill="rgba(255,248,220,0.3)" />
      </g>
      <g>
        <circle cx="625" cy="105" r="25" fill="none" stroke="#d0c8bc" strokeWidth="3" />
        <circle cx="625" cy="105" r="20" fill="rgba(255,248,220,0.15)" />
        <circle cx="625" cy="105" r="3" fill="rgba(255,248,220,0.3)" />
      </g>

      <rect x="150" y="260" width="500" height="140" rx="3" fill="url(#vanity-cabinet)" stroke="#2a2420" strokeWidth="1" />
      <line x1="400" y1="260" x2="400" y2="400" stroke="#2a2420" strokeWidth="1" />
      <rect x="260" y="320" width="30" height="3" rx="1.5" fill="#8a8278" />
      <rect x="510" y="320" width="30" height="3" rx="1.5" fill="#8a8278" />

      <foreignObject x="140" y="230" width="520" height="35">
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
      <rect x="140" y="263" width="520" height="3" fill="rgba(0,0,0,0.08)" rx="1" />

      <g>
        <ellipse cx="310" cy="242" rx="45" ry="15" fill="#e8e4dc" stroke="#c8c0b4" strokeWidth="1.5" />
        <ellipse cx="310" cy="242" rx="40" ry="12" fill="#d8d4cc" />
        <ellipse cx="310" cy="240" rx="35" ry="10" fill="#c8c4bc" />
      </g>
      <g>
        <rect x="305" y="222" width="10" height="18" rx="2" fill="url(#faucet-grad)" />
        <path d="M310,222 Q310,212 325,215" stroke="url(#faucet-grad)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="326" cy="216" r="2" fill="#c0b8b0" />
      </g>

      <g>
        <ellipse cx="490" cy="242" rx="45" ry="15" fill="#e8e4dc" stroke="#c8c0b4" strokeWidth="1.5" />
        <ellipse cx="490" cy="242" rx="40" ry="12" fill="#d8d4cc" />
        <ellipse cx="490" cy="240" rx="35" ry="10" fill="#c8c4bc" />
      </g>
      <g>
        <rect x="485" y="222" width="10" height="18" rx="2" fill="url(#faucet-grad)" />
        <path d="M490,222 Q490,212 505,215" stroke="url(#faucet-grad)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="506" cy="216" r="2" fill="#c0b8b0" />
      </g>

      <rect x="665" y="240" width="90" height="120" rx="3" fill="none" stroke="#d0c8bc" strokeWidth="1" />
      <line x1="665" y1="280" x2="755" y2="280" stroke="#d0c8bc" strokeWidth="0.5" />
      <line x1="665" y1="320" x2="755" y2="320" stroke="#d0c8bc" strokeWidth="0.5" />
      <rect x="680" y="250" width="20" height="20" rx="2" fill="rgba(200,160,120,0.2)" />
      <rect x="710" y="250" width="15" height="25" rx="2" fill="rgba(180,160,140,0.15)" />
    </svg>
  );
}
