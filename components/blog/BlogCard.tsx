"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

export function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        aria-label={`${post.title} 글 읽기`}
        className="group flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border border-border bg-surface hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      >
        {/* Thumbnail */}
        {post.thumbnailUrl && (
          <div className="relative w-full sm:w-40 aspect-[3/2] flex-shrink-0 self-center rounded-xl overflow-hidden bg-surface-secondary">
            <Image
              src={post.thumbnailUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 160px"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="subtle" size="sm">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {post.title}
            <ArrowUpRight
              size={14}
              className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden
            />
          </h3>

          {/* Summary */}
          <p className="text-sm text-foreground-secondary leading-relaxed line-clamp-2">
            {post.summary}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-foreground-tertiary mt-auto pt-1">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span className="flex items-center gap-1" aria-label={`읽기 시간 ${post.readingTime}분`}>
              <Clock size={12} aria-hidden />
              {post.readingTime}분
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
