import type { Metadata } from "next";
import Section, { SectionHeading } from "@/components/ui/Section";
import { BlogCard } from "@/components/blog/BlogCard";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "홈페이지 제작, 랜딩페이지, 운영과 유지보수. 15년 웹 개발 경험을 사업자의 눈높이로 풀어내는 블로그입니다.",
};

export default function BlogPage() {
  return (
    <Section>
      <SectionHeading
        label="Blog"
        title="사업에 도움이 되는 웹 이야기"
        description="홈페이지, 랜딩페이지, 운영과 유지보수. 15년의 경험을 사업자의 눈높이로 정리합니다."
      />
      <div className="flex flex-col gap-4" role="feed" aria-label="블로그 포스트 목록">
        {blogPosts.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </Section>
  );
}
