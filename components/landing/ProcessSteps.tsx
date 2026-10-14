import { processSteps } from "@/data/faq";

const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";

type Step = { title: string; body: string };

/** 진행 순서. 웹툰 컷처럼 번호 상자를 단 칸을 이어 놓는다(PC 가로 5칸, 휴대폰 세로).
    기본은 제작 절차이고, 유지보수 페이지는 steps와 title을 바꿔 쓴다. */
export function ProcessSteps({ steps = processSteps, title = "진행 안내", id = "process" }: { steps?: Step[]; title?: string; id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 border-t-[3px] border-[#1d1d1f]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-16 md:px-6 md:py-20">
        <h2 id={`${id}-title`} className={h2}>
          {title}
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-5 md:gap-3">
          {steps.map((s, i) => (
            <li key={s.title} className={`relative border-[3px] border-[#1d1d1f] bg-white px-4 pb-5 pt-4 shadow-[4px_4px_0_#1d1d1f] ${i % 2 ? "md:translate-y-3" : ""}`}>
              <span aria-hidden className="inline-block border-[2.5px] border-[#1d1d1f] bg-[#fff3b0] px-2 py-0.5 text-[14px] font-bold tabular-nums">
                {i + 1}
              </span>
              <p className="mt-3 text-[19px] font-bold leading-[1.4]">
                <span className="sr-only">{i + 1}단계 </span>
                {s.title}
              </p>
              <p className="mt-2 text-[16px] leading-[1.6] text-foreground-secondary">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
