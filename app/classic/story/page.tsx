import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, ClipboardCheck, FileText, KeyRound, ScrollText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PageHead, h2, wrap } from "@/components/classic/ui";
import { aboutLead, aboutTitle, principles } from "@/data/classic/about";
import { profile } from "@/data/classic/profile";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "회사소개",
  description: `곰파트너 ${aboutTitle}. ${aboutLead}`,
  path: "/classic/story",
});

const section = "scroll-mt-16 border-t border-[#e6e9ee] md:scroll-mt-[76px]";
const dt = "text-[15px] font-bold text-[#3d4450]";

// 11-01 다른 업체 회사소개 비교: 소개, 일하는 방식, 사업 영역, 연락 방법 순. 사업자 정보와 채널은 바닥글에 있어 본문에서 뺌
const areas = [
  { href: "/classic/homepage", name: "홈페이지 제작", what: "병원, 매장, 전문직, 기업, 학원 반응형 홈페이지" },
  { href: "/classic/maintenance", name: "유지보수", what: "오류 수정, 업체 이관, 보안 업데이트, 월 관리" },
];

export default function ClassicStoryPage() {
  return (
    <>
      <PageHead title="회사소개" trail={[{ href: "/classic/story", label: "회사소개" }]} />

      <section aria-labelledby="st-lead" className={`${wrap} py-14 md:py-20`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <Image src="/images/bear-avatar.webp" alt="" width={120} height={120} className="h-20 w-20 shrink-0 rounded-full object-cover md:h-28 md:w-28" />
          <div>
            <h2 id="st-lead" className="break-keep text-[28px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[40px]">
              {aboutTitle}
            </h2>
            <p className="mt-3 max-w-[760px] break-keep text-[17px] leading-[1.75] text-[#3d4450] md:text-[19px]">{aboutLead}</p>
          </div>
        </div>
      </section>

      <section id="principles" aria-labelledby="st-principles" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="st-principles" className={h2}>
            곰파트너의 약속
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
            {principles.map((p, n) => {
              // 이 페이지의 디자인 포인트(10-30): 원칙마다 아이콘
              const Icon = [ScrollText, KeyRound, ClipboardCheck, FileText, ShieldCheck][n] ?? ShieldCheck;
              return (
              <li key={p.title} className="border-t-2 border-[#15171c] pt-5">
                <span className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e8efff] text-[#256ef4]">
                    <Icon size={22} aria-hidden />
                  </span>
                  <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{n + 1}</span>
                </span>
                <h3 className="mt-3 text-[21px] font-[800] tracking-[-0.03em] md:text-[24px]">{p.title}</h3>
                <p className="mt-2 text-[16px] leading-[1.7] text-[#5b6370] md:text-[17px]">{p.body}</p>
              </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="areas" aria-labelledby="st-areas" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="st-areas" className={h2}>
            사업 영역
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {areas.map((a) => (
              <li key={a.href} className="border-b border-[#d9dee5]">
                <Link href={a.href} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,320px)_1fr_auto] md:py-8">
                  <h3 className="col-start-1 row-start-1 text-[22px] font-[800] tracking-[-0.04em] group-hover:text-[#256ef4] md:text-[30px]">{a.name}</h3>
                  <p className="col-start-1 row-start-2 text-[16px] text-[#5b6370] md:col-start-2 md:row-start-1 md:text-[17px]">{a.what}</p>
                  <ArrowUpRight size={26} aria-hidden className="col-start-2 row-span-2 row-start-1 self-center text-[#6b7280] group-hover:text-[#256ef4] md:col-start-3 md:row-span-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" aria-labelledby="st-contact" className={`${section} bg-[#f4f6f9]`}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="st-contact" className={h2}>
            연락 방법
          </h2>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-md border border-[#d9dee5] bg-[#d9dee5] sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6">
              <dt className={dt}>상담 신청</dt>
              <dd className="mt-2 text-[18px] font-bold">
                <Link href="/classic/contact" className="hover:text-[#256ef4]">
                  상담 신청 페이지
                </Link>
              </dd>
            </div>
            <div className="bg-white p-6">
              <dt className={dt}>전화</dt>
              <dd className="mt-2 text-[18px] font-bold tabular-nums">
                <a href={`tel:${profile.phone.replace(/-/g, "")}`} className="hover:text-[#256ef4]">
                  {profile.phone}
                </a>
              </dd>
            </div>
            {profile.fax && (
              <div className="bg-white p-6">
                <dt className={dt}>팩스</dt>
                <dd className="mt-2 text-[18px] font-bold tabular-nums">{profile.fax}</dd>
              </div>
            )}
            <div className="bg-white p-6">
              <dt className={dt}>이메일</dt>
              <dd className="mt-2 break-all text-[18px] font-bold">
                <a href={`mailto:${profile.email}`} className="hover:text-[#256ef4]">
                  {profile.email}
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-[16px] font-bold text-[#3d4450]">24시간 이내 회신</p>
        </div>
      </section>
    </>
  );
}
