import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/components/classic/NavLink";
import { Globe, Mail, Phone, Printer } from "lucide-react";
import { ChannelIcon, type ChannelIconName } from "@/components/layout/Footer";
import { profile } from "@/data/classic/profile";

// 클래식 보기 바닥글. 사업자 정보는 상호와 번호만 둔다(통신판매업 신고 전).
// 11-02 머리글 메뉴(제작, 유지보수, 고객지원)와 같은 묶음으로 맞춘다
const groups = [
  {
    title: "제작",
    items: [
      { href: "/homepage", label: "홈페이지 제작" },
      { href: "/landing-page", label: "랜딩페이지 제작" },
      { href: "/program", label: "업무 프로그램 제작" },
      { href: "/app", label: "앱 제작" },
      { href: "/kiosk", label: "키오스크 화면 제작" },
      { href: "/3d", label: "3D 웹 제작" },
    ],
  },
  {
    title: "유지보수",
    items: [
      { href: "/maintenance/fix", label: "오류 수정" },
      { href: "/maintenance/takeover", label: "업체 이관" },
      { href: "/maintenance/update", label: "보안 업데이트" },
      { href: "/maintenance/monthly", label: "월 관리" },
    ],
  },
  {
    title: "곰파트너",
    items: [
      { href: "/story", label: "회사소개" },
      { href: "/works", label: "카탈로그" },
      { href: "/notice", label: "공지사항" },
      { href: "/insight", label: "인사이트" },
      { href: "/tools", label: "자료실" },
      { href: "/faq", label: "자주 묻는 질문" },
      { href: "/contact", label: "상담 신청" },
    ],
  },
];
// 11-03 채널은 아이콘, 이름, 계정명. 계정명이 보여야 앱에서 바로 찾는다
export const channels: { href: string; label: string; handle: string; icon: ChannelIconName }[] = [
  { href: "https://www.instagram.com/gompartner.co.kr", label: "인스타그램", handle: "@gompartner.co.kr", icon: "instagram" },
  { href: "https://www.youtube.com/@gompartner", label: "유튜브", handle: "@gompartner", icon: "youtube" },
  { href: "https://clip.naver.com/@gompartner", label: "네이버 클립", handle: "@gompartner", icon: "naverClip" },
  { href: "https://blog.naver.com/gompartner", label: "네이버 블로그", handle: "gompartner", icon: "naverBlog" },
  { href: "https://gompartner.tistory.com", label: "티스토리", handle: "gompartner", icon: "tistory" },
];

const contactRow = "-my-1.5 inline-flex items-center gap-2 py-1.5";
const contactIcon = "shrink-0 text-[#7d8594]";

export function ClassicFooter() {
  return (
    <footer className="bg-[#15171c] pb-24 text-[15px] text-[#a3abb8] md:pb-0">
      <div className="mx-auto grid w-full max-w-[1248px] grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 md:grid-cols-4 md:px-6 md:py-16 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <p className="flex items-center gap-2.5 text-[21px] font-[800] tracking-[-0.04em] text-white">
            <Image src="/images/bear-avatar.webp" alt="곰파트너 곰 캐릭터" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            {profile.name}
          </p>
          <p className="mt-4">
            <a href={`tel:${profile.phone.replace(/-/g, "")}`} data-gtm-cta="classic_footer_tel" className={`${contactRow} hover:text-white`}>
              <Phone size={16} aria-hidden className={contactIcon} />
              전화 {profile.phone}
            </a>
          </p>
          {profile.fax && (
            <p className="mt-1">
              <span className={contactRow}>
                <Printer size={16} aria-hidden className={contactIcon} />
                팩스 {profile.fax}
              </span>
            </p>
          )}
          <p className="mt-1">
            <a href={`mailto:${profile.email}`} data-gtm-cta="classic_footer_email" className={`${contactRow} hover:text-white`}>
              <Mail size={16} aria-hidden className={contactIcon} />
              이메일 {profile.email}
            </a>
          </p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={`바닥글 ${g.title} 메뉴`}>
            <h2 className="text-[14px] font-bold text-white">{g.title}</h2>
            <ul className="mt-4 grid gap-y-2.5" role="list">
              {g.items.map((m) => (
                <li key={m.href}>
                  <NavLink href={m.href} className="-my-1.5 inline-block py-1.5 hover:text-white">
                    {m.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="text-[14px] font-bold text-white">채널</h2>
          <ul className="mt-4 grid gap-y-2.5" role="list">
            {channels.map((c) => (
              <li key={c.href}>
                <a href={c.href} target="_blank" rel="noopener noreferrer" data-gtm-cta={`classic_footer_${c.icon}`} className="group -my-1.5 flex items-start gap-2 py-1.5 hover:text-white">
                  <span className="mt-[2px]">
                    <ChannelIcon name={c.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block">{c.label}</span>
                    <span className="block whitespace-nowrap text-[14px] text-[#7d8594] group-hover:text-[#c9ced8]">{c.handle}</span>
                    <span className="sr-only"> (새 창)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-2 px-4 py-6 text-[14px] md:flex-row md:justify-between md:px-6">
          <div className="flex flex-wrap items-center gap-x-5">
            <Link href="/privacy" className="inline-flex min-h-11 items-center self-start font-bold text-white hover:underline">
              개인정보처리방침
            </Link>
            <Link href="/en" lang="en" hrefLang="en" className="inline-flex min-h-11 items-center gap-1.5 self-start hover:text-white hover:underline">
              <Globe size={15} strokeWidth={2} aria-hidden />
              English
            </Link>
          </div>
          <div className="md:text-right">
            <p>
              상호 {profile.name} | 사업자등록번호 {profile.bizNo}
            </p>
            {/* 키보드로 칠 수 있는 기호만 쓴다(저작권 기호 대신 Copyright) */}
            <p className="mt-1">Copyright {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
