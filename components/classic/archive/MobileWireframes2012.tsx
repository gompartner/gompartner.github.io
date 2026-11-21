import type { Example } from "@/data/classic/trendData";
import { ExampleCard } from "@/components/classic/archive/ExampleCard";

// 2장: 2012년 무렵 같은 회사 사이트를 휴대폰으로 열면(11-21). 곰파트너가 다시 그린 관찰 그림, 실제 사례는 보관본.
const g = "absolute rounded-[3px] bg-[#c3cbd6]";
const g2 = "absolute rounded-[3px] bg-[#d8dde5]";
const bl = "absolute rounded-[3px] bg-[#256ef4]";
const tag = "absolute rounded-[3px] border border-[#aeb7c4] bg-white px-1 text-[9px] leading-[14px] text-[#5b6370]";

function Phone({ children, bar }: { children: React.ReactNode; bar: string }) {
  return (
    <div className="mx-auto w-[170px] rounded-[22px] border-[7px] border-[#2a313c] bg-white">
      <div className="truncate border-b border-[#e6e9ee] px-2 py-1 text-center text-[9px] text-[#5b6370]">{bar}</div>
      <div className="relative h-[270px] overflow-hidden rounded-b-[14px]">{children}</div>
    </div>
  );
}

export function MobileWireframes2012({ examples = [] }: { examples?: Example[] }) {
  const items = [
    {
      name: "한국",
      title: "모바일 전용 주소(m.)",
      desc: "PC 사이트와 별도로 만든 m. 주소. 메뉴를 줄이고 목록을 한 줄씩 쌓음. 내용은 따로 관리.",
      screen: (
        <Phone bar="m.회사.co.kr">
          <div className={g} style={{ left: 8, top: 8, width: 50, height: 10 }} />
          <div className={g2} style={{ left: 8, right: 8, top: 26, height: 20 }} />
          <div className={bl} style={{ left: 8, right: 8, top: 54, height: 60, opacity: 0.45 }} />
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={g2} style={{ left: 8, right: i % 2 ? 30 : 8, top: 124 + i * 18, height: 9 }} />
          ))}
          <span className={tag} style={{ left: 12, top: 58 }}>모바일 배너</span>
        </Phone>
      ),
    },
    {
      name: "일본",
      title: "PC 화면 그대로",
      desc: "휴대폰으로 열어도 PC 화면이 작게 보이거나 옆이 잘림. 손가락으로 확대해서 봄.",
      screen: (
        <Phone bar="www.会社.co.jp">
          <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 270, transform: "scale(0.62)", transformOrigin: "top left" }}>
            <div className={g} style={{ left: 8, top: 8, width: 70, height: 12 }} />
            <div className={g2} style={{ left: 8, top: 28, width: 70, height: 380 }} />
            <div className={bl} style={{ left: 86, top: 28, width: 200, height: 60, opacity: 0.45 }} />
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className={g2} style={{ left: 86, top: 98 + i * 14, width: i % 3 ? 200 : 150, height: 7 }} />
            ))}
          </div>
          <span className={tag} style={{ left: 8, bottom: 8 }}>옆으로 잘림</span>
        </Phone>
      ),
    },
    {
      name: "미국",
      title: "반응형(같은 주소)",
      desc: "같은 주소가 화면 폭에 맞춰 한 줄 배치로 바뀜. PC와 휴대폰 내용이 같음.",
      screen: (
        <Phone bar="www.company.com">
          <div className={g} style={{ left: 8, top: 8, width: 50, height: 10 }} />
          <div className={g} style={{ right: 8, top: 8, width: 16, height: 10 }} />
          <div className={bl} style={{ left: 0, right: 0, top: 26, height: 90, opacity: 0.45 }} />
          <div className={g} style={{ left: 8, top: 126, width: 120, height: 12 }} />
          <div className={g2} style={{ left: 8, right: 8, top: 146, height: 8 }} />
          <div className={g2} style={{ left: 8, right: 30, top: 160, height: 8 }} />
          <div className={g2} style={{ left: 8, right: 8, top: 180, height: 70 }} />
          <span className={tag} style={{ left: 12, top: 32 }}>큰 사진</span>
        </Phone>
      ),
    },
  ];
  return (
    <div>
      <ul role="list" className="mt-4 grid gap-3.5 md:grid-cols-3">
        {items.map((it) => (
          <li key={it.name} className="rounded-lg border border-[#e1e5eb] bg-[#f5f7fa] p-3">
            <div aria-hidden>{it.screen}</div>
            <p className="mt-3 text-[15px] font-[800]">
              {it.name} <span className="text-[13px] font-bold text-[#5b6370]">{it.title}</span>
            </p>
            <p className="mt-0.5 text-[13.5px] leading-[1.55] text-[#5b6370]">{it.desc}</p>
            {examples.filter((ex) => ex.country === it.name).map((ex) => <ExampleCard key={ex.url} ex={ex} />)}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12.5px] text-[#8a93a1]">위 세 화면은 그 시기 흔하던 모양을 곰파트너가 다시 그린 것입니다. 실제 사례는 인터넷 아카이브에 남은 그날의 화면을 휴대폰 폭으로 열어 확인했습니다.</p>
    </div>
  );
}
