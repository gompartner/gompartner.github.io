import { CalendarClock, Calculator, CreditCard, FileText, Globe2, LayoutList, MapPin, Printer, ShoppingCart, UserRound, type LucideIcon } from "lucide-react";
import { addons, type AddonId } from "@/data/classic/pricing";

// 11-01 패키지 밖 추가 기능. 카탈로그 견적(estimateSource)에 쓰는 10종과 같다. 금액은 싣지 않는다(견적서로 안내).
const ICON: Record<AddonId, LucideIcon> = { page: FileText, board: LayoutList, tool: Calculator, print: Printer, lang: Globe2, member: UserRound, live: CalendarClock, map: MapPin, pay: CreditCard, cart: ShoppingCart };
// 카탈로그에서 실제로 쓴 예
const EXAMPLE: Partial<Record<AddonId, string>> = {
  tool: "예약 접수, 견적 계산, 시간표 조회",
  board: "시공 사례, 신고 일정",
  live: "객실, 좌석 현황",
  map: "매물, 지점 찾기",
  cart: "원두, 도자기 주문",
};

export function AddonList({ only, id }: { only?: AddonId[]; id: string }) {
  const items = only ? addons.filter((a) => only.includes(a.id)) : addons;
  return (
    <div className="mt-10">
      <h3 id={id} className="text-[20px] font-[800] tracking-[-0.03em] md:text-[22px]">
        추가 기능
      </h3>
      <ul className="mt-4 grid gap-px overflow-hidden rounded-md border border-[#e6e9ee] bg-[#e6e9ee] sm:grid-cols-2 lg:grid-cols-5" role="list" aria-labelledby={id}>
        {items.map((a) => {
          const Icon = ICON[a.id];
          return (
            <li key={a.id} className="flex items-start gap-3 bg-white p-4">
              <Icon size={20} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
              <span>
                <span className="block text-[15px] font-bold">{a.name}</span>
                {EXAMPLE[a.id] ? <span className="mt-0.5 block text-[13px] text-[#5b6370]">{EXAMPLE[a.id]}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
