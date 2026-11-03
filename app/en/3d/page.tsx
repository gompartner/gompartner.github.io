import type { Metadata } from "next";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import { Hero3D } from "@/components/classic/Hero3D";
import { EnContact } from "@/components/en/EnContact";
import { h2, wrap } from "@/components/en/EnShell";
import { profile } from "@/data/classic/profile";
import { enThree as t } from "@/data/en/site";
import { siteUrl } from "@/lib/site";

// 11-04 영문 3D 웹 제작. 한국어 /3d 와 같은 순서, 같은 금액. 섬 화면은 ?lang=en 으로 이름표와 카드를 영어로 띄운다.
// 3D 데모 6종 화면은 아직 한국어라 카드에 적어 둔다(영문 화면은 추가 항목).
export const metadata: Metadata = {
  title: { absolute: `${t.metaTitle} | ${profile.nameEn}` },
  description: t.description,
  alternates: { canonical: `${siteUrl}/en/3d`, languages: { ko: `${siteUrl}/3d`, en: `${siteUrl}/en/3d` } },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: profile.nameEn,
    url: `${siteUrl}/en/3d`,
    title: t.metaTitle,
    description: t.description,
    images: [{ url: "/3d/assets/og.jpg", width: 1200, height: 630, alt: "GOMPARTNER 3D catalog village" }],
  },
};

const section = "scroll-mt-28 border-t border-[#e6e9ee]";
const th = "bg-[#f6f7f9] px-4 py-4 text-left align-top text-[15px] font-bold text-[#3d4450] md:px-5";
const td = "px-4 py-4 align-top text-[16px] leading-[1.6] md:px-6";
const list = (items: string[]) => (
  <ul className="space-y-1.5" role="list">
    {items.map((i) => (
      <li key={i} className="flex gap-2">
        <Check size={18} strokeWidth={2.5} aria-hidden className="mt-[3px] shrink-0 text-[#256ef4]" />
        {i}
      </li>
    ))}
  </ul>
);

export default function EnThreePage() {
  return (
    <>
      {/* 영문 머리글은 64px, 휴대폰과 태블릿은 메뉴 줄(약 48px)이 더 붙는다 */}
      <Hero3D title={t.heroTitle} src="/3d/island?lang=en" frameTitle="Catalog village in 3D. Select a building label to open that catalog." height="h-[calc(100svh-113px)] lg:h-[calc(100svh-65px)]" />

      <section aria-labelledby="lead" className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-2 border-b-2 border-[#15171c] pb-5 md:flex-row md:items-end md:justify-between">
          <h2 id="lead" className="max-w-[880px] text-[22px] font-[800] leading-[1.35] tracking-[-0.02em] md:text-[26px]">
            {t.lead}
          </h2>
          <a href="#contact" className="shrink-0 text-[15px] font-bold text-[#256ef4] hover:underline">
            Reply within 24 hours
          </a>
        </div>
      </section>

      <section aria-labelledby="whom" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="whom" className={h2}>Who this is for</h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {t.forWhom.map((x) => (
              <li key={x} className="flex gap-3 border-b border-[#e6e9ee] py-5 text-[17px] font-bold leading-[1.55] md:py-6 md:text-[19px]">
                <Check size={22} strokeWidth={2.5} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="scope" className={`${section} bg-[#f4f6f9]`}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="scope" className={h2}>What you get</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-12 lg:grid-cols-4 lg:gap-x-8">
            {t.scope.map((g) => (
              <div key={g.title} className="border-t-2 border-[#15171c] pt-5">
                <h3 className="text-[20px] font-[800] tracking-[-0.01em] md:text-[21px]">{g.title}</h3>
                <div className="mt-3 text-[16px] leading-[1.6] text-[#3d4450]">{list(g.items)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="mail" className={section}>
        <div className={`${wrap} grid gap-10 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:items-start md:gap-14 md:py-24`}>
          <div>
            <h2 id="mail" className={h2}>How a request arrives</h2>
            <p className="mt-4 text-[16px] leading-[1.7] text-[#3d4450] md:text-[17px]">
              The setup the customer built and its price arrive with their name and phone number. You stop answering the same price questions, and you open the setup in 3D before the site visit.
            </p>
          </div>
          <article aria-labelledby="mail-t" className="border-t-2 border-[#15171c]">
            <div className="flex flex-col gap-1 border-b border-[#e6e9ee] py-5">
              <b id="mail-t" className="text-[19px] font-[800] md:text-[21px]">{t.sample.title}</b>
              <span className="text-[15px] text-[#5b6370]">{t.sample.from}</span>
            </div>
            <dl>
              {t.sample.rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-[#e6e9ee] py-4">
                  <dt className="text-[15px] font-bold text-[#5b6370]">{k}</dt>
                  <dd className="text-[16px] font-semibold leading-[1.55] md:text-[17px]">{v}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 border-b border-[#e6e9ee] py-4">
                <dt className="text-[15px] font-bold text-[#5b6370]">Total</dt>
                <dd className="text-[24px] font-extrabold tabular-nums text-[#256ef4] md:text-[28px]">{t.sample.total}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section id="plans" aria-labelledby="plans-h" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="plans-h" className={h2}>Packages</h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-[#3d4450] md:text-[17px]">{t.planNote}</p>
          <div tabIndex={0} className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[720px] border-collapse border-t-2 border-[#15171c]">
              <caption className="sr-only">3D configurator packages</caption>
              <thead>
                <tr className="border-b border-[#e6e9ee]">
                  <th scope="col" className={`${th} w-[112px] md:w-[180px]`}>
                    <span className="sr-only">Item</span>
                  </th>
                  {t.plans.map((p) => (
                    <th key={p.name} scope="col" className="px-4 py-5 text-left align-top text-[19px] font-[800] md:px-6 md:text-[22px]">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e6e9ee]">
                  <th scope="row" className={th}>Price</th>
                  {t.plans.map((p) => (
                    <td key={p.name} className={td}>
                      <span className="text-[22px] font-extrabold tabular-nums text-[#256ef4] md:text-[26px]">{p.price}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e6e9ee]">
                  <th scope="row" className={th}>Time</th>
                  {t.plans.map((p) => (
                    <td key={p.name} className={td}>{p.period}</td>
                  ))}
                </tr>
                <tr className="border-b border-[#e6e9ee]">
                  <th scope="row" className={th}>For</th>
                  {t.plans.map((p) => (
                    <td key={p.name} className={td}>{p.summary}</td>
                  ))}
                </tr>
                <tr className="border-b border-[#e6e9ee]">
                  <th scope="row" className={th}>Includes</th>
                  {t.plans.map((p) => (
                    <td key={p.name} className={td}>{list(p.includes)}</td>
                  ))}
                </tr>
                <tr className="border-b border-[#e6e9ee]">
                  <th scope="row" className={th}>All packages</th>
                  {t.plans.map((p) => (
                    <td key={p.name} className={td}>{list(t.common)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <h3 className="mt-16 text-[22px] font-[800] tracking-[-0.02em] md:text-[26px]">Extras</h3>
          <ul className="mt-6 border-t-2 border-[#15171c]" role="list">
            {t.extras.map(([k, v]) => (
              <li key={k} className="flex flex-col gap-1 border-b border-[#e6e9ee] py-4 text-[16px] md:flex-row md:items-center md:justify-between md:text-[17px]">
                <span>{k}</span>
                <b className="tabular-nums">{v}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="demos" aria-labelledby="demos-h" className={`${section} bg-[#f4f6f9]`}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="demos-h" className={h2}>Demos</h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-[#3d4450] md:text-[17px]">The demo screens are in Korean. An English interface is available as an extra.</p>
          <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {t.demos.map((d) => (
              <li key={d.href}>
                <a href={d.href} className="group block">
                  <span className="block overflow-hidden rounded-md bg-[#eef0f3]">
                    <Image src={d.img} alt={`${d.title} 3D demo`} width={1440} height={900} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 92vw" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
                  </span>
                  <span className="mt-4 block text-[19px] font-[800] group-hover:text-[#256ef4]">{d.title}</span>
                  <span className="mt-1 block text-[16px] leading-[1.5] text-[#5b6370]">{d.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="steps" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="steps" className={h2}>How it works</h2>
          <ol className="mt-10 grid gap-8 border-t-2 border-[#15171c] pt-8 md:grid-cols-2 lg:grid-cols-5">
            {t.steps.map((s, i) => (
              <li key={s.title}>
                <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{i + 1}</span>
                <h3 className="mt-2 text-[20px] font-[800] tracking-[-0.01em]">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-[1.6] text-[#3d4450]">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="faq" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="faq" className={h2}>Questions</h2>
          <div className="mt-10 border-t-2 border-[#15171c]">
            {t.faq.map((f) => (
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

      <EnContact text="Send product photos, sizes or drawings. I reply within 24 hours with questions or a quote." />
    </>
  );
}
