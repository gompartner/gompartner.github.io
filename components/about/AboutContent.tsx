"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Mail,
  MapPin,
  RefreshCcw,
  Smartphone,
  Target,
  Zap,
} from "lucide-react";
import { profile } from "@/data/profile";

const values = [
  {
    icon: Target,
    title: "사업자 중심 제작",
    description:
      "예산과 시간이 제한된 소규모 사업자가 바로 사용할 수 있는 웹사이트를 우선합니다.",
  },
  {
    icon: Zap,
    title: "빠른 구축과 운영",
    description:
      "필요한 것부터 빠르게 오픈하고, 오픈 이후에도 꾸준히 운영하며 개선합니다.",
  },
  {
    icon: Smartphone,
    title: "모바일 최적화",
    description:
      "방문자가 가장 많이 보는 모바일 화면에서 문의와 예약이 자연스럽게 이어지도록 구성합니다.",
  },
  {
    icon: RefreshCcw,
    title: "지속적 개선",
    description:
      "콘텐츠 업데이트, 검색 노출, 이벤트 페이지 운영까지 만든 뒤에도 함께 개선합니다.",
  },
];

export function AboutContent() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="space-y-20">
      {/* Profile section */}
      <div className="grid md:grid-cols-5 gap-12 items-center">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="md:col-span-2 flex justify-center"
        >
          <div className="relative w-64 h-64 rounded-3xl overflow-hidden bg-surface ring-1 ring-border shadow-2xl">
            <Image
              src={profile.avatarUrl}
              alt={`${profile.name} 프로필 사진`}
              fill
              className="rounded-3xl object-cover"
              preload
              sizes="256px"
            />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-3 space-y-6"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {profile.name}
            </h2>
            <p className="mt-2 text-xl text-accent font-medium">{profile.title}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-foreground-secondary text-sm">
              <MapPin size={15} aria-hidden />
              {profile.location}
            </p>
            <p className="flex items-center gap-2 text-foreground-secondary text-sm">
              <Briefcase size={15} aria-hidden />
              상담부터 제작·운영까지 직접
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-foreground-secondary text-sm transition-colors hover:text-foreground"
            >
              <Mail size={15} aria-hidden />
              {profile.email}
            </a>
          </div>

          <p className="text-foreground-secondary leading-relaxed">{profile.bio}</p>

          <p className="text-sm text-foreground-tertiary">
            1인 업체입니다. 상담한 사람이 만들고, 만든 사람이 끝까지 운영합니다.
          </p>
        </motion.div>
      </div>

      {/* Values */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
            Approach
          </p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
            일하는 방식
          </h2>
          <p className="mt-3 max-w-xl text-foreground-secondary leading-relaxed">
            기술보다 사업에 도움이 되는지를 먼저 봅니다. 네 가지 기준으로
            만들고 운영합니다.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-4">
          {values.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
              className="p-6 rounded-2xl border border-border bg-surface"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon size={20} aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-foreground-secondary leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 상담 CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-accent/12 to-accent/4 p-10 text-center"
      >
        <p className="text-xl font-semibold text-foreground">
          어떤 사이트가 필요한지 막연해도 괜찮습니다.
        </p>
        <p className="text-sm text-foreground-secondary">
          상담과 견적은 무료입니다. 편하게 물어보세요.
        </p>
        <Link
          href="/contact"
          data-gtm-cta="about_contact"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-all hover:bg-accent-hover active:scale-95"
        >
          상담 문의하기
          <ArrowRight size={16} aria-hidden />
        </Link>
      </motion.div>
    </div>
  );
}
