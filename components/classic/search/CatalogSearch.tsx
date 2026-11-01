"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { SearchItem } from "./index";
import { matches } from "./match";
import { SearchBox } from "./SearchBox";
import { SearchResults } from "./SearchResults";

const SUGGEST = ["예약", "견적 계산", "시간표", "지도", "결제", "영문", "병원", "학원"];

// 카탈로그 목록 위 검색. 검색어가 없으면 원래 목록(children)을, 있으면 걸러 낸 결과를 보여 준다
export function CatalogSearch({ index, children, bare = false, suggestions = SUGGEST }: { index: SearchItem[]; children: ReactNode; /** 업종 탭처럼 이미 감싼 칸 안에 넣을 때 */ bare?: boolean; suggestions?: string[] }) {
  const [q, setQ] = useState("");
  const found = useMemo(() => index.filter((i) => matches(`${i.title} ${i.desc} ${i.hay}`, q)), [index, q]);
  if (bare)
    return (
      <>
        <SearchBox id="catalog-search" value={q} onChange={setQ} placeholder="이름, 기능으로 이 분야 카탈로그 검색" suggestions={suggestions} />
        {q ? (
          <p className="mt-6 text-[15px] text-[#5b6370]" role="status">
            <b className="text-[#15171c]">{q}</b> 카탈로그 <b className="tabular-nums text-[#15171c]">{found.length}</b>개
          </p>
        ) : null}
        <div className="mt-8 md:mt-10">{q ? found.length > 0 ? <SearchResults items={found} grouped={false} /> : <p className="text-[16px]">맞는 카탈로그가 없습니다. 다른 검색어로 찾아보시거나 상담 신청으로 문의해 주십시오.</p> : children}</div>
      </>
    );
  return (
    <>
      <div className="mx-auto w-full max-w-[1248px] px-4 pt-10 md:px-6 md:pt-14">
        <SearchBox id="catalog-search" value={q} onChange={setQ} placeholder="업종, 이름, 기능으로 카탈로그 검색" suggestions={SUGGEST} />
        {q ? (
          <p className="mt-6 text-[15px] text-[#5b6370]" role="status">
            <b className="text-[#15171c]">{q}</b> 카탈로그 <b className="tabular-nums text-[#15171c]">{found.length}</b>개
          </p>
        ) : null}
      </div>
      {q ? (
        <div className="mx-auto w-full max-w-[1248px] px-4 pb-16 pt-6 md:px-6 md:pb-24">
          {found.length > 0 ? <SearchResults items={found} grouped={false} /> : <p className="text-[16px]">맞는 카탈로그가 없습니다. 다른 검색어로 찾아보시거나 상담 신청으로 문의해 주십시오.</p>}
        </div>
      ) : (
        children
      )}
    </>
  );
}
