import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs font-bold vegalta-section-title tracking-wider text-vegalta-royal-blue",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
