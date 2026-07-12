import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { CtaTracker } from "@/components/analytics/CtaTracker";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { profile } from "@/data/profile";
import { GTM_ID } from "@/lib/analytics";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gompartner.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — 사업에 필요한 웹사이트, 빠르게 만들고 오래 운영합니다`,
    template: `%s | ${profile.name}`,
  },
  description: profile.bio,
  keywords: [
    "소상공인 웹사이트",
    "이벤트 페이지",
    "웹사이트 유지보수",
    "마케팅 페이지",
    "백엔드 개발자",
    "웹 에이전시",
    profile.name,
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: `${profile.name} Portfolio`,
    title: `${profile.name} — 사업에 필요한 웹사이트, 빠르게 만들고 오래 운영합니다`,
    description: profile.bio,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${profile.name} 포트폴리오`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — 사업에 필요한 웹사이트, 빠르게 만들고 오래 운영합니다`,
    description: profile.bio,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: siteUrl,
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
