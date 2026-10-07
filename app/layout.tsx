import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { CtaTracker } from "@/components/analytics/CtaTracker";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { profile } from "@/data/profile";
import { GTM_ID } from "@/lib/analytics";
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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// 메인 첫 화면 문구와 맞춘 사이트 제목·설명
const siteTitle = `홈페이지·업무 프로그램 제작 | ${profile.name}`;
const siteDescription =
  "쇼핑몰, 펜션, 회사, 병원 홈페이지와 업무 프로그램을 직접 만듭니다. 원본 소스를 제공하고 완료 후 1개월 동안 오류를 무상으로 수정합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${profile.name}`,
  },
  description: siteDescription,
  keywords: [
    "홈페이지 제작",
    "업무 프로그램 개발",
    "홈페이지 유지보수",
    "홈페이지 리뉴얼",
    "공공기관 홈페이지",
    "병원 홈페이지 제작",
    "예약 시스템 개발",
    "웹접근성 개선",
    "1인 개발자 외주",
    profile.name,
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: profile.name,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png?v=20261008",
        width: 1200,
        height: 630,
        alt: `${profile.name} 홈페이지·업무 프로그램 제작`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.png?v=20261008"],
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
      className={`${pretendard.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
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
