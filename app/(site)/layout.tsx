import { Header } from "@/components/layout/Header";
import { KakaoChat } from "@/components/layout/KakaoChat";
import { Footer } from "@/components/layout/Footer";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { Black_Han_Sans } from "@/lib/local-fonts";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 옛 웹툰 화면(/story)과 이동 페이지. 제목 글꼴은 여기서만 불러온다. 회사 구조화 데이터는 새 화면에만 둔다
  return (
    <div className={`${Black_Han_Sans.variable} wt flex min-h-screen flex-col pb-[76px] md:pb-0`}>
      {/* 키보드 사용자용 본문 바로가기: 평소에는 숨기고 초점을 받을 때만 머리글 위에 보인다 */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-accent-foreground"
      >
        본문 바로가기
      </a>
      <KakaoChat />
      <Header />
      <main id="main" className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <MobileCtaBar />
    </div>
  );
}
