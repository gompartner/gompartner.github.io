import { ChevronDown } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { faq } from "@/data/faq";

const h2 = "text-[24px] font-bold leading-[1.5] tracking-[-0.01em] md:text-[32px]";

// 첫 화면 마지막에 많이 묻는 질문 셋과 상담 버튼으로 끝낸다. 나머지 질문은 머리글의 "자주 묻는 질문" 메뉴에 있다.
const picks = ["홈페이지 제작 비용은 얼마인가요?", "만드는 데 얼마나 걸리나요?", "계약 전에 어떻게 나올지 볼 수 있나요?"];
const items = picks.map((q) => faq.find((f) => f.q === q)!);

export function HomeFaq() {
  return (
    <section aria-labelledby="home-faq-title" className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-16 md:px-6 md:py-24">
        <h2 id="home-faq-title" className={h2}>
          많이 묻는 질문
        </h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {items.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-bold md:text-[19px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown size={20} aria-hidden className="shrink-0 text-foreground-secondary transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-5 text-[17px] leading-[1.7] text-foreground-secondary">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10">
          <ChannelTalkButton
            cta="home_faq_chat"
            className="inline-flex h-14 items-center rounded-[6px] bg-accent px-8 text-[17px] font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            채팅 상담
          </ChannelTalkButton>
        </div>
      </div>
    </section>
  );
}
