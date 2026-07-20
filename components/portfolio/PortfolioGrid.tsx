"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { projects } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";

const categories = [
  { id: "all", label: "전체" },
  { id: "homepage", label: "홈페이지" },
  { id: "landing", label: "랜딩페이지" },
  { id: "system", label: "예약·문의" },
  { id: "admin", label: "관리자" },
  { id: "operation", label: "자동화" },
];

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* 카테고리 필터 */}
      <div
        role="tablist"
        aria-label="프로젝트 카테고리 필터"
        className="mb-10 flex flex-wrap gap-2"
      >
        {categories.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeCategory === id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
              activeCategory === id
                ? "bg-accent text-white shadow-sm"
                : "glass text-foreground-secondary hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 그리드 */}
      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-foreground-secondary">
          해당 카테고리의 프로젝트가 없습니다.
        </p>
      )}
    </>
  );
}
