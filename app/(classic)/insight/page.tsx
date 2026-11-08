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
const LECTURE = /^(.*?)\s*\|\s*(.+?) 운영 노하우 (\d+)편$/;
// 설명란 앞의 "그누보드 운영 노하우 N편, 제목." 과 매번 같은 안내 문장은 빼고 "오늘 정리"부터 보인다. 강의 썸네일은 4:3 검은 띠가 없는 큰 그림으로.
const lectureSummary = (d: string) => d.replace(/^.*?운영 노하우 \d+편, [^.]*\.\s*/, "").replace(/실제로 자주 올라오는 질문을 바탕으로[^.]*\.\s*/, "");

export default function ClassicInsightPage() {
  const rows: InsightRow[] = [
    ...insights.map((n) => ({ kind: "own" as const, key: `own-${n.slug}`, href: `/insight/${n.slug}`, title: n.title, summary: n.summary, badge: `${n.series} ${n.no}편`, minutes: readMinutes(n), image: n.image.src, date: n.date, no: n.no })),
    // 11-09 유튜브 운영 강의는 제목 끝 "| 그누보드 운영 노하우 N편"을 떼고 이름표를 "그누보드 운영 N편"으로(사고 이야기는 그대로 "유튜브")
    ...channelPosts.map((p) => {
      const lec = p.source === "youtube" ? p.title.match(LECTURE) : null;
      return { kind: p.source, key: `${p.source}-${p.id}`, href: p.url, title: lec ? lec[1] : p.title, summary: lec ? lectureSummary(p.desc) : p.desc, badge: lec ? `${lec[2]} 운영 ${lec[3]}편` : channelLabel[p.source], image: lec ? `https://i.ytimg.com/vi/${p.id}/maxresdefault.jpg` : p.thumb, date: p.date, no: lec ? Number(lec[3]) : 0 };
    }),
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
