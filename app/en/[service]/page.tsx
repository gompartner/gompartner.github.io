import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, ChevronDown, Info } from "lucide-react";
import { EnContact } from "@/components/en/EnContact";
import { h2, wrap } from "@/components/en/EnShell";
import { profile } from "@/data/classic/profile";
import { enNav, enServices, enSteps } from "@/data/en/site";
import { siteUrl } from "@/lib/site";
import { OG_IMAGE } from "@/lib/seo";

// 11-04 영문 서비스 상세 3종(네이버 설정, 국내 결제, 현지화). 내용은 data/en/site.ts
type Props = { params: Promise<{ service: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return enServices.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service } = await params;
  const s = enServices.find((x) => x.slug === service);
  if (!s) return {};
  const url = `${siteUrl}/en/${s.slug}`;
  return {
    title: { absolute: `${s.metaTitle} | ${profile.nameEn}` },
    description: s.description,
    alternates: { canonical: url },
    openGraph: { images: [OG_IMAGE], type: "website", locale: "en_US", siteName: profile.nameEn, url, title: s.metaTitle, description: s.description },
  };
}

export default async function EnServicePage({ params }: Props) {
  const { service } = await params;
  const s = enServices.find((x) => x.slug === service);
  if (!s) notFound();
  const others = enNav.filter((n) => n.href !== `/en/${s.slug}` && n.href !== "/en/works");
  return (
    <>
      <section className="bg-[#0f1b3d] text-white">
        <div className={`${wrap} py-16 md:py-24`}>
          <p className="text-[15px] font-bold text-[#aebbd6]">
            <Link href="/en" className="hover:text-white">Services</Link>
          </p>
          <h1 className="mt-4 max-w-[860px] text-[36px] font-[800] leading-[1.2] tracking-[-0.03em] md:text-[56px]">{s.title}</h1>
          <p className="mt-6 max-w-[720px] text-[18px] leading-[1.6] text-[#d6deee] md:text-[20px]">{s.lead}</p>
          <a href="#contact" data-gtm-cta={`en_${s.slug}_hero`} className="mt-10 inline-flex min-h-12 items-center rounded-md bg-[#256ef4] px-6 text-[17px] font-bold hover:bg-[#1a5ad4]">
            Contact
          </a>
        </div>
      </section>

      <section aria-labelledby="whom" className={`${wrap} py-16 md:py-24`}>
        <h2 id="whom" className={h2}>Who this is for</h2>
        <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
          {s.forWhom.map((t) => (
            <li key={t} className="flex gap-3 border-b border-[#e6e9ee] py-5 text-[17px] font-bold leading-[1.55] md:py-6 md:text-[19px]">
              <Check size={22} strokeWidth={2.5} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="scope" className="bg-[#f4f6f9]">
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="scope" className={h2}>What I do</h2>
          <div className={`mt-10 grid gap-8 md:grid-cols-2 md:gap-x-12 ${s.scope.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"} lg:gap-x-8`}>
            {s.scope.map((g) => (
              <div key={g.title} className="border-t-2 border-[#15171c] pt-5">
                <h3 className="text-[20px] font-[800] tracking-[-0.01em] md:text-[21px]">{g.title}</h3>
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
          <p className="mt-12 flex gap-3 border-t border-[#d9dee5] pt-6 text-[16px] leading-[1.65] text-[#3d4450] md:text-[17px]">
            <Info size={20} aria-hidden className="mt-[3px] shrink-0 text-[#5b6370]" />
            <span>
              <b className="mr-1.5 text-[#15171c]">Good to know</b>
              {s.note}
            </span>
          </p>
        </div>
      </section>

      <section aria-labelledby="how" className={`${wrap} py-16 md:py-24`}>
        <h2 id="how" className={h2}>How it works</h2>
        <ol className="mt-10 grid gap-8 border-t-2 border-[#15171c] pt-8 md:grid-cols-2 lg:grid-cols-4">
          {enSteps.map((st, i) => (
            <li key={st.title}>
              <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{i + 1}</span>
              <h3 className="mt-2 text-[20px] font-[800] tracking-[-0.01em]">{st.title}</h3>
              <p className="mt-2 text-[16px] leading-[1.6] text-[#3d4450]">{st.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-[16px] text-[#3d4450]">
          Fixed price per project, agreed before work starts.{" "}
          <Link href="/en/works" className="font-bold text-[#256ef4] underline-offset-4 hover:underline">
            See samples
          </Link>
        </p>
      </section>

      <section aria-labelledby="faq" className="border-t border-[#e6e9ee]">
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="faq" className={h2}>Questions</h2>
          <div className="mt-10 border-t-2 border-[#15171c]">
            {s.faq.map((f) => (
              <details key={f.q} className="group border-b border-[#e6e9ee]">
                <summary className="flex cursor-pointer list-none items-start gap-4 py-5 text-[17px] font-bold leading-[1.5] md:py-6 md:text-[19px] [&::-webkit-details-marker]:hidden">
                  <span className="shrink-0 text-[#256ef4]">Q</span>
                  <span className="min-w-0 flex-1">{f.q}</span>
                  <ChevronDown size={22} aria-hidden className="mt-0.5 shrink-0 text-[#6b7280] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="pb-6 pl-8 text-[16px] leading-[1.75] text-[#3d4450] md:pr-12 md:text-[17px]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="more" className="border-t border-[#e6e9ee]">
        <div className={`${wrap} py-12 md:py-16`}>
          <h2 id="more" className="text-[22px] font-[800] tracking-[-0.02em] md:text-[26px]">
            Other services
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {others.map((o) => (
              <li key={o.href}>
                <Link href={o.href} className="group flex min-h-14 items-center justify-between gap-3 rounded-md border border-[#d9dee5] bg-white px-5 py-3 text-[17px] font-bold transition-colors hover:border-[#256ef4] hover:text-[#256ef4]">
                  {o.label}
                  <ArrowUpRight size={20} aria-hidden className="shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <EnContact />
    </>
  );
}
