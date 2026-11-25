import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/components/classic/NavLink";
import { Mail, Phone, Printer } from "lucide-react";
import { ChannelIcon, type ChannelIconName } from "@/components/layout/Footer";
import { profile } from "@/data/classic/profile";

// 클래식 보기 바닥글. 사업자 정보는 상호와 번호만 둔다(통신판매업 신고 전).
// 11-02 머리글 메뉴와 같은 묶음으로 맞춘다. 11-22 순서도 머리글대로(유지보수 먼저, 업체 변경부터)
// 카카오톡 채널 홈(1:1 채팅 주소에서 /chat을 뺀 것). KakaoChat.tsx는 브라우저용 파일이라 여기(서버에서 그리는 바닥글)로 값을 가져오면 문자열이 아니게 되어 따로 적는다
const KAKAO_CHANNEL_HOME = "https://pf.kakao.com/_JxntWX";

const groups = [
  // 11-26 안쪽을 판 네 개로 다시 만들면서 링크도 판 기준으로 정리
  {
    title: "서비스",
    items: [
      { href: "/make", label: "제작" },
      { href: "/maintenance", label: "유지보수" },
      { href: "/pricing", label: "비용" },
      { href: "/works", label: "카탈로그" },
      { href: "/3d", label: "3D 웹" },
    ],
  },
  {
    title: "운영 서비스",
    items: [
      { href: "https://jikimi.gompartner.co.kr/", label: "사이트 지킴이" },
      { href: "https://jangbu.gompartner.co.kr/", label: "거래장부" },
    ],
  },
  {
    title: "곰파트너",
    items: [
      { href: "/story", label: "회사소개" },
      { href: "/notice", label: "공지사항" },
      { href: "/faq", label: "자주 묻는 질문" },
      { href: "/knowledge", label: "웹 지식" },
    ],
  },
];
// 11-11 바닥글 채널 칸은 내림(사이트는 직접 쓴 글만, 채널 링크 없음). 아래 목록은 인사이트 이름표용으로만 남김
// 11-07 채널마다 그 채널에서만 하는 일을 이름으로, 서비스 이름은 아래 작은 줄로(채널끼리는 서로 잇지 않고 사이트에서만 모은다)
export const channels: { href: string; label: string; handle: string; icon: ChannelIconName }[] = [
  { href: "https://blog.naver.com/gompartner", label: "운영 점검", handle: "네이버 블로그", icon: "naverBlog" },
  { href: "https://gompartner.tistory.com", label: "기술 블로그", handle: "티스토리", icon: "tistory" },
  { href: "https://www.youtube.com/@gompartner", label: "AI 사이트 직접 해 보기", handle: "유튜브", icon: "youtube" },
  { href: "https://www.instagram.com/gompartner.co.kr", label: "UI 용어 숏츠", handle: "인스타그램", icon: "instagram" },
  { href: "https://clip.naver.com/@gompartner", label: "30초 점검", handle: "네이버 클립", icon: "naverClip" },
];

const contactRow = "-my-1.5 inline-flex items-center gap-2 py-1.5";
const contactIcon = "shrink-0 text-[#7d8594]";

export function ClassicFooter() {
  return (
    <footer className="bg-[#15171c] pb-24 text-[15px] text-[#a3abb8] md:pb-0">
      <div className="mx-auto grid w-full max-w-[1248px] grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 md:grid-cols-3 md:px-6 md:py-16 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <p className="flex items-center gap-2.5 text-[21px] font-[800] tracking-[-0.04em] text-white">
            <Image src="/images/bear-avatar.webp" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
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
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1248px] flex-col gap-2 px-4 py-6 text-[14px] md:flex-row md:justify-between md:px-6">
          <div className="flex flex-wrap items-center gap-x-5">
            <Link href="/privacy" className="inline-flex min-h-11 items-center self-start font-bold text-white hover:underline">
              개인정보처리방침
            </Link>
            {/* 11-18 채널 링크는 유튜브 하나만 다시 넣음(사이트 손님과 보는 사람이 같음) */}
            <a href="https://www.youtube.com/@gompartner" target="_blank" rel="noopener noreferrer" data-gtm-cta="classic_footer_youtube" className="inline-flex min-h-11 items-center gap-1.5 self-start hover:text-white hover:underline">
              <ChannelIcon name="youtube" />
              유튜브
            </a>
            {/* 11-25 사용자: 유튜브 옆에 네이버 블로그, 카카오톡(11-21에 뺀 블로그 링크를 다시 넣음). 카카오톡은 1:1 채팅이 아니라 채널 홈으로. English 링크는 뺌 */}
            <a href="https://blog.naver.com/gompartner" target="_blank" rel="noopener noreferrer" data-gtm-cta="classic_footer_blog" className="inline-flex min-h-11 items-center gap-1.5 self-start hover:text-white hover:underline">
              <ChannelIcon name="naverBlog" />
              네이버 블로그
            </a>
            <a href={KAKAO_CHANNEL_HOME} target="_blank" rel="noopener noreferrer" data-gtm-cta="classic_footer_kakao" className="inline-flex min-h-11 items-center gap-1.5 self-start hover:text-white hover:underline">
              <ChannelIcon name="kakao" />
              카카오톡
            </a>
          </div>
          <div className="md:text-right">
            <p>
              상호 {profile.name} | 사업자등록번호 {profile.bizNo} | 서울 관악구
            </p>
            {/* 키보드로 칠 수 있는 기호만 쓴다(저작권 기호 대신 Copyright) */}
            <p className="mt-1">Copyright {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
