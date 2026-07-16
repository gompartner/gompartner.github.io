"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  CheckCircle2,
  CircleAlert,
  Clock,
  MessageCircle,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
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

        <div className="p-6 pt-12 md:p-8 md:pt-12 space-y-6">
          {/* Header */}
          <div>
            <p className="text-xs text-foreground-tertiary uppercase tracking-wider mb-2">
              {project.period}
            </p>
            <h2 className="text-2xl font-semibold text-foreground">{project.title}</h2>
          </div>

          {/* 제작 목적 | 해결한 문제 */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                제작 목적
              </h3>
              <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground-secondary">
                <Target size={16} className="text-accent mt-0.5 flex-shrink-0" aria-hidden />
                {project.purpose}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                해결한 문제
              </h3>
              <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground-secondary">
                <CircleAlert size={16} className="text-accent mt-0.5 flex-shrink-0" aria-hidden />
                {project.problemSolved}
              </p>
            </div>
          </div>

          {/* 주요 기능 | 기대 효과 */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                주요 기능
              </h3>
              <ul className="space-y-2">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground-secondary">
                    <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                이런 효과를 기대할 수 있습니다
              </h3>
              <ul className="space-y-2">
                {project.operationEffect.map((effect) => (
                  <li key={effect} className="flex items-start gap-2 text-sm text-foreground-secondary">
                    <TrendingUp size={16} className="text-accent mt-0.5 flex-shrink-0" aria-hidden />
                    {effect}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 이런 분께 추천 | 예상 제작 기간 */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                이런 분께 추천
              </h3>
              <ul className="space-y-2">
                {project.recommendedFor.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground-secondary">
                    <User size={16} className="text-accent mt-0.5 flex-shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                예상 제작 기간
              </h3>
              <p className="flex items-start gap-2 text-sm text-foreground-secondary">
                <Clock size={16} className="text-accent mt-0.5 flex-shrink-0" aria-hidden />
                <span>
                  {project.buildTime}
                  <span className="text-foreground-tertiary">
                    {" "}
                    · 정확한 기간은 상담에서 확정됩니다
                  </span>
                </span>
              </p>
            </div>
          </div>

          <p className="text-xs text-foreground-tertiary">
            이 화면들은 기능을 체험해 보시라고 만든 샘플 데모입니다.
          </p>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                data-gtm-cta={`project_modal_demo_${project.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <ExternalLink size={16} />
                데모 보기
              </a>
            )}
            <Link
              href="/contact"
              data-gtm-cta={`project_modal_contact_${project.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-medium hover:bg-surface transition-colors"
            >
              <MessageCircle size={16} />
              이런 사이트 상담하기
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
