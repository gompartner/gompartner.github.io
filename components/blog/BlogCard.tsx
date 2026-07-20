"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BlogPreview } from "@/components/blog/BlogPreview";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

// 메인 Live Demos·포트폴리오 카드와 동일한 디자인 언어
export function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        aria-label={`${post.title} 글 읽기`}
        className="iri-border glass group flex flex-col gap-5 rounded-3xl p-5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl sm:flex-row"
      >
        {/* 카테고리별 블로그 전용 미리보기 */}
        <div className="w-full flex-shrink-0 self-center sm:w-48">
          <BlogPreview category={post.category} />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="subtle" size="sm" className="whitespace-nowrap">
                {post.category}
              </Badge>
              {post.tags
                .filter((tag) => tag !== post.category)
                .slice(0, 2)
                .map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>

          <h3 className="font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
            {post.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-foreground-secondary">
            {post.summary}
          </p>

          <div className="mt-auto flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4 text-xs text-foreground-tertiary">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span
                className="flex items-center gap-1"
                aria-label={`읽기 시간 ${post.readingTime}분`}
              >
                <Clock size={12} aria-hidden />
                {post.readingTime}분
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
              읽어보기
              <ArrowUpRight
                size={15}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
