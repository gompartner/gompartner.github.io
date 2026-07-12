import { Award, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { careerSupplements, technicalCareerHighlights } from "@/data/career";

const iconMap = {
  education: GraduationCap,
  certifications: ShieldCheck,
  training: Sparkles,
  awards: Award,
} as const;

export function CareerHighlights() {
  return (
    <section
      aria-labelledby="technical-career-heading"
      className="mb-16 rounded-3xl border border-border bg-surface p-6 md:p-8"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-accent uppercase tracking-widest mb-2">
            Technical Career
          </p>
          <h2
            id="technical-career-heading"
            className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
          >
            기술경력 요약
          </h2>
          <p className="mt-3 text-sm text-foreground-secondary leading-relaxed max-w-2xl">
            플랫폼 운영개발부터 공공, 금융, 행정 도메인의 웹 시스템 구축과 운영 개선까지 수행했습니다.
          </p>
        </div>
        <Badge variant="subtle">2009 — 현재</Badge>
      </div>

      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {technicalCareerHighlights.map((highlight) => (
          <li
            key={highlight}
            className="flex gap-3 rounded-2xl bg-background/60 p-4 text-sm text-foreground-secondary"
          >
            <span className="text-accent" aria-hidden>
              ✓
            </span>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CareerSupplements() {
  return (
    <section aria-labelledby="career-supplements-heading" className="mt-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-accent uppercase tracking-widest mb-2">
          Credentials
        </p>
        <h2
          id="career-supplements-heading"
          className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
        >
          학력 · 자격 · 교육 · 상훈
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {careerSupplements.map((section) => {
          const Icon = iconMap[section.id as keyof typeof iconMap] ?? Sparkles;

          return (
            <article
              key={section.id}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Icon size={18} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {section.title}
                </h3>
              </div>

              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-foreground-secondary"
                  >
                    <span className="text-foreground-tertiary" aria-hidden>
                      -
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
