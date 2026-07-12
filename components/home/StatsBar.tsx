import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { stats, statsCaption } from "@/data/stats";

export function StatsBar() {
  return (
    <section
      id="stats"
      aria-label="경력 요약"
      className="border-y border-border bg-surface/40 px-6 py-14 md:px-12 md:py-16 lg:px-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="text-center">
                <p className="text-4xl font-semibold tabular-nums tracking-tight text-foreground md:text-5xl">
                  <CountUp to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-foreground-secondary">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <p className="mt-10 text-center text-sm text-foreground-tertiary">{statsCaption}</p>
        </Reveal>
      </div>
    </section>
  );
}
