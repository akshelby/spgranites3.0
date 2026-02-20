import { cn } from "@/lib/utils";

interface SPLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
  className?: string;
}

export function SPLoader({ size = "md", text, fullPage = false, className }: SPLoaderProps) {
  const sizeMap = {
    sm: { container: "w-12 h-12", logo: "w-8 h-8", ring: 1.5, text: "text-xs" },
    md: { container: "w-20 h-20", logo: "w-14 h-14", ring: 2, text: "text-sm" },
    lg: { container: "w-28 h-28", logo: "w-20 h-20", ring: 2, text: "text-base" },
  };

  const s = sizeMap[size];

  const loader = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("sp-loader-container relative flex items-center justify-center", s.container)}>
        <div className="sp-ring sp-ring-1" style={{ borderWidth: `${s.ring}px` }} />
        <div className="sp-ring sp-ring-2" style={{ borderWidth: `${s.ring}px` }} />
        <div className="sp-ring sp-ring-3" style={{ borderWidth: `${s.ring}px` }} />
        <img
          src="/images/sp-logo-dark.png"
          alt="Loading"
          className={cn("sp-loader-logo dark:block hidden", s.logo)}
        />
        <img
          src="/images/sp-logo.png"
          alt="Loading"
          className={cn("sp-loader-logo dark:hidden", s.logo)}
        />
      </div>
      {text && (
        <p className={cn("text-muted-foreground font-medium", s.text)}>{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {loader}
      </div>
    );
  }

  return loader;
}
