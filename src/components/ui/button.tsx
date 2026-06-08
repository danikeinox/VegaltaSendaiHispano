import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vegalta-gold disabled:pointer-events-none disabled:opacity-50 vegalta-section-title tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-vegalta-gold text-vegalta-blue hover:bg-vegalta-gold-light shadow-md",
        secondary:
          "bg-vegalta-royal-blue text-white hover:bg-vegalta-blue-light border border-white/20",
        outline:
          "border-2 border-vegalta-royal-blue text-vegalta-royal-blue hover:bg-vegalta-royal-blue/5 bg-white",
        ghost: "text-vegalta-royal-blue hover:bg-vegalta-royal-blue/5",
        destructive: "bg-vegalta-red text-white hover:bg-vegalta-red-dark",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
