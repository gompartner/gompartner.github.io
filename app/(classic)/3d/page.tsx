import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { DeliverBlock } from "@/components/classic/DeliverBlock";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { Hero3D } from "@/components/classic/Hero3D";
import { OtherServices } from "@/components/classic/OtherServices";
import { PlanTable } from "@/components/classic/pricing/PlanTable";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { SubTabs, h2, h3, wrap } from "@/components/classic/ui";
import { LdScript } from "@/components/seo/JsonLd";
import { replyTerm } from "@/data/classic/maintenance";
import {
  threeByIndustry,
  threeCommon,
  threeCompare,
  threeDeliver,
  threeDemos,
  threeExtras,
  threeFaq,
  threeForWhom,
  threeLeadSample,
  threeMeta as s,
  threePlanNote,
  threePlans,
  threeScope,
  threeSteps,
} from "@/data/classic/three";
import { breadcrumbLd, pageMeta, serviceLd } from "@/lib/seo";

const path = "/3d";

export const metadata: Metadata = pageMeta({
  title: s.metaTitle,
  description: s.metaDescription,
  path,
  image: { src: "/3d/assets/og.jpg", alt: "곰파트너 3D 웹 제작 카탈로그 마을" },
});

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";
const th = "bg-[#f6f7f9] px-4 py-4 text-left align-top text-[15px] font-bold text-[#3d4450] md:px-5";
const td = "px-4 py-4 align-top text-[16px] leading-[1.6] md:px-6";

// 11-03 3D 웹 제작. 앱, 키오스크 페이지(MakeExtraPage)와 같은 틀에 첫 화면만 3D 섬 화면을 쓴다.
// 3D에만 있는 구역: 견적 요청 예시, 업종별 예상 비용과 따로 드는 비용, 제작 방식 비교
export default function Page() {
  return (
    <>
      <LdScript data={[serviceLd(s.title, s.metaDescription, path), breadcrumbLd([{ name: "제작", path: "/homepage" }, { name: s.title, path }])]} />
      <SubTabs items={serviceTabs} current={path} />
      <Hero3D title={s.heroTitle} />

      <section aria-labelledby="t3d-lead" className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-2 border-b-2 border-[#15171c] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="t3d-lead" className={h3}>
              {s.lead}
            </h2>
            <p className="mt-2 text-[16px] leading-[1.6] text-[#5b6370] md:text-[17px]">{s.leadNote}</p>
          </div>
          <p className="shrink-0 text-[15px] font-bold text-[#256ef4]">{replyTerm}</p>
        </div>
      </section>

      <section aria-labelledby="t3d-whom" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="t3d-whom" className={h2}>
            도입이 필요한 경우
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {threeForWhom.map((t) => (
              <li key={t} className="flex gap-3 border-b border-[#e6e9ee] py-5 text-[17px] font-bold leading-[1.55] md:py-6 md:text-[19px]">
                <Check size={22} strokeWidth={2.5} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="t3d-scope" className={`${section} bg-[#f4f6f9]`}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="t3d-scope" className={h2}>
            구현 범위
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-12 lg:grid-cols-4 lg:gap-x-8">
            {threeScope.map((g) => (
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

      <section aria-labelledby="t3d-mail" className={section}>
        <div className={`${wrap} grid gap-10 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-start md:gap-14 md:py-24`}>
          <div>
            <h2 id="t3d-mail" className={h2}>
              견적 요청은 이렇게 들어옵니다
            </h2>
            <p className="mt-4 text-[16px] leading-[1.7] text-[#3d4450] md:text-[17px]">
              손님이 고른 구성과 금액이 이름, 연락처와 함께 접수됩니다. 같은 가격 문의에 매번 답하지 않아도 되고, 접수된 구성을 3D로 다시 열어 보고 실측을 갑니다.
            </p>
            <p className="mt-6 flex gap-3 text-[16px] md:text-[17px]">
              <b className="shrink-0">받는 곳</b>
              <span className="text-[#3d4450]">{threeLeadSample.to}</span>
            </p>
          </div>
          <article aria-labelledby="t3d-mail-t" className="border-t-2 border-[#15171c]">
            <div className="flex flex-col gap-1 border-b border-[#e6e9ee] py-5">
              <b id="t3d-mail-t" className="text-[19px] font-[800] tracking-[-0.03em] md:text-[21px]">
                {threeLeadSample.title}
              </b>
              <span className="text-[15px] text-[#5b6370]">{threeLeadSample.from}</span>
            </div>
            <dl>
              {threeLeadSample.rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-[#e6e9ee] py-4">
                  <dt className="text-[15px] font-bold text-[#5b6370]">{k}</dt>
                  <dd className="text-[16px] font-semibold leading-[1.55] md:text-[17px]">{v}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-b border-[#e6e9ee] py-4">
                <dt className="text-[15px] font-bold text-[#5b6370]">합계</dt>
                <dd className="text-[24px] font-extrabold tabular-nums tracking-[-0.03em] text-[#256ef4] md:text-[28px]">{threeLeadSample.total}</dd>
              </div>
            </dl>
            <a
              href={threeLeadSample.open}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#c9cfd8] bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#15171c]"
            >
              손님이 고른 구성 3D로 열기 <ArrowUpRight size={18} aria-hidden />
            </a>
          </article>
        </div>
      </section>

      <section id="plans" aria-labelledby="t3d-plans" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="t3d-plans" className={h2}>
            패키지
          </h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-[#3d4450] md:text-[17px]">{threePlanNote}</p>
          <PlanTable plans={threePlans} product={s.title} common={threeCommon} />

          <h3 className={`${h3} mt-16`}>업종별 예상 비용</h3>
          <div tabIndex={0} className="-mx-4 mt-6 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[720px] border-collapse border-t-2 border-[#15171c]">
              <caption className="sr-only">업종별 3D 웹 제작 예상 비용</caption>
              <thead>
                <tr className="border-b border-[#e6e9ee]">
                  <th scope="col" className={th}>업종</th>
                  <th scope="col" className={th}>예상 비용</th>
                  <th scope="col" className={th}>구성</th>
                  <th scope="col" className={th}>필요한 자료</th>
                </tr>
              </thead>
              <tbody>
                {threeByIndustry.map((r) => (
                  <tr key={r.name} className="border-b border-[#e6e9ee]">
                    <th scope="row" className={`${td} font-bold`}>{r.name}</th>
                    <td className={`${td} whitespace-nowrap font-extrabold tabular-nums text-[#256ef4]`}>{r.price}</td>
                    <td className={td}>{r.make}</td>
                    <td className={`${td} text-[#3d4450]`}>{r.need}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={`${h3} mt-16`}>따로 드는 비용</h3>
          <ul className="mt-6 border-t-2 border-[#15171c]" role="list">
            {threeExtras.map((x) => (
              <li key={x.name} className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 text-[16px] md:flex-row md:items-center md:justify-between md:text-[17px]">
                <span>{x.name}</span>
                <b className="tabular-nums">{x.price}</b>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] leading-[1.65] text-[#5b6370] md:text-[16px]">표시한 금액 외에 별도로 받는 비용은 없고, 기능을 더할 때만 추가 비용이 발생합니다.</p>
        </div>
      </section>

      <section aria-labelledby="t3d-compare" className={`${section} bg-[#f4f6f9]`}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="t3d-compare" className={h2}>
            제작 방식 비교
          </h2>
          <div tabIndex={0} className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[720px] border-collapse border-t-2 border-[#15171c] bg-white">
              <caption className="sr-only">3D 웹 제작 방식 비교</caption>
              <thead>
                <tr className="border-b border-[#e6e9ee]">
                  <th scope="col" className={`${th} w-[112px] md:w-[180px]`}>
                    <span className="sr-only">항목</span>
                  </th>
                  {threeCompare.cols.map((c, i) => (
                    <th key={c} scope="col" className={`px-4 py-5 text-left align-top text-[19px] font-[800] tracking-[-0.03em] md:px-6 md:text-[22px] ${i === 0 ? "bg-[#eef3ff] text-[#256ef4]" : ""}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {threeCompare.rows.map(([k, ...v]) => (
                  <tr key={k} className="border-b border-[#e6e9ee]">
                    <th scope="row" className={th}>{k}</th>
                    {v.map((x, i) => (
                      <td key={i} className={`${td} ${i === 0 ? "bg-[#eef3ff] font-bold" : "text-[#3d4450]"}`}>
                        {x}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-right text-[14px] text-[#5b6370]">{threeCompare.note}</p>
        </div>
      </section>

      <section id="samples" aria-labelledby="t3d-samples" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="t3d-samples" className={h2}>
            카탈로그
          </h2>
          <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {threeDemos.map((d) => (
              <li key={d.href}>
                <a href={d.href} className="group block">
                  <span className="block overflow-hidden rounded-md border border-[#e1e5eb] bg-[#f4f6f9]">
                    <Image src={d.img} alt={`${d.title} 3D 화면`} width={1440} height={900} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" />
                  </span>
                  <span className="mt-4 block text-[14px] font-bold text-[#5b6370]">{d.category}</span>
                  <span className="mt-0.5 block text-[19px] font-[800] tracking-[-0.03em] group-hover:text-[#256ef4] md:text-[21px]">{d.title}</span>
                  <span className="mt-1 block text-[15px] leading-[1.55] text-[#5b6370]">{d.desc}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepList steps={threeSteps} title="진행 절차" id="process" />

      <DeliverBlock id="t3d-deliver" name={threeDeliver.name} items={threeDeliver.items} photo={threeDeliver.photo} />

      <FaqBlock items={threeFaq} id="t3d-faq" />

      <OtherServices current={path} />
    </>
  );
}
