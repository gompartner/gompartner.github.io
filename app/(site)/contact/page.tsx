import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "상담 문의",
  description:
    "홈페이지 제작, 리뉴얼, 예약·관리 시스템, 유지보수 상담을 환영합니다. 상담과 견적은 무료입니다.",
  alternates: { canonical: "/contact" },
};

const preparationItems = [
  "어떤 업종·사업인지 간단한 소개",
  "필요한 것 (홈페이지, 랜딩페이지, 예약, 관리자, 유지보수 등)",
  "참고하고 싶은 사이트가 있다면 링크",
  "희망하는 일정이나 예산 범위 (대략이면 충분합니다)",
];

const nextSteps = [
  {
    step: 1,
    title: "문의 접수",
    description: "보내주신 내용을 확인하고 이메일로 회신드립니다.",
  },
  {
    step: 2,
    title: "무료 상담",
    description: "목적과 상황을 듣고 현실적인 범위와 방향을 제안합니다.",
  },
  {
    step: 3,
    title: "견적·일정 확정",
    description: "확정된 범위로 명확한 견적과 일정을 드리고 시작합니다.",
  },
];

export default function ContactPage() {
  return (
    <Section aria-labelledby="contact-heading">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* 좌측: 안내 */}
        <div>
          <SectionHeading
            label="Contact"
            title="상담 문의"
            titleId="contact-heading"
            description="홈페이지 제작, 리뉴얼, 예약·관리 시스템, 유지보수까지. 지금 상황을 알려주시면 현실적인 방향을 제안해 드립니다."
            className="mb-10"
          />

          <Reveal>
            <div className="rounded-3xl border border-border bg-surface p-7">
              <h2 className="font-semibold text-foreground">
                문의하실 때 알려주시면 좋은 것
              </h2>
              <ul className="mt-4 space-y-3">
                {preparationItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-foreground-secondary"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 flex-shrink-0 text-accent"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-foreground-tertiary">
                정리되어 있지 않아도 괜찮습니다. 상담에서 함께 정리하는 것부터
                시작해도 됩니다.
              </p>
            </div>
          </Reveal>
        </div>

        {/* 우측: 이메일 CTA + 다음 단계 */}
        <div className="flex flex-col gap-6">
          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-accent/15 bg-gradient-to-br from-accent/12 to-accent/4 p-7 text-center md:p-9">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Mail size={22} aria-hidden />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                이메일로 문의하기
              </h2>
              <p className="mt-2 text-sm text-foreground-secondary">
                상담과 견적은 무료입니다. 부담 없이 보내주세요.
              </p>
              <div className="mt-6">
                <Button href={`mailto:${profile.email}`} data-gtm-cta="contact_email">
                  {profile.email}
                  <ArrowRight size={17} aria-hidden />
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="rounded-3xl border border-border bg-surface p-7">
              <h2 className="font-semibold text-foreground">이후 진행 순서</h2>
              <ol className="mt-5 space-y-5">
                {nextSteps.map(({ step, title, description }) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-accent/30 bg-background text-sm font-semibold text-accent">
                      {step}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-foreground-secondary">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="text-center text-sm text-foreground-tertiary">
              어떤 관점으로 일하는지 궁금하다면{" "}
              <Link
                href="/blog"
                className="font-medium text-foreground-secondary underline underline-offset-4 transition-colors hover:text-foreground"
              >
                블로그 글
              </Link>
              을 먼저 읽어보셔도 좋습니다.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
