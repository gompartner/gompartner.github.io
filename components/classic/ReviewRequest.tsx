import { Check } from "lucide-react";

// 11-25 유지보수 첫 화면: 홈페이지 주소를 받아 사전 검토서를 보낸다(사용자: 번거로운 홈페이지 일을 맡기는 컨셉, 계약 전에 먼저 확인하고 검토하는 것이 강점).
// 주소는 상담 신청의 ?site= 로 넘긴다(상담 신청 폼이 점검 요청으로 채운다). 검토 항목은 이름만 보이고 결과는 검토서로 드린다.
const ITEMS = ["도메인과 SSL 인증서 만료일", "모바일 화면", "검색엔진 등록", "개인정보처리방침과 법정 고지", "문의 폼 접수", "접속 속도"];

export function ReviewRequest({ className = "" }: { className?: string }) {
  return (
    <div className={`border border-[#15171c] ${className}`}>
      <div className="grid gap-6 px-5 py-7 md:grid-cols-[1.1fr_1fr] md:gap-10 md:px-8 md:py-9">
        <div>
          <h2 className="break-keep text-[26px] font-[800] leading-[1.3] tracking-[-0.05em] md:text-[34px]">홈페이지 사전 검토서</h2>
          <p className="mt-2 break-keep text-[16px] leading-[1.6] text-[#3d4450] md:text-[17px]">주소를 남기시면 홈페이지를 확인하고 검토서를 메일로 드립니다.</p>
          <form action="/contact" method="get" className="mt-5 flex max-w-[520px] overflow-hidden rounded-md border-2 border-[#15171c] bg-white">
            <label htmlFor="review-site" className="sr-only">
              홈페이지 주소
            </label>
            <input id="review-site" name="site" type="text" inputMode="url" autoComplete="url" required placeholder="홈페이지 주소" className="min-w-0 flex-1 px-4 text-[16px] text-[#15171c] outline-none placeholder:text-[#6b7280] md:text-[17px]" />
            <button type="submit" data-gtm-cta="maintenance_review" className="h-14 shrink-0 bg-[#256ef4] px-5 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0] md:px-7 md:text-[17px]">
              사전 검토 신청
            </button>
          </form>
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-[#1552cc]">검토 항목</h3>
          <ul className="mt-2 grid border-t border-[#15171c] sm:grid-cols-2 sm:gap-x-6" role="list">
            {ITEMS.map((t) => (
              <li key={t} className="flex items-center gap-2 border-b border-[#e1e5eb] py-2.5 text-[15.5px] font-bold md:text-[16px]">
                <Check size={17} strokeWidth={2.5} aria-hidden className="shrink-0 text-[#256ef4]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
