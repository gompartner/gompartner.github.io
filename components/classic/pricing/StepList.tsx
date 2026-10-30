import { h2, wrap } from "@/components/classic/ui";

type Step = { title: string; body: string };

/** 단계 흐름. 번호 원을 선으로 이어 순서가 한눈에 보이게 한다. PC는 가로, 휴대폰은 세로로 잇는다. */
export function FlowSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-10 grid gap-8 md:grid-cols-5 md:gap-6">
      {steps.map((s, n) => (
        <li
          key={s.title}
          className="relative grid grid-cols-[48px_1fr] gap-x-4 after:absolute after:bottom-[-32px] after:left-[23px] after:top-12 after:w-[2px] after:bg-[#c9d6f5] last:after:hidden md:block md:after:bottom-auto md:after:left-14 md:after:right-[-20px] md:after:top-6 md:after:h-[2px] md:after:w-auto"
        >
          <span className="relative z-[1] grid h-12 w-12 place-items-center rounded-full border-2 border-[#256ef4] bg-white text-[17px] font-[800] tabular-nums text-[#256ef4]">{n + 1}</span>
          <div className="md:mt-5">
            <h3 className="text-[20px] font-[800] tracking-[-0.03em] md:text-[21px]">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-[1.65] text-[#5b6370]">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** 진행 절차 구획. 첫 화면의 진행 절차와 같은 흐름 모양을 쓴다. */
export function StepList({ steps, title, id }: { steps: Step[]; title: string; id: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24">
      <div className={`${wrap} py-16 md:py-24`}>
        <h2 id={`${id}-title`} className={h2}>
          {title}
        </h2>
        <FlowSteps steps={steps} />
      </div>
    </section>
  );
}
