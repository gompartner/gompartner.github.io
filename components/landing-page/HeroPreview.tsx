import { Bell, FileSpreadsheet } from "lucide-react";

// 첫 화면 오른쪽 그림. 신청이 들어오면 휴대폰에 뜨는 알림과 시트에 쌓이는 줄을 겹쳐 보여 준다.
// 아래 '신청 접수 화면'(OwnerPreview)의 요약판이라 움직임 없이 그린다.
const ROWS = [
  { at: "10:42", name: "김ㅎ늘", what: "정수기 렌탈", ad: "네이버", status: "통화 전", tone: "border-[#cdd1d5] text-[#58616a]" },
  { at: "09:05", name: "이ㅈ민", what: "학원 모집", ad: "네이버", status: "계약", tone: "border-accent bg-accent text-white" },
  { at: "어제", name: "박ㅅ연", what: "입주청소", ad: "메타", status: "통화함", tone: "border-[#1e2124] text-[#1e2124]" },
  { at: "어제", name: "최ㅇ준", what: "인테리어", ad: "블로그", status: "보류", tone: "border-[#cdd1d5] text-[#8a949e]" },
];

export function HeroPreview() {
  return (
    <figure className="relative pb-24">
      <div className="overflow-hidden rounded-[12px] border border-border bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
        <p className="flex items-center gap-2 border-b border-border bg-surface px-5 py-3 text-[15px] font-bold">
          <FileSpreadsheet size={18} className="text-[#188038]" aria-hidden />
          곰파트너 랜딩 신청
        </p>
        <table className="w-full text-left text-[15px]">
          <thead className="text-foreground-secondary">
            <tr className="border-b border-border">
              <th className="px-5 py-2.5 font-normal">접수</th>
              <th className="py-2.5 font-normal">이름</th>
              <th className="py-2.5 font-normal">업종 · 광고</th>
              <th className="py-2.5 pr-5 font-normal">상담 상태</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} className={`border-b border-border last:border-0 ${i === 0 ? "bg-[#ecf2fe]" : ""}`}>
                <td className="px-5 py-3 tabular-nums text-foreground-secondary">{r.at}</td>
                <td className="py-3 font-bold">{r.name}</td>
                <td className="py-3">
                  {r.what} <span className="text-foreground-secondary">· {r.ad}</span>
                </td>
                <td className="py-3 pr-5">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[13px] font-bold ${r.tone}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="absolute bottom-0 right-6 w-[300px] rounded-[16px] bg-[#1e2124] p-4 text-white shadow-[0_16px_40px_rgba(15,23,42,0.28)]">
        <p className="flex items-center gap-2 text-[13px] text-white/70">
          <Bell size={15} aria-hidden />
          문자 · 지금
        </p>
        <p className="mt-2 text-[15px] font-bold">[곰파트너] 새 신청 1건</p>
        <p className="mt-1 text-[15px] leading-[1.6] text-white/85">
          김ㅎ늘 · 010-1234-****
          <br />
          정수기 렌탈 · 네이버 검색광고
        </p>
      </div>
      <figcaption className="sr-only">신청이 들어오면 휴대폰 알림이 오고 구글 시트에 상담 상태와 함께 기록되는 화면</figcaption>
    </figure>
  );
}
