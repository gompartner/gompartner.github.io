import type { Metadata } from "next";
import { EstimateQuestions } from "@/components/tools/EstimateQuestions";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "홈페이지 견적 질문지 (업체에 보낼 질문 12개)",
  description: fitDescription("홈페이지 제작 견적을 받기 전에 업체에 그대로 보낼 질문 12개와 괜찮은 답, 다시 물어볼 답을 정리했습니다. 둘째 해 비용, 도메인 명의, 수정 횟수를 확인하세요."),
  alternates: { canonical: "/tools/estimate-questions" },
};

export default function ClassicEstimateQuestionsPage() {
  return (
    <ToolFrame href="/classic/tools/estimate-questions">
      <EstimateQuestions />
    </ToolFrame>
  );
}
