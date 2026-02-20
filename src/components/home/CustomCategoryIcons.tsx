import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

// L-shaped kitchen countertop with sink
export function KitchenSlabIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* L-shape countertop */}
      <path d="M2 3h13v8H9v10H2z" />
      {/* Sink bowl */}
      <rect x="4" y="5" width="4" height="3" rx="0.8" />
      {/* Tap */}
      <line x1="6" y1="5" x2="6" y2="4" />
      <line x1="5" y1="4" x2="8" y2="4" />
    </svg>
  );
}

// Vanity top with oval wash basin
export function VanityTopIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Countertop slab */}
      <rect x="1" y="6" width="22" height="12" rx="1.5" />
      {/* Basin oval */}
      <ellipse cx="12" cy="12" rx="6" ry="4" />
      {/* Faucet */}
      <line x1="12" y1="8" x2="12" y2="6" />
      <path d="M10 6h4" />
      {/* Drain dot */}
      <circle cx="12" cy="13" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Dining table top with place settings
export function DiningTopIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Table slab */}
      <rect x="2" y="7" width="20" height="10" rx="2" />
      {/* Left plate */}
      <circle cx="7" cy="12" r="2.2" />
      {/* Right plate */}
      <circle cx="17" cy="12" r="2.2" />
      {/* Left fork */}
      <line x1="4" y1="10.5" x2="4" y2="13.5" />
      {/* Right knife */}
      <line x1="20" y1="10.5" x2="20" y2="13.5" />
    </svg>
  );
}

// Tile grid with grout lines
export function TilesFixingIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="2" y="2" width="9" height="9" rx="0.8" />
      <rect x="13" y="2" width="9" height="9" rx="0.8" />
      <rect x="2" y="13" width="9" height="9" rx="0.8" />
      <rect x="13" y="13" width="9" height="9" rx="0.8" />
    </svg>
  );
}

// Staircase with stone steps
export function StaircaseIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polyline points="2,22 2,16 8,16 8,10 14,10 14,4 22,4 22,22" />
      <line x1="2" y1="22" x2="22" y2="22" />
    </svg>
  );
}

// Headset for contact
export function ContactIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M3 11.5A9 9 0 0 1 21 11.5" />
      <rect x="2" y="11" width="3" height="5" rx="1" />
      <rect x="19" y="11" width="3" height="5" rx="1" />
      <path d="M21 16c0 2.5-2 4-5 4h-2" />
      <circle cx="12" cy="20" r="1" />
    </svg>
  );
}

// Store front for offline stores
export function OfflineStoreIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9h18v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0v-1z" />
      <rect x="8" y="14" width="8" height="7" rx="0.5" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="12" y1="14" x2="12" y2="21" />
    </svg>
  );
}

// Measuring tape / calculator for estimation
export function EstimationIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Measuring tape body */}
      <rect x="2" y="8" width="16" height="8" rx="1.5" />
      {/* Tape markings */}
      <line x1="6" y1="8" x2="6" y2="11" />
      <line x1="10" y1="8" x2="10" y2="11" />
      <line x1="14" y1="8" x2="14" y2="11" />
      <line x1="8" y1="8" x2="8" y2="9.5" />
      <line x1="12" y1="8" x2="12" y2="9.5" />
      {/* Pencil */}
      <path d="M18 10l3-3 1 1-3 3" />
      <line x1="18" y1="10" x2="19" y2="11" />
    </svg>
  );
}

// Phone handset
export function CallIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

// WhatsApp-style chat bubble
export function WhatsAppIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1zm0 0a5 5 0 0 0 5 5" />
    </svg>
  );
}

// Chat with heart
export function ChatSupportIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M12 8c0-1 .5-1.5 1.5-1.5S15 7 15 8c0 2-3 3-3 3s-3-1-3-3c0-1 .5-1.5 1.5-1.5S12 7 12 8z" />
    </svg>
  );
}
