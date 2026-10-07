import { Header } from "@/components/layout/Header";
import { ChannelTalk } from "@/components/layout/ChannelTalk";
import { Footer } from "@/components/layout/Footer";
import {
  PersonJsonLd,
  ProfessionalServiceJsonLd,
  WebSiteJsonLd,
} from "@/components/seo/JsonLd";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 키보드 사용자용 본문 바로가기: 평소에는 숨기고 초점을 받을 때만 머리글 위에 보인다 */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-accent-foreground"
      >
        본문 바로가기
      </a>
      <PersonJsonLd />
      <ProfessionalServiceJsonLd />
      <WebSiteJsonLd />
      <ChannelTalk />
      <Header />
      <main id="main" className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
