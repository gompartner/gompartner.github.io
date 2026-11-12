import { Check } from "lucide-react";
import { formatWon, planCommon, type Plan } from "@/data/classic/pricing";

const th = "sticky left-0 z-[1] w-[112px] bg-[#f6f7f9] px-4 py-4 text-left align-top text-[15px] font-bold text-[#3d4450] md:w-[180px] md:px-5";
const td = "px-4 py-4 align-top text-[16px] leading-[1.6] md:px-6";

/** 패키지 비교표. 열은 패키지, 행은 금액, 작업 기간, 수정 횟수, 구성, 포함 항목. 11-03 금액과 기간 다시 공개. 휴대폰에서는 표만 가로로 밀어 본다. */
export function PlanTable({ plans, product, common = planCommon }: { plans: Plan[]; product: string; common?: string[] }) {
  const list = (items: string[]) => (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check size={18} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#256ef4]" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
  // 11-12 휴대폰은 옆으로 미는 표 대신 패키지마다 카드 한 장씩 아래로 쌓는다(사용자 요청). md부터 표
  const row = "flex justify-between gap-4 border-b border-[#e6e9ee] py-3 text-[16px]";
  return (
    <>
    <ul className="mt-10 space-y-6 md:hidden" role="list" aria-label={`${product} 패키지`}>
      {plans.map((p) => (
        <li key={p.id} className="border-t-2 border-[#15171c] pt-5">
          <p className="text-[20px] font-[800] tracking-[-0.03em]">{p.title}</p>
          <p className="mt-1 text-[15px] text-[#5b6370]">{p.summary}</p>
          <p className="mt-3 text-[26px] font-extrabold tabular-nums tracking-[-0.03em] text-[#256ef4]">{formatWon(p.price)}</p>
          <div className="mt-3 border-t border-[#e6e9ee]">
            <div className={row}>
              <span className="font-bold text-[#3d4450]">작업 기간</span>
              <span className="tabular-nums">{p.period ?? `${p.days}일`}</span>
            </div>
            {p.revisions > 0 && (
              <div className={row}>
                <span className="font-bold text-[#3d4450]">수정 횟수</span>
                <span className="tabular-nums">{p.revisions}회</span>
              </div>
            )}
          </div>
          <div className="mt-4 text-[16px] leading-[1.6]">{list(p.includes)}</div>
        </li>
      ))}
      <li className="rounded-md bg-[#f6f7f9] p-4">
        <p className="text-[15px] font-bold text-[#3d4450]">모든 패키지 공통 포함</p>
        <div className="mt-2 text-[15px] leading-[1.6]">{list(common)}</div>
      </li>
      <li className="text-right text-[14px] text-[#5b6370]">부가세 별도, 작업 기간은 자료 전달일 기준</li>
    </ul>
    <div tabIndex={0} className="mt-10 hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] border-collapse border-t-2 border-[#15171c]">
        <caption className="sr-only">{product} 패키지 비교</caption>
        <thead>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="col" className={th}>
              구분
            </th>
            {plans.map((p) => (
              <th key={p.id} scope="col" className="px-4 py-5 text-left align-top md:px-6">
                <span className="block text-[19px] font-[800] tracking-[-0.03em] md:text-[22px]">{p.title}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              금액
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                <span className="text-[24px] font-extrabold tabular-nums tracking-[-0.03em] text-[#256ef4] md:text-[28px]">{formatWon(p.price)}</span>
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              작업 기간
            </th>
            {plans.map((p) => (
              <td key={p.id} className={`${td} tabular-nums`}>
                {p.period ?? `${p.days}일`}
              </td>
            ))}
          </tr>
          {plans.some((p) => p.revisions > 0) && (
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              수정 횟수
            </th>
            {plans.map((p) => (
              <td key={p.id} className={`${td} tabular-nums`}>
                {p.revisions}회
              </td>
            ))}
          </tr>
          )}
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              구성
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                {p.summary}
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              포함 항목
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                {list(p.includes)}
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#e6e9ee]">
            <th scope="row" className={th}>
              공통 포함
            </th>
            {plans.map((p) => (
              <td key={p.id} className={td}>
                {list(common)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-right text-[14px] text-[#5b6370]">부가세 별도, 작업 기간은 자료 전달일 기준</p>
    </div>
    </>
  );
}
