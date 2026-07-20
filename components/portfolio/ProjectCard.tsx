"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DemoPreview } from "@/components/home/DemoPreview";
import type { Project } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  homepage: "홈페이지",
  landing: "랜딩페이지",
  system: "예약·문의",
  admin: "관리자",
  operation: "자동화",
};

// 심플 데모 미리보기 카드 — 설명은 블로그로, 여기선 바로 데모를 열어본다.
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-full"
    >
      <Link
        href={project.demoUrl ?? "#"}
        data-gtm-cta={`portfolio_demo_${project.id}`}
        className="iri-border glass group flex h-full flex-col rounded-3xl p-5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl"
      >
        <DemoPreview category={project.category} />
        <div className="mt-4 flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <Badge variant="subtle" size="sm" className="shrink-0 whitespace-nowrap">
            {categoryLabels[project.category] ?? "샘플"}
          </Badge>
        </div>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
          데모 보기
          <ArrowUpRight
            size={15}
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </Link>
    </motion.article>
  );
}
