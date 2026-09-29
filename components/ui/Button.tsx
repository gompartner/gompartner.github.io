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
    "inline-flex items-center justify-center gap-2 font-bold rounded-md transition-colors duration-200 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none",
    size === "sm" && "text-[15px] h-10 px-4",
    size === "md" && "text-[17px] h-12 px-6",
    size === "lg" && "text-[17px] h-14 px-7",
    variant === "primary" &&
      "bg-accent text-accent-foreground hover:bg-accent-hover",
    variant === "secondary" &&
      "bg-foreground text-background hover:opacity-90",
    variant === "ghost" &&
      "text-foreground hover:bg-surface",
    variant === "outline" &&
      "border border-foreground/20 bg-white text-foreground hover:border-foreground/40",
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
