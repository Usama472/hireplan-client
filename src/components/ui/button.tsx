import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/index";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:shadow-secondary/25 transition-all duration-300",
        outline: "",
        "outline-primary":
          "bg-transparent text-primary border border-primary hover:bg-primary hover:text-white dark:hover:bg-primary/10",
        "outline-secondary":
          "bg-transparent text-secondary border border-secondary/30 hover:bg-secondary/5 dark:hover:bg-secondary/10",
        "outline-destructive":
          "bg-transparent text-destructive border border-destructive/30 hover:bg-destructive/5 dark:hover:bg-destructive/10",
        ghost: "hover:bg-accent/10 hover:text-primary dark:hover:bg-accent/20 ",
        link: "text-primary underline-offset-4 hover:underline",
        icon: "size-9 p-0 aspect-square",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      outline: {
        primary: "outline-primary",
        secondary: "outline-secondary",
        destructive: "outline-destructive",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        outline: "primary",
        className:
          "bg-transparent text-primary border border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10",
      },
      {
        variant: "outline",
        outline: "secondary",
        className:
          "bg-transparent text-secondary border border-secondary/30 hover:bg-secondary/5 dark:hover:bg-secondary/10",
      },
      {
        variant: "outline",
        outline: "destructive",
        className:
          "bg-transparent text-destructive border border-destructive/30 hover:bg-destructive/5 dark:hover:bg-destructive/10",
      },
      {
        variant: "outline",
        outline: undefined,
        className:
          "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 text-primary dark:text-primary border border-primary/20 dark:border-primary/30",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      outline: false,
    },
  }
);

type OutlineType = "primary" | "secondary" | "destructive" | false | undefined;

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    outline?: OutlineType;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  outline = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, outline, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
