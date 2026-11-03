import type { Metadata } from "next";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { InsightList, type InsightRow } from "@/components/classic/support/InsightList";
import { insights, readMinutes } from "@/data/classic/insights";
import { channelLabel, channelPosts } from "@/data/classic/channelPosts";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "인사이트",
  description:
    "홈페이지 인수, 운영 관리, 장애 대응을 실제로 해 온 순서대로 정리한 글입니다.",
  path: "/insight",
});

// 인사이트 목록. 토스, 요즘IT 글 목록처럼 왼쪽에 묶음 이름, 제목, 요약, 읽는 시간, 오른쪽에 대표 이미지(11-02). 날짜는 화면에 두지 않는다(11-02). date는 정렬과 사이트맵에만 쓴다.
// 11-04 네이버 블로그, 티스토리, 유튜브 글도 같은 목록에 섞는다(ops/channel-posts.mjs가 RSS로 받음). 바깥 글은 새 창으로 연다.
export default function ClassicInsightPage() {
  const rows: InsightRow[] = [
    ...insights.map((n) => ({ kind: "own" as const, key: `own-${n.slug}`, href: `/insight/${n.slug}`, title: n.title, summary: n.summary, badge: `${n.series} ${n.no}편`, minutes: readMinutes(n), image: n.image.src, date: n.date })),
    ...channelPosts.map((p) => ({ kind: p.source, key: `${p.source}-${p.id}`, href: p.url, title: p.title, summary: p.desc, badge: channelLabel[p.source], image: p.thumb, date: p.date })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHead
        title="인사이트"
        trail={[{ href: "/notice", label: "고객지원" }, { href: "/insight", label: "인사이트" }]}
      />
      <SupportTabs current="/insight" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <InsightList rows={rows} />
      </div>
    </>
  );
}
