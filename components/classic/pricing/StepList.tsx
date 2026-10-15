import { h2, wrap } from "@/components/classic/ui";

type Step = { title: string; body: string };

/** 진행 절차. 첫 화면의 절차 구성과 같게 윗선 + 단계 번호로 나눈다. */
export function StepList({ steps, title, id }: { steps: Step[]; title: string; id: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-32">
      <div className={`${wrap} py-16 md:py-24`}>
        <h2 id={`${id}-title`} className={h2}>
          {title}
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-5 md:gap-6">
          {steps.map((s, n) => (
            <li key={s.title} className="border-t-2 border-[#15171c] pt-5">
              <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{n + 1}단계</span>
              <p className="mt-2 text-[21px] font-extrabold tracking-[-0.03em]">{s.title}</p>
              <p className="mt-2 text-[15px] leading-[1.65] text-[#5b6370]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
