import { ChevronDown } from "lucide-react";
import { h2, wrap } from "@/components/classic/ui";

type Qa = { q: string; a: string };

// 서비스 페이지마다 두는 자주 묻는 질문(11-01 보편 구성). FAQPage 구조화 데이터를 같이 낸다.
// 11-26 판과 같은 어두운 색: 선은 흰색 10~15%, 질문은 흰색(열면 하늘색), 답은 남색 면(#121722) 위 #c9ced6.
export function FaqBlock({ items, id = "faq", title = "자주 묻는 질문", bare = false }: { items: Qa[]; id?: string; title?: string; bare?: boolean }) {
  if (items.length === 0) return null;
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const list = (
    <ul className={`${bare ? "" : "mt-10 "}border-t border-white/15`} role="list">
      {items.map((f) => (
        <li key={f.q} className="border-b border-white/10">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-start gap-4 px-1 py-5 md:gap-6 md:py-6 [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="shrink-0 text-[19px] font-[800] text-[#7aa7ff] md:text-[21px]">
                Q
              </span>
              <span className="min-w-0 flex-1 break-keep text-[17px] font-[800] leading-[1.5] tracking-[-0.03em] text-white group-hover:text-[#7aa7ff] group-open:text-[#7aa7ff] md:text-[19px]">{f.q}</span>
              <ChevronDown size={22} aria-hidden className="mt-0.5 shrink-0 text-[#8a94a6] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="mb-5 flex gap-4 rounded-[16px] bg-[#121722] px-4 py-5 md:gap-6 md:px-6 md:py-6">
              <span aria-hidden className="shrink-0 text-[19px] font-[800] text-[#8a94a6] md:text-[21px]">
                A
              </span>
              <p className="min-w-0 flex-1 text-[16px] leading-[1.75] text-[#c9ced6] md:pr-12 md:text-[17px]">{f.a}</p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {bare ? (
        list
      ) : (
        <section aria-labelledby={id} className="scroll-mt-20 border-t border-white/10 md:scroll-mt-24">
          <div className={`${wrap} py-16 md:py-24`}>
            <h2 id={id} className={h2}>
              {title}
            </h2>
            {list}
          </div>
        </section>
      )}
    </>
  );
}
