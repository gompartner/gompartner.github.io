import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CreditCard, FileCheck2, Search, Check } from "lucide-react";
import { EnContact } from "@/components/en/EnContact";
import { profile } from "@/data/classic/profile";
import { siteUrl } from "@/lib/site";

// 해외 회사용 영문 소개 한 장. 업워크 프로필(01_Work/01_Active/업워크/프로필.md)과 같은 내용으로 맞춘다.
const title = "Web development for companies launching in Korea";
const description = "Naver setup, Korean payments, Kakao login and native Korean localization for your website.";

export const metadata: Metadata = {
  title: { absolute: `${title} | ${profile.nameEn}` },
  description,
  alternates: { canonical: `${siteUrl}/en`, languages: { ko: siteUrl, en: `${siteUrl}/en` } },
  openGraph: { type: "website", locale: "en_US", siteName: profile.nameEn, url: `${siteUrl}/en`, title, description },
};

import { h2, wrap } from "@/components/en/EnShell";

const why = [
  { icon: Search, title: "Search starts on Naver", text: "Many Korean customers look a business up on Naver first. A site that is not registered there is hard to find." },
  { icon: CreditCard, title: "Local payment methods", text: "Korean shoppers expect Toss Payments, KakaoPay or Naver Pay at checkout." },
  { icon: FileCheck2, title: "Privacy law and business info", text: "Sites that collect personal data need a privacy policy under PIPA. Online stores must show business details in the footer." },
];

// 11-04 상세 페이지가 생긴 서비스는 href로 잇는다
const services: { title: string; href?: string; items: string[] }[] = [
  { title: "Naver setup", href: "/en/naver-setup", items: ["Naver Search Advisor registration", "Sitemap and RSS submission", "Naver Smart Place (Naver Map) listing"] },
  { title: "Korean payments", href: "/en/korean-payments", items: ["Toss Payments integration", "KakaoPay and Naver Pay", "Web stores and booking sites"] },
  { title: "Login and messaging", items: ["Kakao and Naver social login", "KakaoTalk notification messages"] },
  { title: "Localization", href: "/en/localization", items: ["Natural Korean copy, not machine translation", "Korean fonts and line breaks", "Layout fixes for Korean text"] },
  { title: "3D configurators", href: "/en/3d", items: ["Customers build the product in 3D", "Live price from your price list", "Quote requests with the exact setup"] },
  { title: "Maintenance", items: ["Updates and fixes after launch", "Security patches", "Monthly checks"] },
];

const steps = [
  { title: "Reply within 24 hours", text: "Korea time (GMT+9). Written communication." },
  { title: "Plan and fixed price first", text: "You get a short plan and a fixed price before any work starts." },
  { title: "Everything handed over", text: "Source code and all account access are yours at the end." },
];

const samples = [
  { slug: "online-store", title: "Online store", text: "Product options and a Korean checkout flow." },
  { slug: "company", title: "Company website", text: "Company profile and a quote request form with file upload." },
  { slug: "landing-popup-store", title: "Pop-up store landing page", text: "Pre-booking by date and time slot, with entry info and directions." },
];

export default function EnPage() {
  return (
    <>
        <section className="bg-[#0f1b3d] text-white">
          <div className={`${wrap} py-20 md:py-28`}>
            <h1 className="max-w-[860px] text-[38px] font-[800] leading-[1.2] tracking-[-0.03em] md:text-[60px]">{title}</h1>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#contact" data-gtm-cta="en_hero_contact" className="inline-flex h-13 min-h-12 items-center rounded-md bg-[#256ef4] px-6 text-[17px] font-bold hover:bg-[#1a5ad4]">
                Contact
              </a>
              <a href="#samples" className="inline-flex min-h-12 items-center rounded-md border border-white/40 px-6 text-[17px] font-bold hover:bg-white/10">
                See samples
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="why" className={`${wrap} py-16 md:py-24`}>
          <h2 id="why" className={h2}>Why Korea is different</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3" role="list">
            {why.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-lg border border-[#d9dee5] p-6 md:p-8">
                <Icon size={28} strokeWidth={2} aria-hidden className="text-[#256ef4]" />
                <h3 className="mt-5 text-[20px] font-[800] tracking-[-0.01em]">{title}</h3>
                <p className="mt-2 text-[16px] leading-[1.6] text-[#3d4450]">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="services" aria-labelledby="services-h" className="scroll-mt-4 bg-[#f4f6f9]">
          <div className={`${wrap} py-16 md:py-24`}>
            <h2 id="services-h" className={h2}>Services</h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {services.map((s) => (
                <li key={s.title} className="flex flex-col rounded-lg bg-white p-6 md:p-8">
                  <h3 className="text-[20px] font-[800] tracking-[-0.01em]">{s.title}</h3>
                  <ul className="mt-4 space-y-2.5" role="list">
                    {s.items.map((t) => (
                      <li key={t} className="flex gap-2.5 text-[16px] leading-[1.5] text-[#3d4450]">
                        <Check size={18} strokeWidth={2.5} aria-hidden className="mt-[3px] shrink-0 text-[#256ef4]" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  {s.href && (
                    <Link href={s.href} className="mt-6 inline-flex min-h-11 items-center gap-1 self-start text-[16px] font-bold text-[#256ef4] hover:underline">
                      Learn more <span className="sr-only">about {s.title}</span>
                      <ArrowUpRight size={18} strokeWidth={2.5} aria-hidden />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="how" className={`${wrap} py-16 md:py-24`}>
          <h2 id="how" className={h2}>How I work</h2>
          <ol className="mt-10 grid gap-8 border-t-2 border-[#15171c] pt-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{i + 1}</span>
                <h3 className="mt-2 text-[20px] font-[800] tracking-[-0.01em]">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-[1.6] text-[#3d4450]">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="samples" aria-labelledby="samples-h" className="scroll-mt-4 border-t border-[#e6e9ee]">
          <div className={`${wrap} py-16 md:py-24`}>
            <h2 id="samples-h" className={h2}>Samples</h2>
            <p className="mt-3 text-[17px] leading-[1.6] text-[#3d4450]">
              Live Korean sites you can click through.{" "}
              <Link href="/en/works" className="font-bold text-[#256ef4] underline-offset-4 hover:underline">
                See all samples
              </Link>
            </p>
            <ul className="mt-10 grid gap-8 md:grid-cols-3" role="list">
              {samples.map((s) => (
                <li key={s.slug}>
                  <a href={`/demo/${s.slug}`} target="_blank" rel="noopener" data-gtm-cta={`en_sample_${s.slug}`} className="group block">
                    <span className="block overflow-hidden rounded-md border border-[#e1e5eb]">
                      <Image src={`/images/demos/sm/${s.slug}.jpg`} alt={`${s.title} sample screen`} width={720} height={450} sizes="(min-width: 768px) 400px, 92vw" className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
                    </span>
                    <span className="mt-4 flex items-center gap-1 text-[19px] font-[800] group-hover:text-[#256ef4]">
                      {s.title}
                      <ArrowUpRight size={18} strokeWidth={2.5} aria-hidden />
                    </span>
                    <span className="mt-1 block text-[16px] leading-[1.5] text-[#5b6370]">{s.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <EnContact />
    </>
  );
}
