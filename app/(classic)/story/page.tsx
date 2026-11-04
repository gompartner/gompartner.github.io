import type { Metadata } from "next";
import { ArrowUpRight, Award, ClipboardCheck, FileText, KeyRound, ScrollText, ShieldCheck } from "lucide-react";
import { NavLink } from "@/components/classic/NavLink";
import { PageHead, h2, wrap } from "@/components/classic/ui";
import { aboutLead, aboutTitle, principles } from "@/data/classic/about";
import { awards, careerGroups, careerIntro } from "@/data/classic/career";
import { profile } from "@/data/classic/profile";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "회사소개",
  description: `곰파트너 ${aboutTitle}. ${aboutLead}`,
  path: "/story",
});

const section = "scroll-mt-16 border-t border-[#e6e9ee] md:scroll-mt-[76px]";
const dt = "text-[15px] font-bold text-[#3d4450]";

// 11-01 다른 업체 회사소개 비교: 소개, 일하는 방식, 사업 영역, 연락 방법 순. 사업자 정보와 채널은 바닥글에 있어 본문에서 뺌
const areas = [
  { href: "/homepage", name: "홈페이지 제작", what: "병원, 매장, 전문직, 기업, 학원 반응형 홈페이지" },
  { href: "/landing-page", name: "랜딩페이지 제작", what: "광고 신청 접수와 알림, 구글 시트 기록" },
  { href: "/program", name: "업무 프로그램 제작", what: "엑셀 반복 업무를 웹 프로그램으로" },
  { href: "/app", name: "앱 제작", what: "아이폰, 안드로이드 앱과 설치형 웹앱" },
  { href: "/kiosk", name: "키오스크 화면 제작", what: "접수, 출결, 체크인, 안내 키오스크" },
  { href: "/3d", name: "3D 웹 제작", what: "손님이 직접 구성하는 3D 제품 화면과 견적 접수" },
  { href: "/maintenance", name: "유지보수", what: "오류 수정, 업체 이관, 보안 업데이트, 월 관리" },
];

export default function ClassicStoryPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "회사소개", path: "/story" }])} />
      <PageHead title="회사소개" trail={[{ href: "/story", label: "회사소개" }]} />

      <section aria-labelledby="st-lead" className={`${wrap} py-14 md:py-20`}>
        <h2 id="st-lead" className="break-keep text-[28px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[40px]">
          {aboutTitle}
        </h2>
        <p className="mt-3 max-w-[760px] break-keep text-[17px] leading-[1.75] text-[#3d4450] md:text-[19px]">{aboutLead}</p>
      </section>

      <section id="principles" aria-labelledby="st-principles" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="st-principles" className={h2}>
            일하는 방식
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

      <section id="career" aria-labelledby="st-career" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="st-career" className={h2}>
            주요 경력
          </h2>
          <p className="mt-3 max-w-[760px] break-keep text-[17px] leading-[1.75] text-[#3d4450]">{careerIntro}</p>
          <div className="mt-10 grid gap-10">
            {careerGroups.map((g) => (
              <div key={g.group}>
                <h3 className="text-[15px] font-bold text-[#256ef4]">{g.group}</h3>
                <ul className="mt-3 grid border-t-2 border-[#15171c] md:grid-cols-2 md:gap-x-10" role="list">
                  {g.items.map((c) => (
                    <li key={c.client} className="grid gap-y-1 border-b border-[#d9dee5] py-5 md:py-6">
                      <span className="break-keep text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">{c.client}</span>
                      <span className="break-keep text-[16px] leading-[1.7] text-[#3d4450] md:text-[17px]">{c.work}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mt-16 text-[22px] font-[800] tracking-[-0.03em] md:text-[26px]">수상</h3>
          <ul className="mt-6 grid gap-4 md:grid-cols-2" role="list">
            {awards.map((a) => (
              <li key={a.prize} className="flex gap-4 rounded-md border border-[#d9dee5] p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8efff] text-[#256ef4]">
                  <Award size={22} aria-hidden />
                </span>
                <span>
                  <span className="block break-keep text-[19px] font-[800] tracking-[-0.03em]">{a.prize}</span>
                  <span className="mt-1 block break-keep text-[16px] leading-[1.6] text-[#3d4450]">{a.name}, {a.note}</span>
                </span>
              </li>
            ))}
          </ul>
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
                <NavLink href={a.href} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,320px)_1fr_auto] md:py-8">
                  <h3 className="col-start-1 row-start-1 text-[22px] font-[800] tracking-[-0.04em] group-hover:text-[#256ef4] md:text-[30px]">{a.name}</h3>
                  <p className="col-start-1 row-start-2 text-[16px] text-[#5b6370] md:col-start-2 md:row-start-1 md:text-[17px]">{a.what}</p>
                  <ArrowUpRight size={26} aria-hidden className="col-start-2 row-span-2 row-start-1 self-center text-[#6b7280] group-hover:text-[#256ef4] md:col-start-3 md:row-span-1" />
                </NavLink>
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
                <NavLink href="/contact" className="hover:text-[#256ef4]">
                  상담 신청 페이지
                </NavLink>
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
          <p className="mt-4 text-[16px] font-bold text-[#3d4450]">영업일 기준 24시간 이내 회신</p>
        </div>
      </section>
    </>
  );
}
