import type { Metadata } from "next";
import { ClassicFooter } from "@/components/classic/ClassicFooter";
import { ClassicHeader } from "@/components/classic/ClassicHeader";
import { ClassicMobileBar } from "@/components/classic/ClassicMobileBar";
import { ChannelTalk } from "@/components/layout/ChannelTalk";

// 클래식 보기(웹 에이전시형 회사 홈페이지). 웹툰 페이지와 내용이 겹쳐 검색에는 내보내지 않는다.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ClassicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#15171c]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#256ef4] focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-white"
      >
        본문 바로가기
      </a>
      <ChannelTalk />
      <ClassicHeader />
      <main id="main" className="flex-1 pt-16 md:pt-[112px]">
        {children}
      </main>
      <ClassicFooter />
      <ClassicMobileBar />
    </div>
  );
}
