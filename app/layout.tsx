import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { lookRedirectScript } from "@/lib/look";
import { firstTouchScript } from "@/lib/attribution";
import "./globals.css";
import { CtaTracker } from "@/components/analytics/CtaTracker";
import { NavMemory } from "@/components/classic/NavMemory";
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
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
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

// 11-26 사이트 색을 하나로: 메인과 안쪽 판이 어두운 화면이라 나머지 페이지(자주 묻는 질문, 공지, 위키 문서)도 같은 어두운 색으로 본다.
// 방법 셋을 견줬다. (a) 이미 있는 다크모드 색표(app/classic-dark.css)를 늘 켠다 (b) 페이지마다 색을 다시 쓴다 (c) 어두운 틀 안에 밝은 종이를 둔다.
// (a)로 했다: 내 손이 닿지 않는 부품(검색 결과, 자료 미리보기, 차트)까지 한 번에 같은 색이 되고 11-22에 대비를 재 둔 색표다. 머리와 위키 틀만 판 모양으로 다시 썼고,
// 흰 바탕이어야 하는 것(상담 신청서)은 메인처럼 keep-light 흰 카드에 둔다((c)는 그 카드에만 썼다). 기기 설정은 보지 않는다(기본은 어두운 화면).
const THEME_CLASS = "gp-dark";
const themeScript = `try{localStorage.removeItem('gp-theme');if(localStorage.getItem('gp-color')==='light'){var c=document.documentElement.classList;c.remove('gp-dark');c.add('gp-light');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#ffffff')}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${pretendard.variable} ${THEME_CLASS}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* 11-26 화면 색 선택(사용자 "다크모드 화이트모드 선택도 필요"): 기본은 어두운 화면, 머리글에서 밝은 화면을 고르면 gp-color에 기억한다. 11-22판 사이트에서 밝은 화면을 고른 사람은 gp-theme에 light가 남아 새 사이트도 흰 화면으로 열리므로, 그 값은 지운다.
            그리기 전에 html의 gp-dark를 gp-light로 바꾼다. 밝은 화면 색은 app/classic-light.css, 바꾸는 버튼은 components/classic/ThemeSwitch.tsx */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
        {/* 11-26 구글 태그(gtm.js 약 125KB, 이어서 받는 gtag/js 약 180KB)는 페이지를 다 받은 뒤 브라우저가 한가할 때 싣는다(lazyOnload).
            카카오톡 안 브라우저에서 메인 첫 로딩이 안 된다는 제보로 첫 화면과 함께 받던 것을 뒤로 미뤘다. 수집 조건과 이벤트는 그대로이고, 먼저 일어난 클릭은 dataLayer에 쌓였다가 함께 보낸다 */}
        <Script id="gtm" strategy="lazyOnload">
          {`var gpOff=false;try{var gq=new URLSearchParams(location.search).get('ga');if(gq==='off')localStorage.setItem('gp_ga_off','1');if(gq==='on')localStorage.removeItem('gp_ga_off');gpOff=localStorage.getItem('gp_ga_off')==='1';if(gq==='off'||gq==='on'){var gu=new URL(location.href);gu.searchParams.delete('ga');history.replaceState(null,'',gu.pathname+gu.search+gu.hash);var gn=document.createElement('div');gn.textContent=gq==='off'?'이 브라우저의 방문은 GA에서 제외됩니다':'이 브라우저의 방문을 다시 GA에 기록합니다';gn.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:99999;background:#15171c;color:#fff;padding:12px 18px;border-radius:8px;font-size:15px';document.body.appendChild(gn);setTimeout(function(){gn.remove()},4000)}}catch(e){}
if(!gpOff&&window.self===window.top&&/(^|\\.)gompartner\\.co\\.kr$/.test(location.hostname)&&!navigator.webdriver&&!/HeadlessChrome|bot|crawl|spider|Lighthouse/i.test(navigator.userAgent))(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <CtaTracker />
        <NavMemory />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
