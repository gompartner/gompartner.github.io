import type { Metadata } from "next";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { InsightList, type InsightRow } from "@/components/classic/support/InsightList";
import { insights, readMinutes } from "@/data/classic/insights";
import { channelPosts } from "@/data/classic/channelPosts";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "인사이트",
  description:
    "홈페이지 인수, 운영 관리, 장애 대응을 실제로 해 온 순서대로 정리한 글입니다.",
  path: "/insight",
});

// 인사이트 목록. 토스, 요즘IT 글 목록처럼 왼쪽에 묶음 이름, 제목, 요약, 읽는 시간, 오른쪽에 대표 이미지(11-02). 11-12 사용자: 날짜도 보인다.
// 11-04 네이버 블로그, 티스토리, 유튜브 글도 같은 목록에 섞는다(ops/channel-posts.mjs가 RSS로 받음). 바깥 글은 새 창으로 연다.

export default function ClassicInsightPage() {
  const rows: InsightRow[] = [
    ...insights.map((n) => ({ kind: "own" as const, key: `own-${n.slug}`, href: `/insight/${n.slug}`, title: n.title, summary: n.summary, badge: `${n.series} ${n.no}편`, minutes: readMinutes(n), image: n.image.src, date: n.date, no: n.no })),
    // 11-11 바깥 채널 글은 뺐다가, 11-12 사용자: 홈페이지 이야기는 네이버 블로그에 있으니 네이버 블로그 글만 다시 넣는다(새 창)
    ...channelPosts.filter((p) => p.source === "naver").map((p) => ({ kind: "naver" as const, key: `naver-${p.id}`, href: p.url, title: p.title, summary: p.desc, badge: "", image: p.thumb, date: p.date, no: 0 })),
  // 같은 날 나간 글은 편 번호가 큰 것이 위로(11-08: 보안 경보 2, 3편이 2, 3, 1 순으로 보였음)
  ].sort((a, b) => b.date.localeCompare(a.date) || (b.no ?? 0) - (a.no ?? 0));
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
