interface KitchenSceneProps {
  textureStyle: React.CSSProperties;
}

export default function KitchenScene({ textureStyle }: KitchenSceneProps) {
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="k-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f0e8" />
          <stop offset="100%" stopColor="#ede8e0" />
        </linearGradient>
        <linearGradient id="k-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8b8a4" />
          <stop offset="100%" stopColor="#b8a894" />
        </linearGradient>
        <linearGradient id="k-upper-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8f4ee" />
          <stop offset="5%" stopColor="#f0ece4" />
          <stop offset="95%" stopColor="#e8e2d8" />
          <stop offset="100%" stopColor="#e0dad0" />
        </linearGradient>
        <linearGradient id="k-lower-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0ece4" />
          <stop offset="5%" stopColor="#ebe7df" />
          <stop offset="95%" stopColor="#e2ddd5" />
          <stop offset="100%" stopColor="#dad5cd" />
        </linearGradient>
        <linearGradient id="k-cab-inset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e5e0d8" />
          <stop offset="50%" stopColor="#ece7df" />
          <stop offset="100%" stopColor="#e5e0d8" />
        </linearGradient>
        <linearGradient id="k-backsplash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e4dc" />
          <stop offset="100%" stopColor="#e0dcd4" />
        </linearGradient>
        <linearGradient id="k-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0ccc4" />
          <stop offset="50%" stopColor="#c8c4bc" />
          <stop offset="100%" stopColor="#c0bbb3" />
        </linearGradient>
        <linearGradient id="k-window-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8d4f0" />
          <stop offset="60%" stopColor="#c8e4f8" />
          <stop offset="100%" stopColor="#e0f0e8" />
        </linearGradient>
        <linearGradient id="k-window-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f2ed" />
          <stop offset="100%" stopColor="#e8e5e0" />
        </linearGradient>
        <linearGradient id="k-sink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8c4bc" />
          <stop offset="40%" stopColor="#b8b4ac" />
          <stop offset="100%" stopColor="#a8a49c" />
        </linearGradient>
        <linearGradient id="k-faucet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b0aca4" />
          <stop offset="40%" stopColor="#d4d0c8" />
          <stop offset="60%" stopColor="#d8d4cc" />
          <stop offset="100%" stopColor="#b0aca4" />
        </linearGradient>
        <linearGradient id="k-stove" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
        <linearGradient id="k-oven" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
        <linearGradient id="k-shadow-under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="k-shadow-top" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="k-light-glow" x1="0.5" y1="0" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="rgba(255,248,220,0.25)" />
          <stop offset="100%" stopColor="rgba(255,248,220,0)" />
        </linearGradient>
        <pattern id="k-tile-pattern" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
          <rect width="40" height="20" fill="#e5e1d9" />
          <rect x="0.5" y="0.5" width="39" height="9" rx="0.5" fill="#eae6de" stroke="#d8d4cc" strokeWidth="0.3" />
          <rect x="20.5" y="10.5" width="39" height="9" rx="0.5" fill="#ece8e0" stroke="#d8d4cc" strokeWidth="0.3" />
          <rect x="-19.5" y="10.5" width="39" height="9" rx="0.5" fill="#e8e4dc" stroke="#d8d4cc" strokeWidth="0.3" />
        </pattern>
        <filter id="k-drop-shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.08" />
        </filter>
        <linearGradient id="k-floor-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8b8a4" />
          <stop offset="50%" stopColor="#ccbca8" />
          <stop offset="100%" stopColor="#c4b4a0" />
        </linearGradient>
      </defs>

      {/* Wall */}
      <rect x="0" y="0" width="800" height="500" fill="url(#k-wall)" />

      {/* Floor with tile lines */}
      <rect x="0" y="345" width="800" height="155" fill="url(#k-floor)" />
      <line x1="0" y1="345" x2="800" y2="345" stroke="#bfb5a1" strokeWidth="0.5" />
      {[0, 100, 200, 300, 400, 500, 600, 700].map((x) => (
        <line key={`fv-${x}`} x1={x} y1="345" x2={x} y2="500" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
      ))}
      {[395, 445].map((y) => (
        <line key={`fh-${y}`} x1="0" y1={y} x2="800" y2={y} stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
      ))}

      {/* ====== WINDOW (center-top) ====== */}
      <rect x="290" y="18" width="220" height="130" rx="2" fill="url(#k-window-frame)" stroke="#d8d4cc" strokeWidth="3" />
      <rect x="296" y="24" width="208" height="118" fill="url(#k-window-sky)" />
      {/* window mullions */}
      <rect x="396" y="24" width="4" height="118" fill="url(#k-window-frame)" />
      <rect x="296" y="78" width="208" height="4" fill="url(#k-window-frame)" />
      {/* trees/greenery outside */}
      <ellipse cx="340" cy="100" rx="30" ry="22" fill="#8ab870" opacity="0.5" />
      <ellipse cx="360" cy="110" rx="25" ry="18" fill="#7aad60" opacity="0.4" />
      <ellipse cx="450" cy="95" rx="35" ry="25" fill="#82b568" opacity="0.45" />
      <ellipse cx="470" cy="108" rx="20" ry="15" fill="#72a558" opacity="0.35" />
      {/* window sill */}
      <rect x="282" y="148" width="236" height="8" rx="1" fill="#ece8e0" stroke="#d8d4cc" strokeWidth="0.5" />
      {/* Small plant on sill */}
      <rect x="380" y="138" width="12" height="10" rx="1" fill="#8b6f50" />
      <ellipse cx="386" cy="134" rx="10" ry="8" fill="#5a9e42" />
      <ellipse cx="382" cy="132" rx="6" ry="6" fill="#68ad50" />

      {/* ====== SUBWAY TILE BACKSPLASH ====== */}
      <rect x="25" y="155" width="750" height="50" fill="url(#k-tile-pattern)" />

      {/* ====== UPPER CABINETS ====== */}
      {/* Left upper cabinet group */}
      <g filter="url(#k-drop-shadow)">
        <rect x="30" y="20" width="120" height="135" rx="2" fill="url(#k-upper-cab)" stroke="#d8d2c8" strokeWidth="1" />
        <rect x="36" y="28" width="50" height="120" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
        <rect x="92" y="28" width="50" height="120" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
        <rect x="84" y="80" width="3" height="14" rx="1.5" fill="#b8b0a4" />
        <rect x="93" y="80" width="3" height="14" rx="1.5" fill="#b8b0a4" />
      </g>

      {/* Second upper cabinet */}
      <g filter="url(#k-drop-shadow)">
        <rect x="160" y="20" width="110" height="135" rx="2" fill="url(#k-upper-cab)" stroke="#d8d2c8" strokeWidth="1" />
        <rect x="166" y="28" width="44" height="120" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
        <rect x="218" y="28" width="44" height="120" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
        <rect x="208" y="80" width="3" height="14" rx="1.5" fill="#b8b0a4" />
        <rect x="219" y="80" width="3" height="14" rx="1.5" fill="#b8b0a4" />
      </g>

      {/* ====== RANGE HOOD ====== */}
      <g>
        {/* hood chimney */}
        <rect x="475" y="0" width="50" height="35" fill="#c0bbb3" />
        {/* hood canopy - trapezoidal */}
        <path d="M445,35 L555,35 L570,90 L430,90 Z" fill="url(#k-hood)" stroke="#b8b3ab" strokeWidth="0.5" />
        <rect x="435" y="88" width="130" height="5" rx="1" fill="#b8b3ab" />
        {/* hood vent lines */}
        <line x1="460" y1="60" x2="540" y2="60" stroke="#b8b3ab" strokeWidth="0.5" />
        <line x1="455" y1="70" x2="545" y2="70" stroke="#b8b3ab" strokeWidth="0.5" />
        <line x1="450" y1="80" x2="550" y2="80" stroke="#b8b3ab" strokeWidth="0.5" />
        {/* hood light */}
        <circle cx="500" cy="88" r="3" fill="#fff8dc" opacity="0.6" />
        <ellipse cx="500" cy="155" rx="50" ry="20" fill="url(#k-light-glow)" />
      </g>

      {/* Right upper cabinets */}
      <g filter="url(#k-drop-shadow)">
        <rect x="580" y="20" width="90" height="135" rx="2" fill="url(#k-upper-cab)" stroke="#d8d2c8" strokeWidth="1" />
        <rect x="586" y="28" width="78" height="120" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
        <rect x="622" y="80" width="3" height="14" rx="1.5" fill="#b8b0a4" />
      </g>
      <g filter="url(#k-drop-shadow)">
        <rect x="680" y="20" width="90" height="135" rx="2" fill="url(#k-upper-cab)" stroke="#d8d2c8" strokeWidth="1" />
        <rect x="686" y="28" width="78" height="120" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
        <rect x="722" y="80" width="3" height="14" rx="1.5" fill="#b8b0a4" />
      </g>

      {/* ====== COUNTERTOP (stone texture area) ====== */}
      <foreignObject x="20" y="200" width="760" height="26">
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '1px',
            transition: 'all 0.4s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
            ...textureStyle,
          }}
        />
      </foreignObject>
      {/* Countertop edge highlight */}
      <rect x="20" y="200" width="760" height="1" fill="rgba(255,255,255,0.15)" />
      {/* Countertop bottom shadow */}
      <rect x="20" y="226" width="760" height="6" fill="url(#k-shadow-under)" />

      {/* ====== LOWER CABINETS ====== */}
      {/* Cabinet 1 */}
      <rect x="25" y="232" width="130" height="108" rx="2" fill="url(#k-lower-cab)" stroke="#d8d2c8" strokeWidth="1" />
      <rect x="32" y="238" width="54" height="95" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="92" y="238" width="54" height="95" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="84" y="280" width="3" height="14" rx="1.5" fill="#b8b0a4" />
      <rect x="93" y="280" width="3" height="14" rx="1.5" fill="#b8b0a4" />

      {/* Cabinet 2 - Drawers */}
      <rect x="165" y="232" width="120" height="108" rx="2" fill="url(#k-lower-cab)" stroke="#d8d2c8" strokeWidth="1" />
      <rect x="172" y="238" width="106" height="28" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="172" y="272" width="106" height="28" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="172" y="306" width="106" height="28" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="218" y="248" width="18" height="3" rx="1.5" fill="#b8b0a4" />
      <rect x="218" y="282" width="18" height="3" rx="1.5" fill="#b8b0a4" />
      <rect x="218" y="316" width="18" height="3" rx="1.5" fill="#b8b0a4" />

      {/* ====== SINK ====== */}
      <g>
        {/* Sink basin */}
        <rect x="310" y="206" width="90" height="50" rx="4" fill="url(#k-sink)" stroke="#a09c94" strokeWidth="1" />
        <rect x="316" y="212" width="78" height="38" rx="3" fill="#b0aca4" />
        <rect x="320" y="216" width="70" height="30" rx="2" fill="#a8a49c" />
        {/* Sink drain */}
        <circle cx="355" cy="236" r="5" fill="#989490" stroke="#8a8680" strokeWidth="0.5" />
        <circle cx="355" cy="236" r="2" fill="#787470" />
        {/* Faucet */}
        <rect x="350" y="196" width="10" height="12" rx="2" fill="url(#k-faucet)" />
        <path d="M355,196 C355,178 355,175 375,175" stroke="url(#k-faucet)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="377" cy="175" r="3" fill="#c8c4bc" />
        {/* Faucet handles */}
        <circle cx="343" cy="200" r="4" fill="#c8c4bc" stroke="#b0aca4" strokeWidth="0.5" />
        <circle cx="367" cy="200" r="4" fill="#c8c4bc" stroke="#b0aca4" strokeWidth="0.5" />
      </g>

      {/* Cabinet under sink */}
      <rect x="295" y="260" width="120" height="80" rx="2" fill="url(#k-lower-cab)" stroke="#d8d2c8" strokeWidth="1" />
      <rect x="302" y="266" width="48" height="68" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="356" y="266" width="48" height="68" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="348" y="295" width="3" height="14" rx="1.5" fill="#b8b0a4" />
      <rect x="357" y="295" width="3" height="14" rx="1.5" fill="#b8b0a4" />

      {/* ====== STOVE / COOKTOP ====== */}
      <g>
        {/* Cooktop surface */}
        <rect x="440" y="201" width="130" height="24" rx="2" fill="url(#k-stove)" />
        {/* Burners */}
        <circle cx="470" cy="210" r="12" fill="none" stroke="#444" strokeWidth="1.5" />
        <circle cx="470" cy="210" r="8" fill="none" stroke="#3a3a3a" strokeWidth="1" />
        <circle cx="470" cy="210" r="3" fill="#333" />
        <circle cx="540" cy="210" r="12" fill="none" stroke="#444" strokeWidth="1.5" />
        <circle cx="540" cy="210" r="8" fill="none" stroke="#3a3a3a" strokeWidth="1" />
        <circle cx="540" cy="210" r="3" fill="#333" />
        {/* Knobs */}
        <circle cx="455" cy="223" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />
        <circle cx="475" cy="223" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />
        <circle cx="525" cy="223" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />
        <circle cx="545" cy="223" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />
      </g>

      {/* ====== OVEN (below stove) ====== */}
      <rect x="430" y="232" width="150" height="108" rx="2" fill="url(#k-oven)" stroke="#222" strokeWidth="0.5" />
      <rect x="438" y="240" width="134" height="80" rx="2" fill="#1a1a1a" />
      <rect x="444" y="246" width="122" height="68" rx="1" fill="#111" />
      {/* Oven window */}
      <rect x="450" y="252" width="110" height="56" rx="1" fill="rgba(40,30,20,0.9)" />
      <rect x="450" y="252" width="110" height="28" fill="rgba(255,255,255,0.02)" />
      {/* Oven handle */}
      <rect x="460" y="326" width="90" height="4" rx="2" fill="#555" />
      {/* Oven knobs */}
      <circle cx="500" cy="338" r="3" fill="#444" stroke="#555" strokeWidth="0.5" />

      {/* ====== RIGHT CABINETS ====== */}
      {/* Cabinet with drawers */}
      <rect x="590" y="232" width="90" height="108" rx="2" fill="url(#k-lower-cab)" stroke="#d8d2c8" strokeWidth="1" />
      <rect x="597" y="238" width="76" height="28" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="597" y="272" width="76" height="28" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="597" y="306" width="76" height="28" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="628" y="248" width="18" height="3" rx="1.5" fill="#b8b0a4" />
      <rect x="628" y="282" width="18" height="3" rx="1.5" fill="#b8b0a4" />
      <rect x="628" y="316" width="18" height="3" rx="1.5" fill="#b8b0a4" />

      {/* Far right cabinet */}
      <rect x="690" y="232" width="85" height="108" rx="2" fill="url(#k-lower-cab)" stroke="#d8d2c8" strokeWidth="1" />
      <rect x="697" y="238" width="70" height="95" rx="1.5" fill="url(#k-cab-inset)" stroke="#d0cab0" strokeWidth="0.5" />
      <rect x="729" y="280" width="3" height="14" rx="1.5" fill="#b8b0a4" />

      {/* ====== CABINET TOE KICK ====== */}
      <rect x="20" y="340" width="755" height="6" fill="#c8c0b4" />

      {/* ====== DECORATIVE ITEMS ====== */}

      {/* Cutting board on counter */}
      <rect x="160" y="195" width="35" height="8" rx="2" fill="#c4a070" stroke="#b89060" strokeWidth="0.5" />

      {/* Olive oil bottle */}
      <rect x="210" y="188" width="10" height="16" rx="2" fill="#8a9a50" opacity="0.7" />
      <rect x="212" y="183" width="6" height="6" rx="1" fill="#a8b870" opacity="0.6" />

      {/* Utensil holder */}
      <rect x="600" y="183" width="16" height="22" rx="2" fill="#706050" />
      <line x1="604" y1="183" x2="604" y2="174" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="608" y1="183" x2="608" y2="172" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="612" y1="183" x2="612" y2="175" stroke="#777" strokeWidth="1.5" strokeLinecap="round" />

      {/* Small potted herb */}
      <rect x="640" y="192" width="14" height="12" rx="1" fill="#8b6f50" />
      <ellipse cx="647" cy="188" rx="10" ry="8" fill="#5a9e42" />
      <ellipse cx="644" cy="186" rx="6" ry="5" fill="#68ad50" />

      {/* Towel on oven handle */}
      <path d="M465,330 Q460,340 462,348" stroke="#c8b8a4" strokeWidth="3" fill="none" />

      {/* ====== AMBIENT LIGHTING & SHADOWS ====== */}
      {/* Under-cabinet shadow on backsplash */}
      <rect x="25" y="155" width="750" height="8" fill="url(#k-shadow-top)" />

      {/* Light reflection on countertop */}
      <rect x="300" y="201" width="100" height="3" fill="rgba(255,255,255,0.05)" rx="1" />

      {/* Floor shadow under cabinets */}
      <rect x="20" y="346" width="755" height="8" fill="url(#k-shadow-under)" />

      {/* Ambient light wash from window */}
      <rect x="280" y="148" width="240" height="60" fill="rgba(255,252,240,0.04)" />
    </svg>
  );
}
