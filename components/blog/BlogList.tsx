"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BLOG_CATEGORIES } from "@/lib/types";
import type { BlogPost } from "@/lib/types";
import { BlogCard } from "./BlogCard";

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const [activeCategory, setActiveCategory] = useState("전체");

  // 글이 있는 카테고리만 탭으로 노출 (분류 순서는 BLOG_CATEGORIES 기준)
  const categories = [
    "전체",
    ...BLOG_CATEGORIES.filter((category) =>
      posts.some((post) => post.category === category)
    ),
  ];

  const filtered =
    activeCategory === "전체"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <>
      <div
        role="tablist"
        aria-label="블로그 카테고리 필터"
        className="flex flex-wrap gap-2 mb-10"
      >
        {categories.map((category) => (
          <button
            key={category}
            role="tab"
            aria-selected={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeCategory === category
                ? "bg-foreground text-background"
                : "bg-surface border border-border text-foreground-secondary hover:text-foreground hover:border-foreground-tertiary"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4" role="feed" aria-label="블로그 포스트 목록">
        {filtered.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </>
  );
}
