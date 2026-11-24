import { h2 } from "@/components/classic/ui";
import { cn } from "@/lib/utils";

// 제작 방식 비교. 남의 서비스는 일반적인 방식만 적고 이름은 쓰지 않는다.
// 곰파트너 열을 맨 앞에 둔다. 휴대폰에서 표가 옆으로 밀릴 때도 첫 화면에 보이게.
const compareCols = ["곰파트너", "셀프 제작 도구", "대형 제작사"];
const compareRows = [
  { label: "수행 인력", cells: ["상담한 담당자가 제작과 운영까지 직접 수행", "운영자가 직접 제작", "영업, 기획, 디자인, 개발 분업"] },
  { label: "업종별 법정 고지", cells: ["제작 전 검토 후 반영", "운영자가 직접 확인", "업체별 기준"] },
  { label: "납품물", cells: ["원본 소스, 점검 결과표, 인계 문서", "플랫폼 관리자 계정", "계약서에 명시된 결과물"] },
  { label: "사후 관리", cells: ["오픈 후 1개월 무상 하자보수", "운영자가 직접 대응", "별도 유지보수 계약"] },
  { label: "업체 변경", cells: ["소스와 계정이 고객 소유, 인계 문서로 바로 이관", "플랫폼 안에서 운영", "계약 조건에 따름"] },
];


export function CompareTable() {
  const th = "px-4 py-4 text-left text-[15px] font-bold md:px-5 md:text-[16px]";
  return (
    <section aria-labelledby="c-compare" className="bg-[#f4f6f9]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-20 md:px-6 md:py-28">
        <h2 id="c-compare" className={h2}>
          제작 방식 비교
        </h2>
        <div tabIndex={0} className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[640px] border-collapse border-t-2 border-[#15171c] bg-white">
            <caption className="sr-only">곰파트너, 셀프 제작 도구, 대형 제작사 비교</caption>
            <thead>
              <tr className="border-b border-[#e6e9ee]">
                <td className="w-[150px] md:w-[200px]" />
                {compareCols.map((c, n) => (
                  <th key={c} scope="col" className={cn(th, n === 0 ? "text-[#256ef4]" : "text-[#3d4450]")}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => (
                <tr key={r.label} className="border-b border-[#e6e9ee]">
                  <th scope="row" className={cn(th, "text-[#3d4450]")}>
                    {r.label}
                  </th>
                  {r.cells.map((c, n) => (
                    <td key={n} className={cn("px-4 py-4 text-[16px] leading-[1.55] md:px-5 md:text-[17px]", n === 0 ? "font-bold" : "text-[#5b6370]")}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

