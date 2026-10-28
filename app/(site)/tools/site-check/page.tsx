import { SiteCheck } from "@/components/classic/tools/SiteCheck";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "홈페이지 진단 (접속, 보안, 휴대폰 화면, 속도, 검색 노출)",
  description: "홈페이지 주소를 넣으면 접속과 보안 설정, 휴대폰 화면, 속도, 검색 노출 문제를 급함, 주의, 양호로 나눠 보여 드려요.",
  path: "/tools/site-check",
});

export default function SiteCheckPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="mb-6 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">홈페이지 진단</h1>
      <SiteCheck />
    </div>
  );
}
