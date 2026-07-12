"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SkillItem } from "./SkillItem";
import type { SkillCategory as SkillCategoryType } from "@/lib/types";

const categoryIcons: Record<string, string> = {
  frontend: "🖥️",
  backend: "⚙️",
  database: "🗄️",
  cloud: "☁️",
  devops: "🚀",
  ai: "🤖",
};

interface SkillCategoryProps {
  category: SkillCategoryType;
  index: number;
}

export function SkillCategory({ category, index }: SkillCategoryProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      aria-labelledby={`skill-category-${category.id}`}
      className="rounded-2xl border border-border bg-surface p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl" aria-hidden>
          {categoryIcons[category.id] ?? "🔧"}
        </span>
        <h3
          id={`skill-category-${category.id}`}
          className="text-lg font-semibold text-foreground"
        >
          {category.label}
        </h3>
        <span className="ml-auto text-xs text-foreground-tertiary">
          {category.skills.length}개
        </span>
      </div>

      <div className="space-y-4">
        {category.skills.map((skill, i) => (
          <SkillItem key={skill.name} skill={skill} index={i} />
        ))}
      </div>
    </motion.section>
  );
}
