import type { Metadata } from "next";
import { EstimateQuestions } from "@/components/tools/EstimateQuestions";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "홈페이지 견적 질문지 (업체에 보낼 질문 12개)", description: "홈페이지 제작 견적을 받기 전에 업체에 그대로 보낼 질문 12개와 괜찮은 답, 다시 물어볼 답을 정리했습니다. 둘째 해 비용, 도메인 명의, 수정 횟수를 확인하세요.", path: "/tools/estimate-questions" });

export default function ClassicEstimateQuestionsPage() {
  return (
    <ToolFrame href="/tools/estimate-questions">
      <EstimateQuestions />
    </ToolFrame>
  );
}
