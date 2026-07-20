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
  /** display: 오버사이즈 헤딩 + 넓은 여백 (에디토리얼) */
  size?: "default" | "display";
  /** 섹션 인덱스 숫자 (예: "01") — 스위스 넘버링 */
  index?: string;
}

export function SectionHeading({
  label,
  title,
  titleId,
  description,
  className,
  size = "default",
  index,
}: SectionHeadingProps) {
  const display = size === "display";
  return (
    <div className={cn(display ? "mb-14 md:mb-20" : "mb-12 md:mb-16", className)}>
      {(index || label) && (
        <div className="mb-6 flex items-center gap-4 border-t border-border pt-4">
          {index && (
            <span className="text-sm font-bold tabular-nums tracking-widest text-accent">
              {index}
            </span>
          )}
          {label && (
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-foreground-secondary">
              {label}
            </span>
          )}
        </div>
      )}
      <h2
        id={titleId}
        className={cn(
          "break-keep tracking-tight text-foreground",
          display
            ? "text-[clamp(2.25rem,6vw,4.75rem)] font-black leading-[1.0]"
            : "text-3xl font-bold md:text-4xl lg:text-5xl"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "break-keep text-foreground-secondary",
            display ? "mt-5 max-w-2xl text-lg md:text-xl" : "mt-4 max-w-3xl text-lg"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default Section;
