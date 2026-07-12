"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, ExternalLink, CheckCircle2, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/types";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Trap focus & close on Escape
  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} 상세 정보`}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border shadow-2xl"
      >
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="모달 닫기"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border text-foreground-secondary hover:text-foreground hover:bg-surface-secondary transition-colors"
        >
          <X size={18} />
        </button>

        {/* Image */}
        <div className="relative h-56 w-full bg-surface-secondary">
          <Image
            src={project.imageUrl}
            alt={`${project.title} 스크린샷`}
            fill
            className="object-cover"
            sizes="672px"
          />
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <p className="text-xs text-foreground-tertiary uppercase tracking-wider mb-2">
              {project.period}
            </p>
            <h2 className="text-2xl font-semibold text-foreground">{project.title}</h2>
          </div>

          {/* Long description */}
          <p className="text-foreground-secondary leading-relaxed">
            {project.longDescription ?? project.description}
          </p>

          {/* Tech stack */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
              사용 기술
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="subtle">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
              성과
            </h3>
            <ul className="space-y-2">
              {project.achievements.map((ach) => (
                <li key={ach} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" aria-hidden />
                  {ach}
                </li>
              ))}
            </ul>
          </div>

          {/* Responsibilities */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
              담당 업무
            </h3>
            <ul className="space-y-2">
              {project.responsibilities.map((resp) => (
                <li key={resp} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <User size={16} className="text-accent mt-0.5 flex-shrink-0" aria-hidden />
                  {resp}
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <ExternalLink size={16} />
                데모 보기
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
