import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, FileText } from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
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

// 문서 이미지 크기(public/images/site/hero-<id>-doc.jpg)
const docSize: Record<string, [number, number]> = { fix: [1060, 752], takeover: [1060, 790], update: [1060, 752], monthly: [1060, 714] };

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
          {/* 첫 화면 슬라이드와 같은 문서 이미지. 종이를 겹쳐 놓은 모양 */}
          <div className="relative rounded-lg px-6 py-10 md:px-10 md:py-14" style={{ backgroundColor: "#0f1b3d" }}>
            <div aria-hidden className="absolute inset-x-12 bottom-8 top-6 rotate-[4deg] rounded-md bg-white/25 md:inset-x-16" />
            <div aria-hidden className="absolute inset-x-9 bottom-9 top-8 rotate-[2deg] rounded-md bg-white/60 md:inset-x-12" />
            <Image
              src={`/images/site/hero-${s.id}-doc.jpg`}
              alt={`${s.report.name} 예시`}
              width={docSize[s.id]?.[0] ?? 1060}
              height={docSize[s.id]?.[1] ?? 752}
              sizes="(min-width: 768px) 560px, 90vw"
              className="relative h-auto w-full -rotate-[1deg] rounded-md shadow-[0_24px_50px_rgba(0,0,0,.45)]"
            />
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
