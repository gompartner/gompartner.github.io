import type { ReactNode } from "react";
import { Check } from "lucide-react";

// 필터 팝업(위키, 통합검색)이 함께 쓰는 고르는 부품. 색은 어두운 팝업 기준(11-26 사용자 "여기도 흰색": 어두운 화면에서 흰 팝업, 흰 검색 칸을 쓰지 않는다. 밝은 화면 색은 classic-light.css가 맡는다).
// 11-26 사용자 "처음 보낸 건 디자인이 적용된 느낌인데 우린 기본 컴포넌트로 했네".
// 브라우저 기본 체크박스를 그대로 보이지 않는다. 체크박스는 화면 밖에 두고(키보드, 화면 읽기 프로그램은 그대로 쓴다) 보이는 모양만 따로 그린다.
//  - PickItem: 고르면 글자가 파랗게 굵어지고 끝에 체크 표시가 붙는 항목(오른쪽 칸의 하위 분류)
//  - BoxCheck: 둥근 네모 칸에 체크가 들어가는 항목(아래 줄의 종류)
const focus = "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[-2px] has-[:focus-visible]:outline-current";

export function PickItem({ checked, onChange, children, note }: { checked: boolean; onChange: () => void; children: ReactNode; note?: ReactNode }) {
  return (
    <label className={`flex min-h-[48px] cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[16px] text-[#c9ced6] hover:bg-white/5 ${focus}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={`break-keep ${checked ? "font-[800] text-white" : ""}`}>{children}</span>
      {checked ? <Check size={17} strokeWidth={2.6} aria-hidden className="shrink-0 text-white" /> : null}
      {note != null ? <span className="ml-auto shrink-0 pl-2 text-[14px] tabular-nums text-[#aab2bf]">{note}</span> : null}
    </label>
  );
}

export function BoxCheck({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md text-[16px] text-[#c9ced6] ${focus}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span aria-hidden className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[6px] border-[1.5px] ${checked ? "gp-box-on" : "border-white/40"}`}>
        {checked ? <Check size={15} strokeWidth={3} /> : null}
      </span>
      {children}
    </label>
  );
}
