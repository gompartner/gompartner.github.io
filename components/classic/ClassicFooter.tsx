import Image from "next/image";
import Link from "next/link";
import { profile } from "@/data/classic/profile";

// 클래식 보기 바닥글. 사업자 정보는 재개업 전까지 두지 않는다.
const menu = [
  { href: "/classic/works", label: "샘플" },
  { href: "/classic/pricing", label: "가격" },
  { href: "/classic/maintenance", label: "유지보수" },
  { href: "/classic/faq", label: "자주 묻는 질문" },
  { href: "/classic/tools", label: "자료실" },
  { href: "/landing", label: "상담 신청" },
];
const channels = [
  { href: "https://blog.naver.com/gompartner", label: "네이버 블로그" },
  { href: "https://gompartner.tistory.com", label: "티스토리" },
  { href: "https://www.youtube.com/@gompartner", label: "유튜브" },
  { href: "https://www.instagram.com/gompartner.co.kr", label: "인스타그램" },
  { href: "https://clip.naver.com/@gompartner", label: "네이버 클립" },
];

export function ClassicFooter() {
  return (
    <footer className="bg-[#15171c] pb-24 text-[15px] text-[#a3abb8] md:pb-0">
      <div className="mx-auto grid w-full max-w-[1248px] gap-10 px-4 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:px-6 md:py-16">
        <div>
          <p className="flex items-center gap-2.5 text-[21px] font-extrabold tracking-[-0.04em] text-white">
            <Image src="/images/bear-avatar.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            {profile.name}
          </p>
          <p className="mt-4">
            <a href={`mailto:${profile.email}`} data-gtm-cta="classic_footer_email" className="hover:text-white">
              {profile.email}
            </a>
          </p>
        </div>
        <nav aria-label="바닥글 메뉴">
          <h2 className="text-[14px] font-bold text-white">메뉴</h2>
          <ul className="mt-4 grid grid-cols-2 gap-y-2.5" role="list">
            {menu.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="hover:text-white">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-[14px] font-bold text-white">채널</h2>
          <ul className="mt-4 grid grid-cols-2 gap-y-2.5" role="list">
            {channels.map((c) => (
              <li key={c.href}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-2 px-4 py-6 text-[14px] md:flex-row md:justify-between md:px-6">
          <Link href="/classic/privacy" className="font-bold text-white hover:underline">
            개인정보처리방침
          </Link>
          <p>© {new Date().getFullYear()} {profile.name}</p>
        </div>
      </div>
    </footer>
  );
}
