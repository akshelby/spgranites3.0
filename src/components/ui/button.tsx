import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover-slide border-2 border-transparent",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover-slide border-2 border-transparent",
        outline: "border-2 border-input bg-background text-foreground hover-slide shadow-sm",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover-slide border-2 border-transparent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:scale-100",
      },
      size: {
        default: "h-11 px-10 py-2",
        sm: "h-9 px-8 text-xs",
        lg: "h-13 px-12 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const angularClip = "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isAngular = variant !== 'ghost' && variant !== 'link' && size !== 'icon';
    const finalStyle = isAngular
      ? { ...style, clipPath: angularClip }
      : style;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={finalStyle}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
