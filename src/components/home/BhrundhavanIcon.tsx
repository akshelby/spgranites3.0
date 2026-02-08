import { forwardRef, SVGProps } from 'react';

interface BhrundhavanIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const BhrundhavanIcon = forwardRef<SVGSVGElement, BhrundhavanIconProps>(
  ({ size = 24, className, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {/* Pot base */}
        <path d="M7 20h10" />
        <path d="M8 20l1-4h6l1 4" />
        
        {/* Pot rim */}
        <path d="M6 16h12" />
        <rect x="7" y="14" width="10" height="2" rx="0.5" />
        
        {/* Stem */}
        <path d="M12 14v-3" />
        
        {/* Center leaves */}
        <path d="M12 11c0-2 1.5-3 3-3s-1 3-3 3" />
        <path d="M12 11c0-2-1.5-3-3-3s1 3 3 3" />
        
        {/* Upper leaves */}
        <path d="M12 8c0-1.5 1-2.5 2-2.5s-.5 2.5-2 2.5" />
        <path d="M12 8c0-1.5-1-2.5-2-2.5s.5 2.5 2 2.5" />
        
        {/* Top leaf */}
        <path d="M12 5.5c0-1.5.5-2.5 1.5-2.5s-.5 2.5-1.5 2.5" />
        <path d="M12 5.5c0-1.5-.5-2.5-1.5-2.5s.5 2.5 1.5 2.5" />
      </svg>
    );
  }
);

BhrundhavanIcon.displayName = 'BhrundhavanIcon';

export { BhrundhavanIcon };
