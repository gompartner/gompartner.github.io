import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Section from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { profile } from "@/data/profile";

const checklist = [
  "처음 홈페이지를 만드는 사업자",
  "오래된 사이트의 리뉴얼·개선이 필요한 곳",
  "유지보수까지 맡길 개발 파트너가 필요한 곳",
];

export function CtaBand() {
  return (
    <Section aria-label="상담 문의" className="py-20 md:py-28">
      <Reveal>
        <div className="rounded-[2.5rem] border border-accent/15 bg-gradient-to-br from-accent/12 via-accent/6 to-transparent p-8 text-center md:p-14">
          {/* 누구에게 문의하는지 보여주는 프로필 스트립 */}
          <Link
            href="/about"
            className="group mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-background/70 py-2 pl-2 pr-5 backdrop-blur transition-colors hover:border-accent/40"
          >
            <span className="relative h-10 w-10 overflow-hidden rounded-full bg-surface">
              <Image
                src={profile.avatarUrl}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <span className="text-left text-sm leading-tight">
              <span className="block font-semibold text-foreground">{profile.name}</span>
              <span className="block text-foreground-tertiary">
                웹사이트 파트너 · 소개 보기
              </span>
            </span>
          </Link>

          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            지금 필요한 것부터, 가볍게 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground-secondary">
            상담한 사람이 만들고, 만든 사람이 끝까지 운영합니다. 무엇부터 해야
            할지 몰라도 괜찮습니다 — 상담에서 지금 상황에 맞는 범위와 순서를
            함께 정리해 드립니다.
          </p>

          <ul className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-3">
            {checklist.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 whitespace-nowrap text-sm text-foreground-secondary"
              >
                <CheckCircle2 size={16} className="flex-shrink-0 text-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button href="/contact" data-gtm-cta="cta_band_contact">
              상담 문의하기
              <ArrowRight size={18} aria-hidden />
            </Button>
            <Button
              href={`mailto:${profile.email}`}
              variant="outline"
              data-gtm-cta="cta_band_email"
            >
              <Mail size={17} aria-hidden />
              이메일 보내기
            </Button>
          </div>
          <p className="mt-5 text-sm text-foreground-tertiary">
            상담과 견적은 무료입니다. 부담 없이 물어보세요.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
