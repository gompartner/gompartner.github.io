import type { ReactNode } from "react";
import { Check } from "lucide-react";

// 11-26 판 아래 안내 칸(제작, 유지보수). 3D 판(ThreeBoard)의 h2 칸과 같은 글자, 같은 면, 같은 간격을 쓴다.
// 구글 검색과 AI 개요가 인용하기 쉽게 칸마다 h2 하나, 첫 문단은 사실 한두 문장. 효과(조립)는 넣지 않는다.

export const gH2 = "break-keep text-[28px] font-[800] leading-[1.25] tracking-[-0.045em] md:text-[40px]";
export const gH3 = "break-keep text-[21px] font-[800] leading-[1.3] tracking-[-0.035em] md:text-[24px]";
export const gSec = "mt-20 scroll-mt-24 md:mt-28";
export const gCard = "rounded-[24px] border border-white/12 bg-[#121722]";
export const gLead = "mt-4 max-w-[760px] break-keep text-[16px] leading-[1.75] text-[#c9ced6] md:text-[18px]";
export const gNote = "mt-4 break-keep text-[14px] leading-[1.6] text-[#8a94a6]";

/** h2 칸 하나 */
export function GuideSection({ id, title, lead, children }: { id: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={gSec}>
      <h2 id={id} className={gH2}>
        {title}
      </h2>
      {lead ? <p className={gLead}>{lead}</p> : null}
      <div className="mt-8 md:mt-10">{children}</div>
    </section>
  );
}

/** 체크 표시 한 줄 */
export function CheckLine({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 flex gap-2.5 break-keep text-[16px] leading-[1.65] text-[#c9ced6]">
      <Check aria-hidden size={18} strokeWidth={3} className="mt-[5px] shrink-0 text-[#7aa7ff]" />
      <span>{children}</span>
    </p>
  );
}

/** 방식 비교 표. 넓은 화면(lg)은 표, 그보다 좁으면 항목마다 방식을 차례로. 첫 칸(곰파트너가 하는 방식)을 옅게 칠한다(3D 판과 같은 모양) */
export function CompareTable({ caption, cols, rows }: { caption: string; cols: string[]; rows: string[][] }) {
  return (
    <>
      <div className={`${gCard} hidden overflow-hidden lg:block`}>
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-white/12">
              <th scope="col" className="w-[170px] px-6 py-5">
                <span className="sr-only">항목</span>
              </th>
              {cols.map((c, i) => (
                <th key={c} scope="col" className={`px-6 py-5 text-[19px] font-[800] tracking-[-0.03em] lg:text-[21px] ${i === 0 ? "bg-[#7aa7ff]/10 text-white" : "text-[#aab2bf]"}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, ...v]) => (
              <tr key={k} className="border-b border-white/12 last:border-b-0">
                <th scope="row" className="px-6 py-4 align-top text-[15px] font-bold text-[#8a94a6]">
                  {k}
                </th>
                {v.map((x, i) => (
                  <td key={i} className={`break-keep px-6 py-4 align-top text-[16px] leading-[1.55] ${i === 0 ? "bg-[#7aa7ff]/10 font-bold text-white" : "text-[#aab2bf]"}`}>
                    {x}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:hidden" role="list">
        {rows.map(([k, ...v]) => (
          <li key={k} className={`${gCard} p-5`}>
            <h3 className="text-[15px] font-bold text-[#7aa7ff]">{k}</h3>
            <dl className="mt-3 space-y-2.5">
              {v.map((x, i) => (
                <div key={i} className="grid grid-cols-[104px_minmax(0,1fr)] gap-3">
                  <dt className={`break-keep text-[14px] leading-[1.55] ${i === 0 ? "font-[800] text-white" : "text-[#8a94a6]"}`}>{cols[i]}</dt>
                  <dd className={`break-keep text-[15px] leading-[1.55] ${i === 0 ? "font-bold text-white" : "text-[#aab2bf]"}`}>{x}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
