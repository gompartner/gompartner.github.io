import type { Metadata } from "next";
import Section, { SectionHeading } from "@/components/ui/Section";
import { BlogList } from "@/components/blog/BlogList";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "홈페이지 제작, 랜딩페이지, 운영과 유지보수. 현업 경험을 사업자의 눈높이로 풀어내는 블로그입니다.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <Section>
      <SectionHeading
        label="Blog"
        title="사업에 도움이 되는 웹 이야기"
        description="홈페이지, 랜딩페이지, 운영과 유지보수. 현업 경험을 사업자의 눈높이로 정리합니다."
      />
      <BlogList posts={blogPosts} />
    </Section>
  );
}
