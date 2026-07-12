"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { skillLevelMap } from "@/data/skills";
import type { Skill } from "@/lib/types";

interface SkillItemProps {
  skill: Skill;
  index: number;
}

export function SkillItem({ skill, index }: SkillItemProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const levelInfo = skillLevelMap[skill.level];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{skill.name}</span>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            skill.level === "Expert" && "bg-accent/15 text-accent",
            skill.level === "Advanced" && "bg-accent/10 text-accent",
            skill.level === "Intermediate" && "bg-surface-secondary text-foreground-secondary",
            skill.level === "Beginner" && "bg-surface-secondary text-foreground-tertiary"
          )}
        >
          {levelInfo.label}
        </span>
      </div>
      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full bg-surface-secondary overflow-hidden"
        role="progressbar"
        aria-valuenow={
          skill.level === "Expert" ? 100 : skill.level === "Advanced" ? 75 : skill.level === "Intermediate" ? 50 : 25
        }
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${skill.name} 숙련도`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: levelInfo.width } : { width: 0 }}
          transition={{ duration: 0.8, delay: index * 0.04 + 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn("h-full rounded-full", levelInfo.color)}
        />
      </div>
    </motion.div>
  );
}
