import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { lookRedirectScript } from "@/lib/look";
import { firstTouchScript } from "@/lib/attribution";
import "./globals.css";
import { CtaTracker } from "@/components/analytics/CtaTracker";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { profile } from "@/data/profile";
import { homeDescription, homeTitle } from "@/data/seo";
import { GTM_ID } from "@/lib/analytics";
import { OG_IMAGE } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// 실사용 글리프만 담은 서브셋(152KB) — 원본 2MB는 assets/fonts에 보관,
// 콘텐츠에 새 글자가 생기면 `python3 scripts/subset_font.py`로 재생성
const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.subset.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Apple SD Gothic Neo", "Segoe UI", "sans-serif"],
});

// 웹툰 제목 글꼴(Black Han Sans)은 옛 화면(/story, /landing)의 레이아웃에서만 불러온다(11-01 점검: 새 화면은 안 씀).

// 메인 첫 화면 문구와 맞춘 사이트 제목·설명
const siteTitle = homeTitle;
const siteDescription = homeDescription;

// 브라우저 주소창·폰 바로가기 색
export const viewport: Viewport = { themeColor: "#f3ece0" };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // 사업자등록번호 같은 숫자를 휴대폰이 전화번호로 잡지 않게 한다. 실제 전화는 tel: 링크로만 건다.
  formatDetection: { telephone: false },
  title: {
    default: siteTitle,
    template: `%s | ${profile.name}`,
  },
  description: siteDescription,
  keywords: ["홈페이지 제작", "홈페이지 유지보수", "홈페이지 오류 수정", "유지보수 업체 변경", "워드프레스 유지보수", profile.name, "gompartner"],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: profile.name,
    title: siteTitle,
    description: siteDescription,
    images: [{ ...OG_IMAGE, alt: `${profile.name}, 홈페이지 제작과 유지보수` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [OG_IMAGE.url],
  },
  verification: {
    other: { "naver-site-verification": ["1c5242ef5ddbce4e807bad7225bb0770a1cb06c1", "184bef35395b609c58d44964bf16993e76c0dd50"] },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={pretendard.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* 클래식 보기를 골랐으면 웹툰 화면을 그리기 전에 클래식 주소로 옮긴다 */}
        <script dangerouslySetInnerHTML={{ __html: lookRedirectScript }} />
        {/* 처음 들어온 곳(utm, 바깥 이전 페이지)을 기억해 상담 신청서에 함께 보낸다 */}
        <script dangerouslySetInnerHTML={{ __html: firstTouchScript }} />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* 첫 화면 미리보기(iframe) 안의 데모, 미리보기 주소·로컬, 자동 브라우저(로봇)는 방문으로 세지 않는다 */}
        {/* 11-08 검수 기기 제외: 주소에 ?ga=off 를 붙여 한 번 열면 그 브라우저는 GA를 싣지 않는다(?ga=on 으로 되돌림). 저장소가 막힌 브라우저는 그냥 센다 */}
        <Script id="gtm" strategy="afterInteractive">
          {`var gpOff=false;try{var gq=new URLSearchParams(location.search).get('ga');if(gq==='off')localStorage.setItem('gp_ga_off','1');if(gq==='on')localStorage.removeItem('gp_ga_off');gpOff=localStorage.getItem('gp_ga_off')==='1';if(gq==='off'||gq==='on'){var gu=new URL(location.href);gu.searchParams.delete('ga');history.replaceState(null,'',gu.pathname+gu.search+gu.hash);var gn=document.createElement('div');gn.textContent=gq==='off'?'이 브라우저의 방문은 GA에서 제외됩니다':'이 브라우저의 방문을 다시 GA에 기록합니다';gn.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;background:#15171c;color:#fff;padding:12px 18px;border-radius:8px;font-size:15px';document.body.appendChild(gn);setTimeout(function(){gn.remove()},4000)}}catch(e){}
if(!gpOff&&window.self===window.top&&/(^|\\.)gompartner\\.co\\.kr$/.test(location.hostname)&&!navigator.webdriver&&!/HeadlessChrome|bot|crawl|spider|Lighthouse/i.test(navigator.userAgent))(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <CtaTracker />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
