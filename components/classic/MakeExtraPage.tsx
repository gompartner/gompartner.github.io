import { Check } from "lucide-react";
import { DeliverBlock } from "@/components/classic/DeliverBlock";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { OtherServices } from "@/components/classic/OtherServices";
import { StepList } from "@/components/classic/pricing/StepList";
import { PlanTable } from "@/components/classic/pricing/PlanTable";
import { appCommon, appPlans, kioskCommon, kioskPlans } from "@/data/classic/pricing";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, h2, h3, wrap } from "@/components/classic/ui";
import { LdScript } from "@/components/seo/JsonLd";
import { replyTerm } from "@/data/classic/maintenance";
import type { MakeExtra } from "@/data/classic/makeExtra";
import { breadcrumbLd, serviceLd } from "@/lib/seo";

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";

// 앱 제작, 키오스크 화면 제작 공용 페이지(11-01). 랜딩, 업무 프로그램 페이지와 같은 틀
export function MakeExtraPage({ s }: { s: MakeExtra }) {
  const path = `/${s.id}`;
  return (
    <>
      <LdScript data={[serviceLd(s.title, s.metaDescription, path), breadcrumbLd([{ name: "제작", path: "/homepage" }, { name: s.title, path }])]} />
      <PageHead
        title={s.title}
        trail={[
          { href: "/homepage", label: "제작" },
          { href: path, label: s.title },
        ]}
      />
      <SubTabs items={serviceTabs} current={path} />

      <section aria-labelledby={`${s.id}-lead`} className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-2 border-b-2 border-[#15171c] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id={`${s.id}-lead`} className={h3}>
              {s.lead}
            </h2>
            {s.leadNote && <p className="mt-2 text-[16px] leading-[1.6] text-[#5b6370] md:text-[17px]">{s.leadNote}</p>}
          </div>
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

      <section id="plans" aria-labelledby={`${s.id}-plans`} className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id={`${s.id}-plans`} className={h2}>
            패키지
          </h2>
          {s.planNote && <p className="mt-4 text-[16px] leading-[1.6] text-[#3d4450] md:text-[17px]">{s.planNote}</p>}
          <PlanTable plans={s.id === "app" ? appPlans : kioskPlans} product={s.title} common={s.id === "app" ? appCommon : kioskCommon} />
          <p className="mt-6 text-[15px] leading-[1.65] text-[#5b6370] md:text-[16px]">
            {s.id === "app"
              ? "애플(연 99달러), 구글(1회 25달러) 개발자 계정 비용과 서버, 호스팅 비용은 고객 명의로 따로 듭니다. 표시한 금액 외에 별도로 받는 비용은 없고, 기능을 더할 때만 추가 비용이 발생합니다."
              : "키오스크 장비, 프린터, 스캐너는 고객이 준비하시고, 사양을 먼저 확인해 맞춥니다. 표시한 금액 외에 별도로 받는 비용은 없고, 기능을 더할 때만 추가 비용이 발생합니다."}
          </p>
        </div>
      </section>


      <StepList steps={s.steps} title="진행 절차" id="process" />

      <DeliverBlock id={`${s.id}-deliver`} name={s.deliver.name} items={s.deliver.items} photo={s.photo} />

      <FaqBlock items={s.faq} id={`${s.id}-faq`} />

      <OtherServices current={path} />
    </>
  );
}
