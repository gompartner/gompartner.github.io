import { Download } from "lucide-react";

// 견적 질문지: 미리보기 두 장과 PDF 내려받기 (파일은 public/files/estimate-questions)
const DIR = "/files/estimate-questions";

export function EstimateQuestions() {
  return (
    <div className="mt-8">
      <p className="text-[17px] leading-[1.6] text-foreground-secondary">
        업체에 그대로 보내도 되는 질문 12개와 받은 답을 비교하는 표입니다. 1쪽은 새로 만들 때, 2쪽은 유지보수 견적과 여러 업체 비교에 씁니다.
      </p>
      <a
        href={`${DIR}/gompartner-estimate-questions.pdf`}
        download
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-[#15171c] px-5 text-[16px] font-bold text-white"
      >
        <Download size={18} aria-hidden />
        PDF 내려받기
      </a>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {[1, 2].map((n) => (
          <img
            key={n}
            src={`${DIR}/page-${n}.jpg`}
            alt={`견적 질문지 ${n}쪽`}
            width={990}
            height={1400}
            loading="lazy"
            className="h-auto w-full rounded-md border border-[#e6e9ee]"
          />
        ))}
      </div>
    </div>
  );
}
