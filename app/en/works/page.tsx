import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EnContact } from "@/components/en/EnContact";
import { h2, wrap } from "@/components/en/EnShell";
import { profile } from "@/data/classic/profile";
import { enThree, enWorks } from "@/data/en/site";
import { siteUrl } from "@/lib/site";

// 11-04 영문 카탈로그. 데모는 한국어 화면 그대로 열고(한국 손님이 보는 모습), 제목과 설명만 영어로 쓴다
const title = "Korean website samples";
const description = "Live Korean websites, apps and kiosks you can click through: online stores, bookings, company sites, landing pages and clinics.";

export const metadata: Metadata = {
  title: { absolute: `${title} | ${profile.nameEn}` },
  description,
  alternates: { canonical: `${siteUrl}/en/works`, languages: { ko: `${siteUrl}/works`, en: `${siteUrl}/en/works` } },
  openGraph: { type: "website", locale: "en_US", siteName: profile.nameEn, url: `${siteUrl}/en/works`, title, description },
};

const card = "group block";
const thumb = "aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none";

export default function EnWorksPage() {
  const count = enWorks.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <section className="bg-[#0f1b3d] text-white">
        <div className={`${wrap} py-16 md:py-24`}>
          <h1 className="max-w-[860px] text-[36px] font-[800] leading-[1.2] tracking-[-0.03em] md:text-[56px]">{title}</h1>
          <p className="mt-6 max-w-[720px] text-[18px] leading-[1.6] text-[#d6deee] md:text-[20px]">
            {count} live demos you can click through. They are in Korean, the way your Korean customers would see them.
          </p>
        </div>
      </section>

      {enWorks.map((g, n) => (
        <section key={g.title} aria-labelledby={`g-${n}`} className={n % 2 ? "bg-[#f4f6f9]" : ""}>
          <div className={`${wrap} py-14 md:py-20`}>
            <div className="flex items-baseline gap-3 border-b-2 border-[#15171c] pb-4">
              <h2 id={`g-${n}`} className={h2}>
                {g.title}
              </h2>
              <span className="text-[16px] font-bold tabular-nums text-[#5b6370]">{g.items.length}</span>
            </div>
            <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {g.items.map((s) => (
                <li key={s.slug}>
                  <a href={`/demo/${s.slug}`} target="_blank" rel="noopener" data-gtm-cta={`en_works_${s.slug}`} className={card}>
                    <span className="block overflow-hidden rounded-md border border-[#e1e5eb] bg-white">
                      <Image src={`/images/demos/sm/${s.slug}.jpg`} alt={`${s.title} demo screen`} width={720} height={450} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 92vw" className={thumb} />
                    </span>
                    <span className="mt-4 flex items-center gap-1 text-[19px] font-[800] group-hover:text-[#256ef4]">
                      {s.title}
                      <ArrowUpRight size={18} strokeWidth={2.5} aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                    <span className="mt-1 block text-[16px] leading-[1.5] text-[#5b6370]">{s.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section aria-labelledby="g-3d" className="border-t border-[#e6e9ee]">
        <div className={`${wrap} py-14 md:py-20`}>
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[#15171c] pb-4">
            <h2 id="g-3d" className={h2}>
              3D configurators
            </h2>
            <Link href="/en/3d" className="text-[16px] font-bold text-[#256ef4] underline-offset-4 hover:underline">
              About 3D configurators
            </Link>
          </div>
          <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {enThree.demos.map((d) => (
              <li key={d.href}>
                <a href={d.href} className={card}>
                  <span className="block overflow-hidden rounded-md bg-[#eef0f3]">
                    <Image src={d.img} alt={`${d.title} 3D demo`} width={1440} height={900} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 92vw" className={thumb} />
                  </span>
                  <span className="mt-4 block text-[19px] font-[800] group-hover:text-[#256ef4]">{d.title}</span>
                  <span className="mt-1 block text-[16px] leading-[1.5] text-[#5b6370]">{d.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <EnContact text="Want something like one of these for the Korean market? Tell me which sample is closest. I reply within 24 hours." />
    </>
  );
}
