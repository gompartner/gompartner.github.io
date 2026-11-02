import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, FileText } from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { PhpPromo } from "@/components/classic/PhpPromo";
import { StepList } from "@/components/classic/pricing/StepList";
import { PageHead, SubTabs, h2, h3, wrap } from "@/components/classic/ui";
import { maintenanceFaq, maintenanceServices, replyTerm } from "@/data/classic/maintenance";
import { pageMeta } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// 유지보수 세부 페이지(11-01). 검색어 하나에 페이지 하나: 큰 제목은 검색어 그대로(h1), 화면은 명사형 목록만.
// 검색용 본문은 대표 사례(증상별 확인 항목), 납품 문서, 서비스별 절차, 질문 5개로 채운다.
type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return maintenanceServices.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = maintenanceServices.find((x) => x.id === id);
  if (!s) return {};
  return pageMeta({ title: s.metaTitle, description: s.metaDescription, path: `/classic/maintenance/${s.id}` });
}


const tabs = maintenanceServices.map((s) => ({ href: `/classic/maintenance/${s.id}`, label: s.title }));

export default async function MaintenanceDetailPage({ params }: Props) {
  const { id } = await params;
  const s = maintenanceServices.find((x) => x.id === id);
  if (!s) notFound();
  const path = `/classic/maintenance/${s.id}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.h1,
      description: s.metaDescription,
      serviceType: "홈페이지 유지보수",
      areaServed: "KR",
      url: `${siteUrl}${path}`,
      provider: { "@id": `${siteUrl}/#org` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "홈페이지 유지보수", item: `${siteUrl}/classic/maintenance` },
        { "@type": "ListItem", position: 3, name: s.h1, item: `${siteUrl}${path}` },
      ],
    },
  ];
  const others = maintenanceServices.filter((x) => x.id !== s.id);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead
        title={s.h1}
        trail={[
          { href: "/classic/homepage", label: "서비스" },
          { href: "/classic/maintenance", label: "유지보수" },
          { href: path, label: s.title },
        ]}
      />
      <SubTabs items={tabs} current={path} />

      <section aria-labelledby="md-scope" className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-2 border-b-2 border-[#15171c] pb-5 md:flex-row md:items-end md:justify-between">
          <h2 id="md-scope" className={h3}>
            {s.term}
          </h2>
          <p className="text-[15px] font-bold text-[#256ef4]">{replyTerm}</p>
        </div>
        <dl className="md:grid md:grid-cols-[200px_1fr]">
          {s.blocks.map((b) => (
            <div key={b.label} className="border-b border-[#e6e9ee] md:col-span-2 md:grid md:grid-cols-subgrid">
              <dt className="pt-5 text-[15px] font-bold text-[#3d4450] md:py-5">{b.label}</dt>
              <dd className="pb-5 pt-2 text-[16px] leading-[1.6] md:py-5">
                <ul className="space-y-1.5">
                  {b.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check size={18} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#256ef4]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {s.id === "update" ? <PhpPromo id="md-php-promo" /> : null}

      <section aria-labelledby="md-cases" className="border-t border-[#e6e9ee] bg-[#f6f8fb]">
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="md-cases" className={h2}>
            {s.title} 대표 사례
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2" role="list">
            {s.cases.map((c) => (
              <li key={c.title} className="rounded-md border border-[#d9dee5] bg-white p-6 md:p-7">
                <h3 className="text-[20px] font-[800] tracking-[-0.03em]">{c.title}</h3>
                <ul className="mt-4 space-y-1.5 text-[16px] leading-[1.6] text-[#3d4450]">
                  {c.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check size={18} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#256ef4]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepList steps={s.steps} title="진행 절차" id="md-process" />

      <section aria-labelledby="md-report" className="border-t border-[#e6e9ee]">
        <div className={`${wrap} grid items-center gap-10 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14 md:py-24`}>
          <div>
            <h2 id="md-report" className={h2}>
              납품 문서
            </h2>
            <p className="mt-4 flex items-center gap-2 text-[20px] font-[800] text-[#256ef4]">
              <FileText size={22} aria-hidden />
              {s.report.name}
            </p>
            <ul className="mt-6 border-t-2 border-[#15171c]" role="list">
              {s.report.items.map((item) => (
                <li key={item} className="flex gap-2 border-b border-[#e6e9ee] py-3.5 text-[17px]">
                  <Check size={20} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#256ef4]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* 11-01 문서 그림은 밖에 보이지 않는다(지어낸 기록처럼 읽힘). 작업 장면 사진으로 */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
            <Image src={`/images/site/scene-${s.id}.jpg`} alt={`${s.title} 작업 장면`} fill sizes="(min-width: 768px) 560px, 92vw" className="object-cover" />
          </div>
        </div>
      </section>

      <FaqBlock items={maintenanceFaq[s.id] ?? []} id="md-faq" />

      <section aria-labelledby="md-more" className="border-t border-[#e6e9ee]">
        <div className={`${wrap} py-12 md:py-16`}>
          <h2 id="md-more" className={h3}>
            다른 유지보수 서비스
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3" role="list">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/classic/maintenance/${o.id}`} className="group flex min-h-14 items-center justify-between gap-3 rounded-md border border-[#d9dee5] bg-white px-5 py-3 text-[17px] font-bold transition-colors hover:border-[#256ef4] hover:text-[#256ef4]">
                  {o.h1}
                  <ArrowUpRight size={20} aria-hidden className="shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
