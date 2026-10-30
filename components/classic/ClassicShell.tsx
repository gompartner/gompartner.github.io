import { ClassicFooter } from "@/components/classic/ClassicFooter";
import { ClassicHeader } from "@/components/classic/ClassicHeader";
import { RememberClassic } from "@/components/classic/RememberClassic";
import { ChannelTalk } from "@/components/layout/ChannelTalk";

// 클래식 보기(웹 에이전시형 회사 홈페이지)의 틀. 첫 화면(/)과 /classic 아래 페이지가 같이 쓴다.
export function ClassicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#15171c]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#256ef4] focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-white"
      >
        본문 바로가기
      </a>
      <RememberClassic />
      <ChannelTalk />
      <ClassicHeader />
      <main id="main" className="flex-1 pt-16 md:pt-[76px]">
        {children}
      </main>
      <ClassicFooter />
    </div>
  );
}
