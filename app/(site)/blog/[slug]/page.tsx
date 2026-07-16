import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Section from "@/components/ui/Section";
import { BlogPreview } from "@/components/blog/BlogPreview";
import { blogPosts, getBlogPostBySlug } from "@/data/blog";
import { profile } from "@/data/profile";
import { formatDate } from "@/lib/utils";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.heroImageUrl ? [post.heroImageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: post.heroImageUrl ? [post.heroImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <Section>
      <article className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft size={16} aria-hidden />
          블로그로 돌아가기
        </Link>

        <header className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="subtle">
                {tag}
              </Badge>
            ))}
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              {post.title}
            </h1>
            <p className="mt-5 text-lg text-foreground-secondary leading-relaxed">
              {post.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-tertiary">
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} aria-hidden />
              {post.readingTime}분 읽기
            </span>
          </div>

          {/* 블로그 전용 미리보기 —
              본문 폭까지 늘리면 성겨 보여 카드 크기로 유지하고 배너에 얹는다 */}
          <div className="mt-8 rounded-3xl border border-accent/15 bg-gradient-to-br from-accent/12 via-accent/6 to-transparent p-6 md:p-10">
            <div className="mx-auto max-w-md">
              <BlogPreview category={post.category} />
            </div>
          </div>
        </header>

        <div className="mt-12 space-y-7">
          {post.content.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={`${block.type}-${index}`}
                  className="pt-6 text-2xl font-semibold tracking-tight text-foreground"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "list") {
              return (
                <ul key={`${block.type}-${index}`} className="space-y-3">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-foreground-secondary leading-relaxed"
                    >
                      <span className="text-accent mt-1" aria-hidden>
                        -
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            if (block.type === "quote") {
              return (
                <blockquote
                  key={`${block.type}-${index}`}
                  className="border-l-4 border-accent pl-5 py-2 text-lg font-medium text-foreground"
                >
                  {block.text}
                </blockquote>
              );
            }

            return (
              <p
                key={`${block.type}-${index}`}
                className="text-foreground-secondary leading-8"
              >
                {block.text}
              </p>
            );
          })}
        </div>

        <aside
          aria-label="상담 문의 안내"
          className="mt-16 rounded-3xl border border-border bg-surface p-8 text-center md:p-10"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            읽으면서 우리 사업이 떠오르셨나요?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-foreground-secondary leading-relaxed">
            새로 만들 계획이든, 운영 중인 사이트의 고민이든 좋습니다. 현업 경험으로
            지금 상황에 맞는 가장 현실적인 방향을 함께 정리해 드립니다.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              상담 문의하기
              <ArrowRight size={17} aria-hidden />
            </Link>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-surface-secondary"
            >
              <Mail size={17} aria-hidden />
              {profile.email}
            </a>
          </div>
        </aside>
      </article>
    </Section>
  );
}
