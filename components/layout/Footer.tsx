import Image from "next/image";
import Link from "next/link";
import { profile } from "@/data/profile";

const menu = [
  { href: "/works", label: "제작 사례" },
  { href: "/pricing", label: "가격" },
  { href: "/maintenance", label: "유지보수" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/career", label: "주요 경력" },
  { href: "/tools", label: "자료실" },
];

const link = "underline-offset-4 hover:text-foreground hover:underline";

// 곰파트너 채널. 네이버 블로그는 운영 정보 글, 티스토리는 제작 일지, 인스타그램·유튜브·네이버 클립은 샘플 숏츠다.
const channels = [
  { href: "https://blog.naver.com/gompartner", label: "네이버 블로그", cta: "footer_blog_naver", icon: "naverBlog" },
  { href: "https://gompartner.tistory.com", label: "티스토리", cta: "footer_blog_tistory", icon: "tistory" },
  { href: "https://www.instagram.com/gompartner.co.kr", label: "인스타그램", cta: "footer_instagram", icon: "instagram" },
  { href: "https://www.youtube.com/@gompartner", label: "유튜브", cta: "footer_youtube", icon: "youtube" },
  { href: "https://clip.naver.com/@gompartner", label: "네이버 클립", cta: "footer_naver_clip", icon: "naverClip" },
] as const;

function ChannelIcon({ name }: { name: (typeof channels)[number]["icon"] }) {
  const box = "h-5 w-5 shrink-0";
  switch (name) {
    case "naverBlog":
      return (
        <svg viewBox="0 0 20 20" className={box} aria-hidden>
          <rect width="20" height="20" rx="5" fill="#03c75a" />
          <path d="M6.5 5v10h3.2c2 0 3.3-1.1 3.3-2.8 0-1.2-.7-2-1.7-2.3.8-.4 1.3-1.1 1.3-2 0-1.6-1.2-2.9-3.1-2.9H6.5Zm2 1.8h.9c.8 0 1.2.4 1.2 1.1s-.4 1.2-1.2 1.2h-.9V6.8Zm0 3.9h1.1c.9 0 1.4.5 1.4 1.2s-.5 1.3-1.4 1.3H8.5v-2.5Z" fill="#fff" />
        </svg>
      );
    case "tistory":
      return (
        <svg viewBox="0 0 20 20" className={box} aria-hidden>
          <rect width="20" height="20" rx="5" fill="#eb531f" />
          <circle cx="7" cy="7" r="1.6" fill="#fff" /><circle cx="10" cy="7" r="1.6" fill="#fff" /><circle cx="13" cy="7" r="1.6" fill="#fff" />
          <circle cx="10" cy="10.5" r="1.6" fill="#fff" /><circle cx="10" cy="14" r="1.6" fill="#fff" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 20 20" className={box} aria-hidden>
          <defs>
            <linearGradient id="ig-bg" x1="0" y1="20" x2="20" y2="0">
              <stop offset="0" stopColor="#feda75" />
              <stop offset=".35" stopColor="#fa7e1e" />
              <stop offset=".6" stopColor="#d62976" />
              <stop offset="1" stopColor="#4f5bd5" />
            </linearGradient>
          </defs>
          <rect width="20" height="20" rx="5" fill="url(#ig-bg)" />
          <rect x="4.5" y="4.5" width="11" height="11" rx="3.2" fill="none" stroke="#fff" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2.6" fill="none" stroke="#fff" strokeWidth="1.5" />
          <circle cx="13.4" cy="6.6" r=".9" fill="#fff" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 20 20" className={box} aria-hidden>
          <rect y="3" width="20" height="14" rx="4" fill="#ff0000" />
          <path d="M8 6.8v6.4l5.4-3.2L8 6.8Z" fill="#fff" />
        </svg>
      );
    case "naverClip":
      return (
        <svg viewBox="0 0 20 20" className={box} aria-hidden>
          <rect width="20" height="20" rx="5" fill="#03c75a" />
          <rect x="5" y="4" width="10" height="12" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.6" />
          <path d="M8.6 7.6v4.8l3.8-2.4-3.8-2.4Z" fill="#fff" />
        </svg>
      );
  }
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const blogs = channels.slice(0, 2);
  const social = channels.slice(2);

  const channelList = (items: readonly (typeof channels)[number][], label: string) => (
    <div>
      <h2 className="text-[15px] font-bold text-foreground">{label}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((c) => (
          <li key={c.href}>
            <a href={c.href} target="_blank" rel="noopener" data-gtm-cta={c.cta} className={`inline-flex items-center gap-2 text-foreground-secondary ${link}`}>
              <ChannelIcon name={c.icon} />
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-10 text-[15px] leading-[1.6] text-foreground-tertiary md:px-6 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.4fr_1.4fr_1fr_1fr] md:gap-x-10">
          <div className="col-span-2 md:col-span-1">
            <p className="inline-flex items-center gap-2 text-[17px] font-bold text-foreground">
              <Image src="/images/logo.svg" alt="" width={24} height={24} className="h-6 w-6" />
              {profile.name}
            </p>
            <p className="mt-3">홈페이지 제작 · 업무 프로그램 개발</p>
            <p className="mt-1">
              <a href={`mailto:${profile.email}`} data-gtm-cta="footer_email" className={link}>
                {profile.email}
              </a>
            </p>
          </div>

          <nav aria-label="바닥글 메뉴" className="col-span-2 md:col-span-1">
            <h2 className="text-[15px] font-bold text-foreground">메뉴</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-foreground-secondary">
              {menu.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className={link}>
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {channelList(blogs, "블로그")}
          {channelList(social, "SNS")}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <Link href="/privacy" className={`font-bold text-foreground ${link}`}>
            개인정보처리방침
          </Link>
          <p>
            © {currentYear} {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
