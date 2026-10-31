import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { StepList } from "@/components/classic/pricing/StepList";
import { PageHead, SubTabs, h3, wrap } from "@/components/classic/ui";
import { maintenanceFaq, maintenanceServices, maintenanceSteps } from "@/data/classic/maintenance";
import { pageMeta } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// 유지보수 세부 페이지(11-01). 검색어 하나에 페이지 하나: 제목과 설명은 metaTitle, metaDescription, 화면은 명사형 목록만.
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
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.metaTitle,
    description: s.metaDescription,
    serviceType: "홈페이지 유지보수",
    areaServed: "KR",
    url: `${siteUrl}/classic/maintenance/${s.id}`,
    provider: { "@type": "Organization", name: "곰파트너", url: siteUrl },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHead
        title={s.title}
        trail={[
          { href: "/classic/maintenance", label: "유지보수" },
          { href: `/classic/maintenance/${s.id}`, label: s.title },
        ]}
      />
      <SubTabs items={tabs} current={`/classic/maintenance/${s.id}`} />

      <section aria-labelledby="md-scope" className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-2 border-b-2 border-[#15171c] pb-5 md:flex-row md:items-end md:justify-between">
          <h2 id="md-scope" className={h3}>
            {s.term}
          </h2>
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

      <StepList steps={maintenanceSteps} title="진행 절차" id="md-process" />

      <FaqBlock items={maintenanceFaq[s.id] ?? []} id="md-faq" />
    </>
  );
}
