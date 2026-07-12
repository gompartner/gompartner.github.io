"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

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
      className="group rounded-2xl border border-border bg-surface overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} 프로젝트 상세 보기`}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-surface-secondary overflow-hidden flex-shrink-0">
        <Image
          src={project.imageUrl}
          alt={`${project.title} 스크린샷`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      <div className="p-6 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div>
          <p className="text-xs text-foreground-tertiary uppercase tracking-wider mb-1">
            {project.period}
          </p>
          <h3 className="text-lg font-semibold text-foreground leading-snug">
            {project.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground-secondary leading-relaxed line-clamp-3 flex-1">
          {project.description}
        </p>

        {/* Achievements preview */}
        {project.achievements.length > 0 && (
          <p className="text-xs text-success font-medium flex items-start gap-1">
            <span aria-hidden>✓</span>
            {project.achievements[0]}
          </p>
        )}

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="default" size="sm">
              {tech}
            </Badge>
          ))}
          {project.techStack.length > 3 && (
            <Badge variant="outline" size="sm">
              +{project.techStack.length - 3}
            </Badge>
          )}
        </div>

        {/* Links */}
        <div
          className="flex items-center gap-4 pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              aria-label={`${project.title} 데모 보기`}
              className="flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-foreground transition-colors"
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
