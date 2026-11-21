// 가로 막대 묶음(11-21, 5장 CMS). 막대마다 이름과 값을 직접 적는다(색만으로 구분하지 않음). 한 단위(%), 한 축(0~100).
export function BarGroups({ title, sub, groups, source }: { title: string; sub?: string; groups: { lang: string; items: [string, number][] }[]; source: { label: string; href: string; note?: string } }) {
  return (
    <figure className="mt-4 rounded-[10px] border border-[#e6e9ee] px-4 pb-3 pt-4 md:px-5">
      <figcaption>
        <span className="block text-[16px] font-[800] tracking-[-0.02em]">{title}</span>
        {sub ? <span className="block text-[13px] text-[#5b6370]">{sub}</span> : null}
      </figcaption>
      <div className="mt-4 grid gap-6 md:grid-cols-3">
        {groups.map((g) => (
          <div key={g.lang}>
            <p className="text-[14px] font-[800]">{g.lang}</p>
            <ul role="list" className="mt-2 space-y-2.5">
              {g.items.map(([name, v], i) => (
                <li key={name}>
                  <div className="flex justify-between text-[13.5px]">
                    <span className="font-bold">{name}</span>
                    <span className="tabular-nums text-[#3d4450]">{v}%</span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-[4px] bg-[#eef1f5]">
                    <div className="h-full rounded-[4px]" style={{ width: `${v}%`, background: i === 0 ? "#2a78d6" : "#86b6ef" }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] leading-[1.55] text-[#5b6370]">
        출처:{" "}
        <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#15171c]">{source.label}</a>
        {source.note ? `. ${source.note}` : ""}
      </p>
    </figure>
  );
}
