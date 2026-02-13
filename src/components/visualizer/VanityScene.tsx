interface VanitySceneProps {
  textureStyle: React.CSSProperties;
}

export default function VanityScene({ textureStyle }: VanitySceneProps) {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="v-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eae5dd" />
          <stop offset="100%" stopColor="#e0dbd3" />
        </linearGradient>
        <linearGradient id="v-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8d0c4" />
          <stop offset="100%" stopColor="#cec6ba" />
        </linearGradient>
        <linearGradient id="v-cabinet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a4440" />
          <stop offset="5%" stopColor="#444038" />
          <stop offset="95%" stopColor="#3a3630" />
          <stop offset="100%" stopColor="#322e28" />
        </linearGradient>
        <linearGradient id="v-cab-inset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3e3a34" />
          <stop offset="50%" stopColor="#423e38" />
          <stop offset="100%" stopColor="#3a3630" />
        </linearGradient>
        <linearGradient id="v-mirror" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8e8f0" />
          <stop offset="25%" stopColor="#c8d8e8" />
          <stop offset="50%" stopColor="#d0e0ec" />
          <stop offset="75%" stopColor="#c4d4e4" />
          <stop offset="100%" stopColor="#bcd0dc" />
        </linearGradient>
        <linearGradient id="v-mirror-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8c0b4" />
          <stop offset="100%" stopColor="#b8b0a4" />
        </linearGradient>
        <linearGradient id="v-faucet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b0aca4" />
          <stop offset="40%" stopColor="#d4d0c8" />
          <stop offset="60%" stopColor="#d8d4cc" />
          <stop offset="100%" stopColor="#b0aca4" />
        </linearGradient>
        <linearGradient id="v-sink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e4dc" />
          <stop offset="50%" stopColor="#ddd9d1" />
          <stop offset="100%" stopColor="#d0ccc4" />
        </linearGradient>
        <linearGradient id="v-shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="v-light-glow" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,248,220,0.2)" />
          <stop offset="100%" stopColor="rgba(255,248,220,0)" />
        </linearGradient>
        <pattern id="v-tile" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="#e2ded6" />
          <rect x="0.5" y="0.5" width="49" height="49" rx="0.5" fill="#e8e4dc" stroke="#d4d0c8" strokeWidth="0.3" />
        </pattern>
      </defs>

      {/* Wall with tile pattern */}
      <rect x="0" y="0" width="800" height="500" fill="url(#v-wall)" />
      <rect x="0" y="0" width="800" height="400" fill="url(#v-tile)" />

      {/* Floor */}
      <rect x="0" y="400" width="800" height="100" fill="url(#v-floor)" />
      <line x1="0" y1="400" x2="800" y2="400" stroke="#c4bbb0" strokeWidth="0.5" />
      {[0, 100, 200, 300, 400, 500, 600, 700].map((x) => (
        <line key={`vf-${x}`} x1={x} y1="400" x2={x} y2="500" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
      ))}
      <line x1="0" y1="450" x2="800" y2="450" stroke="rgba(0,0,0,0.025)" strokeWidth="0.5" />

      {/* ====== LARGE MIRROR ====== */}
      <rect x="195" y="25" width="410" height="190" rx="4" fill="url(#v-mirror-frame)" stroke="#b0a898" strokeWidth="3" />
      <rect x="202" y="32" width="396" height="176" rx="2" fill="url(#v-mirror)" />
      {/* Mirror reflection highlight */}
      <rect x="202" y="32" width="396" height="88" fill="rgba(255,255,255,0.05)" rx="2" />
      {/* Mirror reflection streak */}
      <path d="M250,50 Q300,35 350,55" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />

      {/* ====== WALL SCONCE LIGHTS ====== */}
      {/* Left sconce */}
      <g>
        <rect x="157" y="75" width="8" height="30" rx="2" fill="#c0b8ac" />
        <rect x="153" y="70" width="16" height="8" rx="3" fill="#d0c8bc" stroke="#b8b0a4" strokeWidth="0.5" />
        <ellipse cx="161" cy="68" rx="6" ry="3" fill="#fff8dc" opacity="0.4" />
        <ellipse cx="161" cy="120" rx="20" ry="40" fill="url(#v-light-glow)" />
      </g>
      {/* Right sconce */}
      <g>
        <rect x="635" y="75" width="8" height="30" rx="2" fill="#c0b8ac" />
        <rect x="631" y="70" width="16" height="8" rx="3" fill="#d0c8bc" stroke="#b8b0a4" strokeWidth="0.5" />
        <ellipse cx="639" cy="68" rx="6" ry="3" fill="#fff8dc" opacity="0.4" />
        <ellipse cx="639" cy="120" rx="20" ry="40" fill="url(#v-light-glow)" />
      </g>

      {/* ====== VANITY COUNTERTOP (stone) ====== */}
      <foreignObject x="140" y="230" width="520" height="32">
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '2px',
            transition: 'all 0.4s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
            ...textureStyle,
          }}
        />
      </foreignObject>
      {/* Counter edge highlight */}
      <rect x="140" y="230" width="520" height="1" fill="rgba(255,255,255,0.12)" />
      {/* Counter shadow */}
      <rect x="140" y="262" width="520" height="6" fill="url(#v-shadow)" />

      {/* ====== VESSEL SINKS ====== */}
      {/* Left sink */}
      <g>
        <ellipse cx="300" cy="242" rx="42" ry="14" fill="url(#v-sink)" stroke="#c4c0b8" strokeWidth="1" />
        <ellipse cx="300" cy="241" rx="36" ry="11" fill="#ddd9d1" />
        <ellipse cx="300" cy="240" rx="30" ry="8" fill="#d0ccc4" />
        <ellipse cx="300" cy="239" rx="20" ry="5" fill="#c8c4bc" />
      </g>
      {/* Left faucet */}
      <g>
        <rect x="296" y="222" width="8" height="12" rx="2" fill="url(#v-faucet)" />
        <path d="M300,222 C300,210 300,207 318,207" stroke="url(#v-faucet)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="320" cy="207" r="2.5" fill="#c8c4bc" />
        <circle cx="290" cy="228" r="3.5" fill="#c8c4bc" stroke="#b0aca4" strokeWidth="0.3" />
        <circle cx="310" cy="228" r="3.5" fill="#c8c4bc" stroke="#b0aca4" strokeWidth="0.3" />
      </g>

      {/* Right sink */}
      <g>
        <ellipse cx="500" cy="242" rx="42" ry="14" fill="url(#v-sink)" stroke="#c4c0b8" strokeWidth="1" />
        <ellipse cx="500" cy="241" rx="36" ry="11" fill="#ddd9d1" />
        <ellipse cx="500" cy="240" rx="30" ry="8" fill="#d0ccc4" />
        <ellipse cx="500" cy="239" rx="20" ry="5" fill="#c8c4bc" />
      </g>
      {/* Right faucet */}
      <g>
        <rect x="496" y="222" width="8" height="12" rx="2" fill="url(#v-faucet)" />
        <path d="M500,222 C500,210 500,207 518,207" stroke="url(#v-faucet)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="520" cy="207" r="2.5" fill="#c8c4bc" />
        <circle cx="490" cy="228" r="3.5" fill="#c8c4bc" stroke="#b0aca4" strokeWidth="0.3" />
        <circle cx="510" cy="228" r="3.5" fill="#c8c4bc" stroke="#b0aca4" strokeWidth="0.3" />
      </g>

      {/* ====== VANITY CABINET ====== */}
      <rect x="150" y="268" width="500" height="130" rx="3" fill="url(#v-cabinet)" stroke="#2a2620" strokeWidth="0.5" />

      {/* Cabinet doors */}
      <rect x="160" y="275" width="105" height="115" rx="2" fill="url(#v-cab-inset)" stroke="#504c44" strokeWidth="0.5" />
      <rect x="275" y="275" width="105" height="115" rx="2" fill="url(#v-cab-inset)" stroke="#504c44" strokeWidth="0.5" />
      <rect x="420" y="275" width="105" height="115" rx="2" fill="url(#v-cab-inset)" stroke="#504c44" strokeWidth="0.5" />
      <rect x="535" y="275" width="105" height="115" rx="2" fill="url(#v-cab-inset)" stroke="#504c44" strokeWidth="0.5" />

      {/* Divider line (center) */}
      <line x1="400" y1="268" x2="400" y2="398" stroke="#2a2620" strokeWidth="1" />

      {/* Cabinet handles */}
      <rect x="260" y="325" width="3" height="16" rx="1.5" fill="#8a8278" />
      <rect x="277" y="325" width="3" height="16" rx="1.5" fill="#8a8278" />
      <rect x="520" y="325" width="3" height="16" rx="1.5" fill="#8a8278" />
      <rect x="537" y="325" width="3" height="16" rx="1.5" fill="#8a8278" />

      {/* ====== ACCESSORIES ====== */}
      {/* Soap dispenser (left) */}
      <rect x="220" y="221" width="10" height="14" rx="2" fill="#b8c4d0" opacity="0.7" />
      <rect x="222" y="216" width="6" height="6" rx="1" fill="#c8d4e0" opacity="0.6" />
      <rect x="224" y="213" width="2" height="4" rx="0.5" fill="#a0acb8" />

      {/* Soap dispenser (right) */}
      <rect x="560" y="221" width="10" height="14" rx="2" fill="#d4c0a8" opacity="0.7" />
      <rect x="562" y="216" width="6" height="6" rx="1" fill="#e0ccb4" opacity="0.6" />
      <rect x="564" y="213" width="2" height="4" rx="0.5" fill="#c0ac94" />

      {/* Candle */}
      <rect x="394" y="220" width="12" height="14" rx="1" fill="#f0e8d8" stroke="#e0d8c8" strokeWidth="0.3" />
      <rect x="399" y="216" width="2" height="5" fill="#d4c4a8" />
      <ellipse cx="400" cy="215" rx="1.5" ry="2" fill="#ffd700" opacity="0.4" />

      {/* Towel rack on right */}
      <rect x="690" y="270" width="70" height="4" rx="2" fill="#b8b0a4" />
      <rect x="690" y="270" width="4" height="25" rx="1" fill="#b8b0a4" />
      <rect x="756" y="270" width="4" height="25" rx="1" fill="#b8b0a4" />
      {/* Towel draped */}
      <path d="M695,275 Q710,285 720,275 Q730,265 740,278 L750,275" stroke="#e8e0d4" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M720,278 L720,310" stroke="#e8e0d4" strokeWidth="8" fill="none" strokeLinecap="round" />

      {/* Small shelf left */}
      <rect x="30" y="240" width="80" height="6" rx="1" fill="#c8c0b4" stroke="#b8b0a4" strokeWidth="0.5" />
      {/* Items on shelf */}
      <rect x="40" y="225" width="12" height="15" rx="2" fill="#a0c4a8" opacity="0.5" />
      <rect x="58" y="228" width="8" height="12" rx="1" fill="#c4a078" opacity="0.5" />
      <rect x="72" y="230" width="10" height="10" rx="5" fill="#d4b898" opacity="0.4" />

      {/* ====== FLOOR SHADOW ====== */}
      <rect x="145" y="398" width="510" height="8" fill="url(#v-shadow)" />
    </svg>
  );
}
