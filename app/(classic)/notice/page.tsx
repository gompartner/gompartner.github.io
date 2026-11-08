import type { Metadata } from "next";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { NoticeList } from "@/components/classic/support/NoticeList";
import { eventStatus, notices } from "@/data/classic/notices";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "공지사항",
  description: "곰파트너 서비스 운영, 정책 변경 안내와 이벤트입니다.",
  path: "/notice",
});

// 공지사항 목록. 일반 회사 게시판처럼 번호, 제목, 날짜를 두고 제목을 누르면 글로 간다.
export default function ClassicNoticePage() {
  return (
    <>
      <PageHead title="공지사항" trail={[{ href: "/notice", label: "고객지원" }, { href: "/notice", label: "공지사항" }]} />
      <SupportTabs current="/notice" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <NoticeList rows={notices.map((n) => ({ id: n.id, title: n.title, date: n.date, status: eventStatus(n) }))} />
      </div>
    </>
  );
}
