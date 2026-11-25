import { ClassicFooter } from "@/components/classic/ClassicFooter";
import { ClassicHeader } from "@/components/classic/ClassicHeader";
import { RememberClassic } from "@/components/classic/RememberClassic";
import { KakaoChat } from "@/components/layout/KakaoChat";

// 클래식 보기(웹 에이전시형 회사 홈페이지)의 틀. 첫 화면(/)과 /classic 아래 페이지가 같이 쓴다.
export function ClassicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="cl flex min-h-screen flex-col bg-white text-[#15171c]">
      {/* 11-22 RSS 구독 주소를 브라우저와 피드 리더가 찾게 한다(React가 head로 올린다) */}
      <link rel="alternate" type="application/rss+xml" title="곰파트너 위키" href="/rss.xml" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#256ef4] focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-white"
      >
        본문 바로가기
      </a>
      <RememberClassic />
      <KakaoChat />
      <ClassicHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ClassicFooter />
      {/* 11-26 파란 상담 띠와 휴대폰 아래 고정 상담 띠는 뺐다. 문의는 머리글 Contact와 메인 맨 아래 신청서 하나로(사용자 "버튼을 남발", "있어도 안 누르는 거면") */}
    </div>
  );
}
