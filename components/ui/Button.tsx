import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type ButtonStyleProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

type ButtonAsButton = ButtonStyleProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = ButtonStyleProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

function buttonClasses({ variant = "primary", size = "md" }: ButtonStyleProps, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none",
    size === "sm" && "text-sm px-4 py-2",
    size === "md" && "text-base px-6 py-3",
    size === "lg" && "text-lg px-8 py-4",
    variant === "primary" &&
      "bg-accent text-accent-foreground hover:bg-accent-hover active:scale-95",
    variant === "secondary" &&
      "bg-surface-secondary text-foreground hover:bg-border active:scale-95",
    variant === "ghost" &&
      "text-foreground-secondary hover:text-foreground hover:bg-surface active:scale-95",
    variant === "outline" &&
      "border border-border text-foreground hover:bg-surface active:scale-95",
    className
  );
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, className, href, children, ...rest } = props;
    const external = href.startsWith("mailto:") || href.startsWith("http");
    const classes = buttonClasses({ variant, size }, className);

    if (external) {
      return (
        <a href={href} className={classes} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant, size, className, children, ...rest } = props;
  return (
    <button className={buttonClasses({ variant, size }, className)} {...rest}>
      {children}
    </button>
  );
}
