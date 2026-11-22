import type { Metadata } from "next";
import { Award } from "lucide-react";
import { PageHead, h2, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { aboutLead, aboutTitle, principles } from "@/data/classic/about";
import { awards, careerGroups, careerIntro } from "@/data/classic/career";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "회사소개",
  description: `곰파트너 ${aboutTitle}. ${aboutLead}`,
  path: "/story",
});

const section = "scroll-mt-16 border-t border-[#e6e9ee] md:scroll-mt-[76px]";
// 11-22 사용자 "너무 주저리": 소개 한 줄, 원칙 다섯 줄, 경력은 분야별 앞 몇 건만 보이고 나머지는 펼쳐 보기.
// 사업 영역, 연락처 칸은 머리글 메뉴, 바닥글, 공통 상담 띠와 겹쳐 뺐다.
const SHOW = 4;

export default function ClassicStoryPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "회사소개", path: "/story" }])} />
      <PageHead title="회사소개" trail={[{ href: "/story", label: "곰파트너" }, { href: "/story", label: "회사소개" }]} />
      <SupportTabs current="/story" />

      <section aria-labelledby="st-lead" className={`${wrap} py-14 md:py-20`}>
        <h2 id="st-lead" className="break-keep text-[28px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[40px]">
          {aboutTitle}
        </h2>
        <p className="mt-3 max-w-[760px] break-keep text-[17px] leading-[1.75] text-[#3d4450] md:text-[19px]">{aboutLead}</p>
      </section>

      <section id="principles" aria-labelledby="st-principles" className={section}>
        <div className={`${wrap} py-14 md:py-20`}>
          <h2 id="st-principles" className={h2}>
            일하는 방식
          </h2>
          <dl className="mt-8 border-t-2 border-[#15171c]">
            {principles.map((p) => (
              <div key={p.title} className="grid gap-1 border-b border-[#d9dee5] py-5 md:grid-cols-[280px_1fr] md:gap-8">
                <dt className="break-keep text-[18px] font-[800] tracking-[-0.03em] md:text-[19px]">{p.title}</dt>
                <dd className="break-keep text-[16px] leading-[1.7] text-[#3d4450] md:text-[17px]">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="career" aria-labelledby="st-career" className={section}>
        <div className={`${wrap} py-14 md:py-20`}>
          <h2 id="st-career" className={h2}>
            대표 경력
          </h2>
          <p className="mt-3 max-w-[760px] break-keep text-[17px] leading-[1.75] text-[#3d4450]">{careerIntro}</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {careerGroups.map((g) => (
              <div key={g.group}>
                <h3 className="border-b-2 border-[#15171c] pb-2 text-[17px] font-[800]">
                  {g.group} <span className="font-bold text-[#256ef4]">{g.items.length}</span>
                </h3>
                <ul role="list">
                  {g.items.slice(0, SHOW).map((c) => (
                    <li key={c.client + c.work} className="border-b border-[#e6e9ee] py-3">
                      <span className="block break-keep text-[16px] font-bold">{c.client}</span>
                      <span className="block break-keep text-[15px] leading-[1.6] text-[#5b6370]">{c.work}</span>
                    </li>
                  ))}
                </ul>
                {g.items.length > SHOW && (
                  <details className="group">
                    <summary className="cursor-pointer list-none py-3 text-[15px] font-bold text-[#256ef4] [&::-webkit-details-marker]:hidden">
                      <span className="group-open:hidden">나머지 {g.items.length - SHOW}건 보기</span>
                      <span className="hidden group-open:inline">접기</span>
                    </summary>
                    <ul role="list">
                      {g.items.slice(SHOW).map((c) => (
                        <li key={c.client + c.work} className="border-b border-[#e6e9ee] py-3">
                          <span className="block break-keep text-[16px] font-bold">{c.client}</span>
                          <span className="block break-keep text-[15px] leading-[1.6] text-[#5b6370]">{c.work}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>

          <h3 className="mt-12 text-[19px] font-[800] tracking-[-0.03em]">수상</h3>
          <ul className="mt-4 grid gap-3 md:grid-cols-2" role="list">
            {awards.map((a) => (
              <li key={a.prize} className="flex items-center gap-3 rounded-md border border-[#d9dee5] px-5 py-4">
                <Award size={20} aria-hidden className="shrink-0 text-[#256ef4]" />
                <span className="break-keep text-[16px]">
                  <b className="font-[800]">{a.prize}</b> <span className="text-[#5b6370]">{a.name}, {a.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
