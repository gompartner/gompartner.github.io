"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SearchItem } from "./index";
import { matches } from "./match";
import { SearchBox } from "./SearchBox";
import { SearchResults } from "./SearchResults";

const SUGGEST = ["홈페이지 제작", "오류 수정", "업체 변경", "워드프레스", "PHP", "예약", "견적 계산", "치과", "학원"];

// 통합검색. 주소의 ?q= 를 읽고, 입력할 때마다 주소도 바꿔 둔다(뒤로 가기, 공유)
export function SiteSearch({ index }: { index: SearchItem[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  useEffect(() => {
    const t = setTimeout(() => router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false }), 300);
    return () => clearTimeout(t);
  }, [q, router]);
  const found = useMemo(() => index.filter((i) => matches(`${i.title} ${i.desc} ${i.hay} ${i.kind}`, q)), [index, q]);
  return (
    <div>
      <SearchBox id="site-search" value={q} onChange={setQ} placeholder="서비스, 카탈로그, 자주 묻는 질문 검색" suggestions={SUGGEST} />
      <p className="mt-8 text-[15px] text-[#5b6370]" role="status">
        {q ? (
          <>
            <b className="text-[#15171c]">{q}</b> 검색 결과 <b className="tabular-nums text-[#15171c]">{found.length}</b>건
          </>
        ) : (
          "검색어를 입력해 주세요."
        )}
      </p>
      {q && found.length > 0 ? (
        <div className="mt-8">
          <SearchResults items={found} />
        </div>
      ) : null}
      {q && found.length === 0 ? <p className="mt-6 text-[16px]">다른 검색어로 찾아보시거나 상담 신청으로 문의해 주세요.</p> : null}
    </div>
  );
}
