"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Briefcase, Heart } from "lucide-react";
import { profile } from "@/data/profile";

const values = [
  {
    icon: "🎯",
    title: "사업자 중심 제작",
    description:
      "예산과 시간이 제한된 소규모 사업자가 바로 사용할 수 있는 웹사이트를 우선합니다.",
  },
  {
    icon: "⚡",
    title: "빠른 구축과 운영",
    description:
      "템플릿 기반 제작과 필요한 커스터마이징을 조합해 빠르게 오픈하고 지속 운영합니다.",
  },
  {
    icon: "📱",
    title: "모바일 최적화",
    description:
      "방문자가 가장 많이 보는 모바일 화면에서 문의와 예약, 이벤트 참여가 자연스럽게 이어지도록 구성합니다.",
  },
  {
    icon: "🛠️",
    title: "지속적 개선",
    description:
      "오픈 이후 콘텐츠 업데이트, SEO, 이벤트 페이지 운영, 간단한 자동화까지 함께 개선합니다.",
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
              15년차 백엔드 개발자
            </p>
            <p className="flex items-center gap-2 text-foreground-secondary text-sm">
              <Heart size={15} aria-hidden />
              웹사이트 제작 / 유지보수 / 마케팅 이벤트
            </p>
          </div>

          <p className="text-foreground-secondary leading-relaxed">{profile.bio}</p>

        </motion.div>
      </div>

      {/* Values */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl md:text-3xl font-semibold tracking-tight mb-8"
        >
          개발 철학
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
              className="p-6 rounded-2xl border border-border bg-surface"
            >
              <span className="text-3xl" aria-hidden>
                {value.icon}
              </span>
              <h3 className="mt-3 font-semibold text-foreground">{value.title}</h3>
              <p className="mt-2 text-sm text-foreground-secondary leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Currently */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="p-8 rounded-2xl bg-accent/5 border border-accent/20"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">현재 관심사</h2>
        <ul className="space-y-2 text-foreground-secondary">
          {[
            "소상공인과 1인 사업자를 위한 빠른 웹사이트 제작",
            "월 단위 유지보수와 콘텐츠 업데이트 운영",
            "예약, 문의, 챗봇, 뉴스레터 등 가벼운 자동화 연계",
            "마케팅 이벤트 페이지와 모바일 전환율 개선",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <span className="text-accent mt-1" aria-hidden>
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* 경력·기술 상세로 연결 (헤더 메뉴에서 About으로 통합됨) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {[
          {
            href: "/career",
            title: "경력 살펴보기",
            description: "2009년부터 지금까지, 8개 기업에서의 실무 이력",
          },
          {
            href: "/skills",
            title: "기술 스택 보기",
            description: "백엔드부터 웹 UI, 클라우드, AI까지 다루는 기술",
          },
        ].map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lg"
          >
            <div>
              <h2 className="font-semibold text-foreground transition-colors group-hover:text-accent">
                {title}
              </h2>
              <p className="mt-1 text-sm text-foreground-secondary">{description}</p>
            </div>
            <ArrowRight
              size={18}
              aria-hidden
              className="flex-shrink-0 text-foreground-tertiary transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
            />
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
