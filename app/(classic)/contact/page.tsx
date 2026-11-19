import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { LdScript } from "@/components/seo/JsonLd";
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
        title="상담 신청"
        trail={[
          { href: "/faq", label: "고객지원" },
          { href: "/contact", label: "상담 신청" },
        ]}
      />
      <SupportTabs current="/contact" />

      <div className={`${wrap} py-12 md:py-16`}>
        <section aria-labelledby="contact-form" className="min-w-0 max-w-[720px]">
          <h2 id="contact-form" className="sr-only">
            신청서
          </h2>
          {/* 폼이 주소의 ?site= 를 읽어서(useSearchParams) 정적 내보내기에는 Suspense가 있어야 한다 */}
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </section>

      </div>
    </>
  );
}
