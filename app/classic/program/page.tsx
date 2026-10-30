import type { Metadata } from "next";
import { Check } from "lucide-react";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, h2, wrap } from "@/components/classic/ui";
import { demoProjects, isProgram } from "@/components/classic/works/samples";
import { pageMeta } from "@/lib/seo";

// 업무 프로그램 서비스 상세. 홈페이지 제작, 광고 랜딩페이지, 유지보수 페이지와 같은 틀을 쓴다(10-30).
// 카탈로그 화면은 보여 주지 않고, 구현 범위와 사례, 업무 프로그램에 맞춘 진행 방식을 글로 설명한다.
const programs = demoProjects.filter(isProgram);
const plain = (t: string) => t.replaceAll("·", ", ");

export const metadata: Metadata = pageMeta({
  title: "업무 프로그램 제작",
  description: "주문 취합, 쇼핑몰 관리자, 결과지 출력처럼 엑셀로 하던 반복 업무를 웹 프로그램으로 만듭니다. 견적은 범위 확인 뒤 안내합니다.",
  path: "/classic/program",
});

const FOR_WHOM = [
  "주문서나 신청서를 엑셀로 모아 손으로 합치는 경우",
  "같은 자료를 여러 파일에 반복해서 입력하는 경우",
  "결과지, 발주서를 매번 수작업으로 만드는 경우",
  "담당자만 아는 엑셀 파일로 업무가 돌아가는 경우",
];

// 구현 범위. 카탈로그에 실제로 구현된 기능에서만 뽑는다
const SCOPE = [
  { title: "데이터 수집과 검증", items: ["엑셀, CSV 파일 가져오기", "열 이름이 달라도 자동으로 맞춤", "입력 오류 검사와 일괄 수정"] },
  { title: "집계와 출력", items: ["품목별, 거래처별 집계", "발주서, 결과지 A4 인쇄와 PDF 저장", "엑셀 내려받기"] },
  { title: "관리자와 권한", items: ["주문, 신청 상태 일괄 변경", "신청자와 관리자 화면 구분", "신청, 학습 진도 통계"] },
  { title: "연동과 알림", items: ["구글 시트 저장", "문자, 메일 알림", "송장번호 엑셀 내려받기"] },
];

const STEPS = [
  { title: "업무 분석", body: "지금 쓰는 엑셀 파일과 작업 순서를 받아 입력, 계산, 출력 흐름을 정리합니다." },
  { title: "화면 설계", body: "필요한 화면과 사용자 권한을 목록으로 확정하고, 그 범위로 견적과 일정을 드립니다." },
  { title: "개발과 검수", body: "실제 데이터 일부로 입력과 출력을 확인하며 화면 단위로 검수를 받습니다." },
  { title: "이관과 납품", body: "기존 엑셀 데이터를 옮기고, 원본 소스와 사용 방법을 정리한 인계 문서를 납품합니다." },
  { title: "운영 지원", body: "납품 후 1개월간 하자를 무상으로 보수합니다. 이후에는 건별 수정 또는 월 유지보수로 지원합니다." },
];

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";

export default function ClassicProgramPage() {
  return (
    <>
      <PageHead
        title="업무 프로그램"
        trail={[
          { href: "/classic/homepage", label: "서비스" },
          { href: "/classic/program", label: "업무 프로그램" },
        ]}
      />
      <SubTabs items={serviceTabs} current="/classic/program" />

      <section aria-labelledby="pg-lead" className={`${wrap} py-12 md:py-16`}>
        <div className="border-t-2 border-[#15171c] pt-6">
          <h2 id="pg-lead" className="break-keep text-[26px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[34px]">
            엑셀 기반 반복 업무를 웹 프로그램으로 전환
          </h2>
        </div>
      </section>

      <section aria-labelledby="pg-whom" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="pg-whom" className={h2}>
            도입이 필요한 경우
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {FOR_WHOM.map((t) => (
              <li key={t} className="flex gap-3 border-b border-[#e6e9ee] py-5 text-[17px] font-bold leading-[1.55] md:py-6 md:text-[19px]">
                <Check size={22} strokeWidth={2.5} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="scope" aria-labelledby="pg-scope" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="pg-scope" className={h2}>
            구현 범위
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-x-12 lg:grid-cols-4 lg:gap-x-8">
            {SCOPE.map((g) => (
              <div key={g.title} className="border-t-2 border-[#15171c] pt-5">
                <h3 className="text-[20px] font-[800] tracking-[-0.03em] md:text-[21px]">{g.title}</h3>
                <ul className="mt-3 space-y-2 text-[16px] leading-[1.6] text-[#3d4450]" role="list">
                  {g.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Check size={18} strokeWidth={2.5} aria-hidden className="mt-[3px] shrink-0 text-[#256ef4]" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cases" aria-labelledby="pg-cases" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="pg-cases" className={h2}>
            구현 사례
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {programs.map((p) => (
              <li key={p.id} className="flex flex-col gap-3 border-b border-[#e6e9ee] py-5 md:flex-row md:gap-8 md:py-6">
                <div className="shrink-0 md:w-[260px]">
                  <span className="block text-[14px] font-bold text-[#256ef4]">{plain(p.category)}</span>
                  <h3 className="mt-0.5 break-keep text-[17px] font-bold leading-[1.4]">{plain(p.title)}</h3>
                </div>
                <ul className="flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-[16px] md:pt-5" role="list">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check size={18} strokeWidth={2.5} aria-hidden className="mt-[3px] shrink-0 text-[#256ef4]" />
                      {plain(f)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepList steps={STEPS} title="진행 방식" id="process" />
    </>
  );
}
