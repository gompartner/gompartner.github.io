"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DemoPreview } from "@/components/home/DemoPreview";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

// 메인 Live Demos 카드와 동일한 디자인 언어 (CSS 목업 미리보기 + 배지 + 악센트 링크)
export function ProjectCard({ project, index, onClick }: ProjectCardProps) {
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
      className="group flex h-full cursor-pointer flex-col gap-4 rounded-3xl border border-border bg-background p-5 transition-all duration-300 hover:border-accent/30 hover:shadow-xl"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} 프로젝트 상세 보기`}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <DemoPreview category={project.category} />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <Badge variant="subtle" size="sm" className="shrink-0 whitespace-nowrap">
            {project.period}
          </Badge>
        </div>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-secondary">
          {project.description}
        </p>

        {/* Recommended preview */}
        {project.recommendedFor.length > 0 && (
          <p className="mt-3 flex items-start gap-1 text-xs font-medium text-success">
            <span aria-hidden>✓</span>
            추천: {project.recommendedFor[0]}
          </p>
        )}

        {/* Links */}
        <div
          className="mt-4 flex items-center justify-between gap-4 pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent"
          >
            자세히 보기
            <ArrowUpRight
              size={15}
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              data-gtm-cta={`project_demo_${project.id}`}
              aria-label={`${project.title} 데모 보기`}
              className="flex items-center gap-1.5 text-sm text-foreground-secondary transition-colors hover:text-foreground"
            >
              <ExternalLink size={14} />
              데모 보기
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
