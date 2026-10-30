import type { Metadata } from "next";
import Image from "next/image";
import { channels } from "@/components/classic/ClassicFooter";
import { PageHead, h2, wrap } from "@/components/classic/ui";
import { aboutLead, principles } from "@/data/classic/about";
import { profile } from "@/data/classic/profile";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "회사소개",
  description: `${aboutLead} 업종별 필수 표시, 점검 결과표, 인계 문서, 원본 소스, 한 달 무료 수정. 곰파트너가 일하는 원칙입니다.`,
  path: "/classic/story",
});

const section = "scroll-mt-16 border-t border-[#e6e9ee] md:scroll-mt-[76px]";
const dt = "text-[15px] font-bold text-[#3d4450]";

export default function ClassicStoryPage() {
  return (
    <>
      <PageHead title="회사소개" trail={[{ href: "/classic/story", label: "회사소개" }]} />

      <section aria-labelledby="st-lead" className={`${wrap} py-14 md:py-20`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <Image src="/images/bear-avatar.webp" alt="" width={120} height={120} className="h-20 w-20 shrink-0 rounded-full object-cover md:h-28 md:w-28" />
          <h2 id="st-lead" className="break-keep text-[28px] font-extrabold leading-[1.35] tracking-[-0.04em] md:text-[40px]">
            {aboutLead}
          </h2>
        </div>
      </section>

      <section id="principles" aria-labelledby="st-principles" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="st-principles" className={h2}>
            일하는 원칙
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
            {principles.map((p, n) => (
              <li key={p.title} className="border-t-2 border-[#15171c] pt-5">
                <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{n + 1}</span>
                <p className="mt-2 text-[21px] font-extrabold tracking-[-0.03em] md:text-[24px]">{p.title}</p>
                <p className="mt-2 text-[16px] leading-[1.7] text-[#5b6370] md:text-[17px]">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="info" aria-labelledby="st-info" className={`${section} bg-[#f4f6f9]`}>
        <div className={`${wrap} grid gap-12 py-16 md:grid-cols-2 md:py-24`}>
          <div>
            <h2 id="st-info" className="text-[24px] font-extrabold tracking-[-0.03em]">
              사업자 정보
            </h2>
            <dl className="mt-6 space-y-4 border-t-2 border-[#15171c] pt-5 text-[16px] md:text-[17px]">
              <div>
                <dt className={dt}>상호</dt>
                <dd className="mt-1">{profile.name}</dd>
              </div>
              <div>
                <dt className={dt}>사업자등록번호</dt>
                <dd className="mt-1 tabular-nums">{profile.bizNo}</dd>
              </div>
              <div>
                <dt className={dt}>전화</dt>
                <dd className="mt-1 tabular-nums">
                  <a href={`tel:${profile.phone.replace(/-/g, "")}`} className="hover:text-[#256ef4]">
                    {profile.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className={dt}>이메일</dt>
                <dd className="mt-1">
                  <a href={`mailto:${profile.email}`} className="hover:text-[#256ef4]">
                    {profile.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="text-[24px] font-extrabold tracking-[-0.03em]">운영 채널</h2>
            <ul className="mt-6 border-t-2 border-[#15171c]" role="list">
              {channels.map((c) => (
                <li key={c.href} className="border-b border-[#d9dee5]">
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="block py-4 text-[16px] font-bold hover:text-[#256ef4] md:text-[17px]">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
