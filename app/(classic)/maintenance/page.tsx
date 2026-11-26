import type { Metadata } from "next";
import { CareBoard } from "@/components/classic/care/CareBoard";
import { pageMeta } from "@/lib/seo";

// 11-26 유지보수 한 판으로 바꿈(예전 긴 문서 페이지와 하위 페이지 6종은 내림, 옛 주소는 이 판으로 넘긴다)
export const metadata: Metadata = pageMeta({
  title: "홈페이지 유지보수",
  description: "접속 오류와 문구 수정부터 유지보수 업체 변경까지 맡습니다. 수정은 건별 10,000원부터입니다.",
  alt: "곰파트너 홈페이지 유지보수. 상황별 작업 내용과 금액",
  path: "/maintenance",
});

export default function MaintenancePage() {
  return <CareBoard />;
}
