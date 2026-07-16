"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { projects } from "@/data/projects";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  const handleSelect = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

  return (
    <>
      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="프로젝트 카테고리 필터"
        className="flex flex-wrap gap-2 mb-10"
      >
        {categories.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeCategory === id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeCategory === id
                ? "bg-foreground text-background"
                : "bg-surface border border-border text-foreground-secondary hover:text-foreground hover:border-foreground-tertiary"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onClick={() => handleSelect(project)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-center text-foreground-secondary py-16">
          해당 카테고리의 프로젝트가 없습니다.
        </p>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={handleClose} />
        )}
      </AnimatePresence>
    </>
  );
}
