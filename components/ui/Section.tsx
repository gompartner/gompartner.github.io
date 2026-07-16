import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  id?: string;
  as?: "section" | "div" | "main";
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, children, id, as: Tag = "section", ...props }, ref) => {
    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement>}
        id={id}
        className={cn("py-20 md:py-28 lg:py-32 px-6 md:px-12 lg:px-24", className)}
        {...props}
      >
        <div className="max-w-6xl mx-auto">{children}</div>
      </Tag>
    );
  }
);
Section.displayName = "Section";

interface SectionHeadingProps {
  label?: string;
  title: string;
  titleId?: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ label, title, titleId, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 md:mb-16", className)}>
      {label && (
        <p className="text-sm font-medium text-accent uppercase tracking-widest mb-3">{label}</p>
      )}
      <h2
        id={titleId}
        className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-foreground-secondary max-w-3xl">{description}</p>
      )}
    </div>
  );
}

export default Section;
