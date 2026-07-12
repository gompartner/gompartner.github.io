"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, CheckCircle2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDateRange, calculateDuration } from "@/lib/utils";
import type { CareerItem } from "@/lib/types";

interface TimelineItemProps {
  item: CareerItem;
  index: number;
  isLast: boolean;
}

export function TimelineItem({ item, index, isLast }: TimelineItemProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative flex gap-6 md:gap-8"
    >
      {/* Timeline rail */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Dot */}
        <div
          className="w-10 h-10 rounded-full bg-surface border-2 border-accent flex items-center justify-center z-10"
          aria-hidden
        >
          <Briefcase size={16} className="text-accent" />
        </div>
        {/* Line */}
        {!isLast && (
          <div className="w-px flex-1 mt-2 bg-gradient-to-b from-border to-transparent min-h-[2rem]" aria-hidden />
        )}
      </div>

      {/* Content */}
      <div className="pb-12 flex-1 min-w-0">
        {/* Company & Role */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {item.companyUrl ? (
                <a
                  href={item.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold text-foreground hover:text-accent transition-colors flex items-center gap-1"
                  aria-label={`${item.company} 웹사이트 방문`}
                >
                  {item.company}
                  <ExternalLink size={14} className="text-foreground-tertiary" aria-hidden />
                </a>
              ) : (
                <h3 className="text-xl font-semibold text-foreground">{item.company}</h3>
              )}
              <Badge variant="outline" size="sm">{item.employmentType}</Badge>
            </div>
            <p className="text-base font-medium text-accent mt-0.5">{item.role}</p>
          </div>

          {/* Period + duration */}
          <div className="text-right flex-shrink-0">
            <p className="text-sm text-foreground-secondary">
              {formatDateRange(item.startDate, item.endDate)}
            </p>
            <p className="text-xs text-foreground-tertiary mt-0.5">
              ({calculateDuration(item.startDate, item.endDate)})
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-foreground-secondary text-sm leading-relaxed">
          {item.description}
        </p>

        {/* Responsibilities */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-foreground-tertiary uppercase tracking-wider mb-3">
            담당 업무
          </h4>
          <ul className="space-y-1.5">
            {item.responsibilities.map((resp) => (
              <li key={resp} className="flex items-start gap-2 text-sm text-foreground-secondary">
                <span className="text-foreground-tertiary mt-1 flex-shrink-0" aria-hidden>–</span>
                {resp}
              </li>
            ))}
          </ul>
        </div>

        {/* Achievements */}
        {item.achievements.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-success/5 border border-success/20">
            <h4 className="text-xs font-semibold text-success uppercase tracking-wider mb-3">
              성과
            </h4>
            <ul className="space-y-1.5">
              {item.achievements.map((ach) => (
                <li key={ach} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" aria-hidden />
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech stack */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-foreground-tertiary uppercase tracking-wider mb-3">
            기술 스택
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {item.techStack.map((tech) => (
              <Badge key={tech} variant="default" size="sm">{tech}</Badge>
            ))}
          </div>
        </div>

        {/* Projects */}
        {item.projects.length > 0 && (
          <div className="mt-5">
            <h4 className="text-xs font-semibold text-foreground-tertiary uppercase tracking-wider mb-3">
              주요 프로젝트
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {item.projects.map((proj) => (
                <div
                  key={proj.name}
                  className="p-3 rounded-xl border border-border bg-surface text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{proj.name}</p>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${proj.name} 링크`}
                        className="text-foreground-tertiary hover:text-accent transition-colors flex-shrink-0"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-foreground-secondary">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
