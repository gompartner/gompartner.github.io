import { ChevronDown, Sheet } from "lucide-react";

// 랜딩 신청이 들어왔을 때 고객(업체 담당자)이 실제로 보는 세 화면: 휴대폰 문자 알림, 메일 알림, 구글 시트.
// 11-01 사용자: "실제 화면과 다른 그림이라 와닿지 않는다". 추상 표 대신 실제 앱 모양을 따라 그리고,
// 틀은 사이트의 카탈로그 캡처와 같은 브라우저 틀(점 세 개), 휴대폰 틀(검은 테두리)을 쓴다. 로고는 넣지 않는다.
// 시각이 바뀌지 않는 고정 화면이라 서버에서 그린다.

const LEAD = { biz: "정수기 렌탈", name: "이ㅈ원", phone: "010-1234-****", product: "정수기, 비데", time: "평일 저녁", source: "네이버 검색광고", at: "11.01 21:56" };

const ROWS = [
  { at: "11.01 21:56", name: "이ㅈ원", phone: "010-1234-****", what: "정수기, 비데", source: "네이버 검색광고", status: "통화 전", dup: false, fresh: true },
  { at: "11.01 11:20", name: "박ㅅ연", phone: "010-7731-****", what: "정수기", source: "메타 광고", status: "통화함", dup: false, fresh: false },
  { at: "11.01 09:05", name: "이ㅈ민", phone: "010-2290-****", what: "공기청정기", source: "네이버 검색광고", status: "계약", dup: true, fresh: false },
  { at: "10.31 21:40", name: "이ㅈ민", phone: "010-2290-****", what: "공기청정기", source: "네이버 검색광고", status: "보류", dup: true, fresh: false },
  { at: "10.31 14:12", name: "최ㅇ준", phone: "010-5016-****", what: "비데", source: "블로그", status: "통화 전", dup: false, fresh: false },
];

// 구글 시트 드롭다운 칩 색(연한 바탕, 진한 글자)
const CHIP: Record<string, string> = {
  "통화 전": "bg-[#fde2e1] text-[#a50e0e]",
  통화함: "bg-[#fef3c7] text-[#8a5a00]",
  계약: "bg-[#d4edda] text-[#0d652d]",
  보류: "bg-[#e8eaed] text-[#3c4043]",
};

function BrowserFrame({ label, address, children }: { label: string; address: string; children: React.ReactNode }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-3 text-[15px] font-[800] text-[#15171c]">{label}</figcaption>
      <div className="overflow-hidden rounded-md border border-[#d9dee5] bg-white shadow-[0_18px_40px_rgba(15,27,61,.10)]">
        <div className="flex h-8 items-center gap-1.5 border-b border-[#e6e9ee] bg-[#eef0f3] px-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c5cbd4]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#c5cbd4]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#c5cbd4]" />
          <span className="ml-3 truncate rounded bg-white px-3 py-0.5 text-[11px] text-[#5b6370]">{address}</span>
        </div>
        {children}
      </div>
    </figure>
  );
}

function PhoneNotice() {
  return (
    <figure className="mx-auto w-full max-w-[300px]">
      <figcaption className="mb-3 text-[15px] font-[800] text-[#15171c]">휴대폰 문자 알림</figcaption>
      <div className="rounded-[34px] border-[8px] border-[#15171c] bg-[#15171c] shadow-[0_18px_40px_rgba(15,27,61,.18)]">
        <div className="relative h-[520px] overflow-hidden rounded-[26px] bg-gradient-to-b from-[#3b4a6b] via-[#28324d] to-[#151b2e] px-3 pt-3 text-white">
          <div className="flex justify-between px-2 text-[12px] font-bold tabular-nums">
            <span>21:56</span>
            <span>LTE</span>
          </div>
          <p className="mt-8 text-center text-[56px] font-[300] leading-none tabular-nums">21:56</p>
          <p className="mt-2 text-center text-[14px] text-white/80">11월 1일 일요일</p>
          <div className="mt-8 space-y-2">
            <div className="rounded-2xl bg-white/85 p-3 text-[#15171c] backdrop-blur">
              <div className="flex justify-between text-[11px] text-[#5b6370]">
                <span className="font-bold">메시지</span>
                <span>지금</span>
              </div>
              <p className="mt-1 text-[13px] font-bold">[{LEAD.biz}] 새 신청 1건</p>
              <p className="mt-0.5 text-[13px] leading-[1.45]">
                {LEAD.name} {LEAD.phone}
                <br />
                관심 제품 {LEAD.product}, 희망 연락 {LEAD.time}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-3 text-[#15171c] backdrop-blur">
              <div className="flex justify-between text-[11px] text-[#5b6370]">
                <span className="font-bold">메시지</span>
                <span>21:30</span>
              </div>
              <p className="mt-1 text-[13px] leading-[1.45]">[{LEAD.biz}] 아직 통화 전인 신청이 2건 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

function MailNotice() {
  const rows: [string, string][] = [
    ["이름", LEAD.name],
    ["연락처", LEAD.phone],
    ["관심 제품", LEAD.product],
    ["희망 연락 시간", LEAD.time],
    ["유입 경로", LEAD.source],
    ["접수 시각", `2026. ${LEAD.at}`],
  ];
  return (
    <BrowserFrame label="메일 알림" address="mail.google.com">
      <div className="p-5">
        <p className="text-[17px] font-bold">[{LEAD.biz}] 새 신청 1건 ({LEAD.name})</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#256ef4] text-[14px] font-bold text-white">신</span>
          <div className="min-w-0 text-[13px] leading-[1.4]">
            <p>
              <b>신청 알림</b> <span className="text-[#5b6370]">&lt;no-reply@{"water-rental.kr"}&gt;</span>
            </p>
            <p className="text-[#5b6370]">받는 사람: 담당자</p>
          </div>
          <span className="ml-auto shrink-0 text-[12px] text-[#5b6370] tabular-nums">오후 9:56</span>
        </div>
        <table className="mt-4 w-full border-collapse text-[13px]">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-t border-[#e6e9ee]">
                <th className="w-[110px] bg-[#f6f7f9] px-3 py-2 text-left font-bold text-[#3d4450]">{k}</th>
                <td className="px-3 py-2">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[12px] text-[#5b6370]">구글 시트에 함께 기록되었습니다.</p>
      </div>
    </BrowserFrame>
  );
}

function SheetView() {
  const cols = ["A", "B", "C", "D", "E", "F"];
  const head = ["접수 시각", "이름", "연락처", "신청 내용", "유입 경로", "상담 상태"];
  return (
    <BrowserFrame label="구글 시트" address="docs.google.com/spreadsheets">
      <div className="flex items-center gap-3 border-b border-[#e6e9ee] px-3 py-2">
        <span className="grid h-6 w-5 place-items-center rounded-[3px] bg-[#188038] text-white" aria-hidden>
          <Sheet size={13} />
        </span>
        <span className="text-[13px] font-bold">{LEAD.biz} 신청 목록</span>
      </div>
      <div className="flex items-center gap-2 border-b border-[#e6e9ee] bg-[#f8f9fa] px-3 py-1 text-[12px] text-[#5b6370]">
        <span className="w-8 font-bold">fx</span>
        <span className="truncate">{LEAD.at}</span>
      </div>
      <div tabIndex={0} role="region" aria-label={`${LEAD.biz} 신청 목록 표, 옆으로 밀어 보기`} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#256ef4]">
        <table className="w-full min-w-[620px] border-collapse text-[12.5px]">
          <thead>
            <tr className="bg-[#f8f9fa] text-[11px] text-[#5b6370]">
              <th className="w-8 border border-[#e2e3e3] font-normal" />
              {cols.map((c) => (
                <th key={c} className="border border-[#e2e3e3] py-0.5 font-normal">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#e2e3e3] bg-[#f8f9fa] text-center text-[11px] text-[#5b6370]">1</td>
              {head.map((h) => (
                <td key={h} className="border border-[#e2e3e3] bg-[#e8f0fe] px-2 py-1.5 font-bold">
                  {h}
                </td>
              ))}
            </tr>
            {ROWS.map((r, i) => (
              <tr key={`${r.at}-${r.name}`} className={r.fresh ? "bg-[#fffbe6]" : ""}>
                <td className="border border-[#e2e3e3] bg-[#f8f9fa] text-center text-[11px] text-[#5b6370]">{i + 2}</td>
                <td className="border border-[#e2e3e3] px-2 py-1.5 tabular-nums">{r.at}</td>
                <td className="border border-[#e2e3e3] px-2 py-1.5">{r.name}</td>
                <td className="border border-[#e2e3e3] px-2 py-1.5 tabular-nums">
                  {r.phone}
                  {r.dup ? <span className="ml-1.5 rounded bg-[#fde2e1] px-1 text-[10.5px] font-bold text-[#a50e0e]">중복</span> : null}
                </td>
                <td className="border border-[#e2e3e3] px-2 py-1.5">{r.what}</td>
                <td className="border border-[#e2e3e3] px-2 py-1.5">{r.source}</td>
                <td className="border border-[#e2e3e3] px-2 py-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-bold ${CHIP[r.status]}`}>
                    {r.status}
                    <ChevronDown size={11} strokeWidth={3} aria-hidden />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-1 border-t border-[#e6e9ee] bg-[#f8f9fa] px-3 pt-1 text-[12px]">
        <span className="rounded-t bg-white px-3 py-1 font-bold text-[#188038] shadow-[0_-1px_0_#e2e3e3]">신청 목록</span>
        <span className="px-3 py-1 text-[#5b6370]">주간 집계</span>
      </div>
    </BrowserFrame>
  );
}

export function ClassicLeadScreens() {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
      <PhoneNotice />
      <div className="grid min-w-0 gap-10">
        <MailNotice />
        <SheetView />
      </div>
    </div>
  );
}
