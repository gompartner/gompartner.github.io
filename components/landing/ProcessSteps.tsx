import { processSteps } from "@/data/faq";

const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";

/** 진행 순서 5단계. 번호 원을 선으로 이어 절차가 한눈에 보이게 한다(PC 가로, 모바일 세로). */
export function ProcessSteps() {
  return (
    <section id="process" aria-labelledby="process-title" className="scroll-mt-16 border-t border-border">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-16 md:px-6 md:py-24">
        <h2 id="process-title" className={h2}>
          진행 안내
        </h2>
        <ol className="mt-8 md:grid md:grid-cols-5">
          {processSteps.map((s, i) => {
            const last = i === processSteps.length - 1;
            return (
              <li
                key={s.title}
                className={[
                  "relative pl-14 pb-10 md:pb-0 md:pl-0 md:pr-6",
                  // 모바일: 원 아래로 내려가는 세로 선 / PC: 원 오른쪽으로 이어지는 가로 선
                  last
                    ? ""
                    : "before:absolute before:left-5 before:top-10 before:bottom-0 before:w-px before:bg-border md:before:left-10 md:before:right-0 md:before:top-5 md:before:bottom-auto md:before:h-px md:before:w-auto",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[17px] font-bold tabular-nums text-accent-foreground md:static"
                >
                  {i + 1}
                </span>
                <p className="text-[19px] font-bold leading-[1.5] md:mt-4">
                  <span className="sr-only">{i + 1}단계 </span>
                  {s.title}
                </p>
                <p className="mt-2 text-[16px] leading-[1.6] text-foreground-secondary">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
