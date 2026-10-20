import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Black_Han_Sans } from "@/lib/local-fonts";
import Script from "next/script";
import { lookRedirectScript } from "@/lib/look";
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

// 웹툰 톤의 제목·효과음 글꼴. 본문은 Pretendard.
const sfx = Black_Han_Sans;

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
  keywords: ["홈페이지 제작", "홈페이지 유지보수", "도메인 만료", "SSL 인증서", "랜딩페이지 제작", "업무 프로그램 개발", profile.name, "gompartner"],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: profile.name,
    title: siteTitle,
    description: siteDescription,
    images: [{ ...OG_IMAGE, alt: `${profile.name}, 사장님 홈페이지와 IT 문제` }],
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
      className={`${pretendard.variable} ${sfx.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* 클래식 보기를 골랐으면 웹툰 화면을 그리기 전에 클래식 주소로 옮긴다 */}
        <script dangerouslySetInnerHTML={{ __html: lookRedirectScript }} />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* 첫 화면 미리보기(iframe) 안의 데모, 미리보기 주소·로컬, 자동 브라우저(로봇)는 방문으로 세지 않는다 */}
        <Script id="gtm" strategy="afterInteractive">
          {`if(window.self===window.top&&/(^|\\.)gompartner\\.co\\.kr$/.test(location.hostname)&&!navigator.webdriver&&!/HeadlessChrome|bot|crawl|spider|Lighthouse/i.test(navigator.userAgent))(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
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
