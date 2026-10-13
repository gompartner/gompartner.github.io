import type { Metadata } from "next";
import { Black_Han_Sans } from "next/font/google";
import { Webtoon } from "@/components/renewal/Webtoon";

// 리뉴얼 시안(웹툰형). 공개 전이라 검색에 걸리지 않게 둔다.
export const metadata: Metadata = {
  title: "웹툰형 시안",
  robots: { index: false, follow: false },
};

// 효과음·표지 제목 전용 굵은 글꼴. 본문은 사이트 공용 Pretendard.
const sfx = Black_Han_Sans({ weight: "400", subsets: ["latin"], variable: "--font-sfx", display: "swap" });

export default function WebtoonPrototypePage() {
  return (
    <div className={sfx.variable}>
      <Webtoon />
    </div>
  );
}
