import { Check } from "lucide-react";
import { DeliverBlock } from "@/components/classic/DeliverBlock";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { OtherServices } from "@/components/classic/OtherServices";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, h2, h3, wrap } from "@/components/classic/ui";
import { LdScript } from "@/components/seo/JsonLd";
import { replyTerm } from "@/data/classic/maintenance";
import type { MakeExtra } from "@/data/classic/makeExtra";
import { breadcrumbLd, serviceLd } from "@/lib/seo";

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";

// 앱 제작, 키오스크 화면 제작 공용 페이지(11-01). 랜딩, 업무 프로그램 페이지와 같은 틀
export function MakeExtraPage({ s }: { s: MakeExtra }) {
  const path = `/classic/${s.id}`;
  return (
    <>
      <LdScript data={[serviceLd(s.title, s.metaDescription, path), breadcrumbLd([{ name: "서비스", path: "/classic/homepage" }, { name: s.title, path }])]} />
      <PageHead
        title={s.title}
        trail={[
          { href: "/classic/homepage", label: "서비스" },
          { href: path, label: s.title },
        ]}
      />
      <SubTabs items={serviceTabs} current={path} />

      <section aria-labelledby={`${s.id}-lead`} className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-2 border-b-2 border-[#15171c] pb-5 md:flex-row md:items-end md:justify-between">
          <h2 id={`${s.id}-lead`} className={h3}>
            {s.lead}
          </h2>
          <p className="shrink-0 text-[15px] font-bold text-[#256ef4]">{replyTerm}</p>
        </div>
      </section>

      <section aria-labelledby={`${s.id}-whom`} className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id={`${s.id}-whom`} className={h2}>
            도입이 필요한 경우
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {s.forWhom.map((t) => (
              <li key={t} className="flex gap-3 border-b border-[#e6e9ee] py-5 text-[17px] font-bold leading-[1.55] md:py-6 md:text-[19px]">
                <Check size={22} strokeWidth={2.5} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby={`${s.id}-scope`} className={`${section} bg-[#f4f6f9]`}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id={`${s.id}-scope`} className={h2}>
            구현 범위
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-12 lg:grid-cols-4 lg:gap-x-8">
            {s.scope.map((g) => (
              <div key={g.title} className="border-t-2 border-[#15171c] pt-5">
                <h3 className="text-[20px] font-[800] tracking-[-0.03em] md:text-[21px]">{g.title}</h3>
                <ul className="mt-3 space-y-2 text-[16px] leading-[1.6] text-[#3d4450]" role="list">
                  {g.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Check size={18} strokeWidth={2.5} aria-hidden className="mt-[3px] shrink-0 text-[#256ef4]" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StepList steps={s.steps} title="진행 절차" id="process" />

      <DeliverBlock id={`${s.id}-deliver`} name={s.deliver.name} items={s.deliver.items} photo={s.photo} />

      <FaqBlock items={s.faq} id={`${s.id}-faq`} />

      <OtherServices current={path} />
    </>
  );
}
