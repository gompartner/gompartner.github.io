import type { Metadata } from "next";
import { CareBoard } from "@/components/classic/care/CareBoard";
import { pageMeta } from "@/lib/seo";

// 11-26 유지보수 한 판으로 바꿈(예전 긴 문서 페이지와 하위 페이지 6종은 내림, 옛 주소는 이 판으로 넘긴다)
export const metadata: Metadata = pageMeta({
  title: "홈페이지 유지보수",
  description: "사이트가 열리지 않을 때, 글자나 사진을 바꿀 때, 만든 업체와 연락이 안 될 때. 상황을 고르면 해 드리는 일과 금액, 받는 문서를 한 화면에서 확인할 수 있습니다. 수정은 건별 10,000원부터.",
  path: "/maintenance",
});

export default function MaintenancePage() {
  return <CareBoard />;
}
