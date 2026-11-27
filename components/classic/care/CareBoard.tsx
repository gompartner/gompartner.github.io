"use client";

import { Fragment, useState, type ReactNode } from "react";
import { FileText } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";
import { maintenanceServices, maintenanceSteps } from "@/data/classic/maintenance";

// 11-26 유지보수 한 판. 방향 셋: (1) 서비스 6종 설명 문서를 어둡게 (2) 요금표 한 장 (3) 손님이 자기 상황을 고르면 답이 나오는 판.
// 유지보수를 찾는 사람은 서비스 이름(유지관리, 고도화)을 모르고 자기 상황만 안다. 그래서 (3): 상황 여섯 가지를 먼저 보여 주고,
// 고르면 해 드리는 일, 금액, 받는 문서, 진행 순서가 나온다. 증상과 문서 이름은 유지보수 자료(data/classic/maintenance)에서 읽는다.

const svc = (id: string) => maintenanceServices.find((s) => s.id === id)!;
const cases: { q: string; id: string; a: string; price: string; note: string; c: string }[] = [
  { q: "사이트가 열리지 않아요", id: "fix", a: "다른 요청보다 우선 처리합니다. 원인을 찾는 동안 백업본으로 먼저 복구합니다.", price: "원인 확인 후 견적", note: "금액을 먼저 알려 드리고, 동의하시면 작업합니다", c: "#ff8a70" },
  { q: "글자나 사진을 바꾸고 싶어요", id: "fix", a: "문구, 가격, 사진, 공지를 요청하신 그대로 고칩니다. 월 계약 없이 건별로 맡기실 수 있습니다.", price: "건별 30,000원부터", note: "2영업일 안에 반영합니다", c: "#ffd84d" },
  { q: "만든 업체와 연락이 안 돼요", id: "takeover", a: "사이트와 계정을 인수해 현재 상태를 점검하고 유지보수를 이어 갑니다.", price: "인수 점검 무료", note: "이후 수정은 건별 30,000원부터입니다", c: "#7aa7ff" },
  { q: "사이트가 느려졌어요", id: "perf", a: "속도 저하 구간을 측정해 원인을 찾고 개선 방안과 기대 효과를 보고서로 드린 뒤 작업합니다.", price: "진단 후 견적", note: "진단 결과를 먼저 드립니다", c: "#ffffff" },
  { q: "AI 도구로 만든 걸 오픈하고 싶어요", id: "ai-site", a: "직접 만드신 서비스의 보안과 결제, 서버를 점검하고 보완해 실서비스로 운영할 수 있게 합니다.", price: "범위 확인 후 견적", note: "사용하시던 도구로 계속 수정할 수 있게 유지합니다", c: "#7aa7ff" },
  { q: "매달 맡아 줄 곳이 필요해요", id: "monthly", a: "월 1회 정기 점검과 수정 요청을 월 단위로 맡습니다. 만료일과 백업도 함께 챙깁니다.", price: "월 60만 원부터", note: "1년 단위로 계약합니다", c: "#ffd84d" },
];

/** children: 판 아래 안내 칸(11-27 CareGuide를 내려 지금은 넣는 것이 없다) */
export function CareBoard({ children }: { children?: ReactNode }) {
  const [on, setOn] = useState(0);
  const k = cases[on];
  const s = svc(k.id);
  return (
    <BoardShell no="02" en="CARE" kw="홈페이지 유지보수" ice="지금 " title="어떤 상황인가요" lead="상황을 선택하면 작업 내용과 금액, 제공 문서를 확인할 수 있습니다.">
      <div role="tablist" aria-label="상황" className="mt-10 grid gap-3 md:mt-14 lg:grid-cols-3">
        {cases.map((x, i) => (
          <Fragment key={x.q}>
          <button
            type="button"
            role="tab"
            id={`cr-tab-${i}`}
            aria-selected={on === i}
            aria-controls={on === i ? "cr-panel-m" : "cr-panel"}
            onClick={(e) => {
              const btn = e.currentTarget;
              setOn(i);
              // 위 칸이 접히며 누른 버튼이 화면 위로 밀려났을 때만 버튼 위치로 맞춘다
              if (window.innerWidth < 1024)
                requestAnimationFrame(() => {
                  const t = btn.getBoundingClientRect().top;
                  if (t < 72) window.scrollBy({ top: t - 88, behavior: "smooth" });
                });
            }}
            className={`flex min-h-[92px] items-center gap-4 rounded-[22px] border px-5 py-4 text-left transition-colors md:min-h-[112px] md:px-6 ${
              on === i ? "border-white bg-white text-[#0b0d12]" : "border-white/15 bg-[#121722] text-white hover:border-white/50"
            }`}
          >
            <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ background: on === i ? "#256ef4" : x.c }} />
            <span className="break-keep text-[19px] font-[800] leading-[1.35] tracking-[-0.035em] md:text-[22px]">{x.q}</span>
          </button>
          {on === i && <Panel k={k} s={s} id="cr-panel-m" className="-mt-1 mb-2 grid gap-3 lg:hidden" />}
          </Fragment>
        ))}
      </div>

      <Panel k={k} s={s} id="cr-panel" key={on} className="mt-4 hidden gap-4 lg:grid lg:grid-cols-[1.1fr_1fr]" />
      <p className="mt-4 text-[14px] text-[#8a94a6]">금액은 부가세 별도입니다.</p>
      {children}
      <BoardClose text="여기에 없는 상황이어도 괜찮습니다. 지금 겪는 일을 한 줄만 남겨 주세요." />
    </BoardShell>
  );
}

/** 고른 상황의 답. PC는 버튼 묶음 아래 한 칸, 휴대폰은 누른 버튼 바로 아래에 펼친다(11-28 누를 때마다 아래로 내려가 불편). */
function Panel({ k, s, id, className }: { k: (typeof cases)[number]; s: ReturnType<typeof svc>; id: string; className: string }) {
  return (
    <div id={id} role="tabpanel" className={className}>
      <div className="bd-in rounded-[28px] bg-[#256ef4] p-7 md:p-10">
        <p className="text-[14px] font-bold tracking-[0.1em] text-white">{s.title}</p>
        <h2 className="mt-3 break-keep text-[26px] font-[800] leading-[1.3] tracking-[-0.045em] md:text-[34px]">{k.a}</h2>
        <p className="mt-9 text-[36px] font-[800] leading-none tracking-[-0.05em] md:text-[46px]">{k.price}</p>
        <p className="mt-3 break-keep text-[16px] text-white md:text-[17px]">{k.note}</p>
        <p className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-[#081a4a]/25 px-4 py-2.5 text-[15px] font-bold md:text-[16px]">
          <FileText aria-hidden size={17} />
          끝나면 {s.report.name}를 드립니다
        </p>
      </div>
      <div className="bd-in rounded-[28px] border border-white/12 bg-[#121722] p-7 md:p-10" style={{ "--d": "0.06s" } as React.CSSProperties}>
        <p className="text-[15px] font-bold text-[#7aa7ff]">이런 증상을 봅니다</p>
        <ul className="mt-4 flex flex-wrap gap-2" role="list">
          {s.cases.slice(0, 6).map((c) => (
            <li key={c.title} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[15px] text-[#e3e7ee]">
              {c.title}
            </li>
          ))}
        </ul>
        <p className="mt-9 text-[15px] font-bold text-[#7aa7ff]">진행 순서</p>
        <ol className="mt-4 space-y-4" role="list">
          {maintenanceSteps.map((st, i) => (
            <li key={st.title} className="grid grid-cols-[36px_1fr] gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[15px] font-[800] tabular-nums text-[#0b0d12]">{i + 1}</span>
              <span>
                <span className="block text-[17px] font-[800] tracking-[-0.02em]">{st.title}</span>
                <span className="mt-0.5 block break-keep text-[15px] leading-[1.6] text-[#aab2bf]">{st.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
