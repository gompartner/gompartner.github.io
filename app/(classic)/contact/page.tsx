import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { LdScript } from "@/components/seo/JsonLd";
import { profile } from "@/data/classic/profile";
import { Mail, Phone } from "lucide-react";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "상담 신청",
  description: "제작하거나 수정할 홈페이지의 업종, 필요한 기능, 희망 일정을 남겨 주시면 검토 뒤 견적서로 회신합니다.",
  path: "/contact",
});

export default function ClassicContactPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "상담 신청", path: "/contact" }])} />
      <PageHead
        en="CONTACT"
        title="상담 신청"
        lead="업종, 필요한 기능, 희망 일정을 남겨 주시면 검토 뒤 견적서로 회신합니다."
        trail={[{ href: "/contact", label: "상담 신청" }]}
      />
      <SupportTabs current="/contact" />

      {/* 11-26 메인 맨 아래 신청서와 같은 배치: 왼쪽 연락처, 오른쪽 흰 카드 안 신청서(keep-light: 카드 안은 밝은 색 그대로) */}
      <div className={`${wrap} grid gap-10 pb-20 pt-8 md:pb-28 md:pt-12 lg:grid-cols-[1fr_640px] lg:gap-16`}>
        <div>
        <ul className="space-y-3" role="list" aria-label="연락처">
          <li>
            <a href={`mailto:${profile.email}`} className="inline-flex min-h-11 items-center gap-3 text-[17px] font-bold text-white hover:text-[#7aa7ff]">
              <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                <Mail size={18} />
              </span>
              {profile.email}
            </a>
          </li>
          <li>
            <a href={`tel:${profile.phone}`} className="inline-flex min-h-11 items-center gap-3 text-[17px] font-bold text-white hover:text-[#7aa7ff]">
              <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                <Phone size={18} />
              </span>
              {profile.phone}
            </a>
          </li>
        </ul>
        <p className="mt-8 text-[14px] leading-[1.6] text-[#8a94a6]">곰파트너, 사업자등록번호 {profile.bizNo}</p>
        </div>
        <section aria-labelledby="contact-form" className="keep-light min-w-0">
          <h2 id="contact-form" className="sr-only">
            신청서
          </h2>
          <div className="rounded-[28px] bg-white p-5 text-[#15171c] md:p-9">
            {/* 폼이 주소의 ?site= 를 읽어서(useSearchParams) 정적 내보내기에는 Suspense가 있어야 한다 */}
            <Suspense fallback={null}>
              <ContactForm />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );
}
