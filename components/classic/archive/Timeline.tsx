// 연표 표(11-22). 때 + 한 칸, 또는 때 + 두 칸(예: 한국, 일본). 휴대폰에서는 둘째 칸을 첫 칸 아래로 넣는다.
export type TimelineRow = { when: string; a: string; b?: string };

export function Timeline({ rows, colA, colB }: { rows: TimelineRow[]; colA: string; colB?: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e9ee]">
      <table className="w-full border-collapse text-left text-[14.5px] leading-[1.6]">
        <thead>
          <tr className="border-b border-[#d9dee5] bg-[#f5f7fa] text-[13.5px] text-[#5b6370]">
            <th scope="col" className="w-[92px] px-3 py-2 font-bold md:w-[130px]">때</th>
            <th scope="col" className="px-3 py-2 font-bold">{colA}</th>
            {colB ? <th scope="col" className="hidden px-3 py-2 font-bold md:table-cell">{colB}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.when + r.a} className="border-b border-[#eef0f3] align-top last:border-0">
              <th scope="row" className="px-3 py-2.5 font-bold">{r.when}</th>
              <td className="px-3 py-2.5 text-[#2b313b]">
                {r.a}
                {colB && r.b ? (
                  <span className={`block text-[13.5px] text-[#5b6370] md:hidden ${r.a ? "mt-1.5" : ""}`}>
                    <b className="font-bold text-[#3d4450]">{colB}</b> {r.b}
                  </span>
                ) : null}
              </td>
              {colB ? <td className="hidden px-3 py-2.5 text-[#2b313b] md:table-cell">{r.b}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
