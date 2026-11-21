// 2012년 무렵 한국, 일본, 미국 첫 화면을 같은 그림체(회색 칸, 파란 강조)로 다시 그린 것(11-21).
// 통계가 아니라 그 시기 흔하던 모양의 관찰이다. 남의 사이트 캡처는 쓰지 않는다.
// 칸마다 실제 사례(인터넷 아카이브 보관본 링크 + 확인한 문구)를 붙인다(11-21 사용자 A안).
import type { Example } from "@/data/classic/trendData";
import { ExampleCard } from "@/components/classic/archive/ExampleCard";

const g = "absolute rounded-[3px] bg-[#dfe3e9]";
const g2 = "absolute rounded-[3px] bg-[#eceff3]";
const bl = "absolute rounded-[3px] bg-[#256ef4]";
const tag = "absolute rounded-[3px] border border-[#cfd5dd] bg-white px-1 text-[9px] leading-[14px] text-[#5b6370]";

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="relative h-[280px] overflow-hidden rounded-md border border-[#cfd5dd] bg-white">{children}</div>;
}

export function Wireframes2012({ examples = [] }: { examples?: Example[] }) {
  const items = [
    {
      name: "한국",
      desc: "고정 폭 화면, 큰 배너, 팝업존, 오른쪽 퀵메뉴. 들어가자마자 보안 프로그램 설치 안내.",
      screen: (
        <Screen>
          <div className={g} style={{ left: 8, top: 8, width: 60, height: 12 }} />
          <div className={g2} style={{ right: 12, top: 10, width: 100, height: 8 }} />
          <div className={bl} style={{ left: 8, right: 40, top: 28, height: 92, opacity: 0.25 }} />
          <span className={tag} style={{ left: 14, top: 34 }}>배너</span>
          <div className={g2} style={{ left: 8, top: 128, width: "42%", height: 70 }} />
          <div className={g2} style={{ left: "48%", right: 40, top: 128, height: 70 }} />
          <span className={tag} style={{ left: 14, top: 134 }}>공지</span>
          <span className={tag} style={{ left: "50%", top: 134 }}>팝업존</span>
          <div className={g} style={{ right: 8, top: 28, width: 24, height: 120 }} />
          <span className={tag} style={{ right: 4, top: 152 }}>퀵메뉴</span>
          <div className="absolute rounded-[4px] border-[1.5px] border-[#15171c] bg-white shadow-[0_6px_16px_rgba(0,0,0,0.15)]" style={{ left: "14%", right: "18%", top: 58, height: 108 }}>
            <span className="absolute left-2 top-2 text-[10px] font-bold text-[#15171c]">보안 프로그램 설치 안내</span>
            <div className={g2} style={{ left: 10, right: 20, top: 30, height: 8 }} />
            <div className={g2} style={{ left: 10, right: 50, top: 44, height: 8 }} />
            <div className={bl} style={{ left: 10, top: 76, width: 70, height: 18 }} />
          </div>
        </Screen>
      ),
    },
    {
      name: "일본",
      desc: "왼쪽 메뉴, 글자가 빽빽한 새 소식 목록, 작은 배너 여러 개. 한 화면에 정보를 많이 담는 편.",
      screen: (
        <Screen>
          <div className={g} style={{ left: 8, top: 8, width: 60, height: 12 }} />
          <div className={g2} style={{ left: 8, top: 28, width: 66, bottom: 8 }} />
          <span className={tag} style={{ left: 12, top: 32 }}>왼쪽 메뉴</span>
          <div className={bl} style={{ left: 82, right: 8, top: 28, height: 50, opacity: 0.25 }} />
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className={g2} style={{ left: 82, right: i % 3 ? 8 : 50, top: 92 + i * 14, height: 7 }} />
          ))}
          <span className={tag} style={{ left: 86, top: 86 }}>새 소식 목록</span>
        </Screen>
      ),
    },
    {
      name: "미국",
      desc: "가로 꽉 찬 큰 사진, 한 문장과 버튼 하나, 아래 기능 3칸. 반응형이 퍼지기 시작한 때.",
      screen: (
        <Screen>
          <div className={g} style={{ left: 8, top: 8, width: 60, height: 12 }} />
          <div className={g2} style={{ right: 10, top: 10, width: 90, height: 8 }} />
          <div className={bl} style={{ left: 0, right: 0, top: 28, height: 118, opacity: 0.25 }} />
          <span className={tag} style={{ left: 24, top: 36 }}>큰 사진 한 장</span>
          <div className={g} style={{ left: 24, top: 62, width: "55%", height: 14 }} />
          <div className={bl} style={{ left: 24, top: 90, width: 70, height: 18 }} />
          {[0, 1, 2].map((i) => (
            <div key={i} className={g2} style={{ left: `${6 + i * 32}%`, width: "26%", top: 162, height: 60 }} />
          ))}
        </Screen>
      ),
    },
  ];
  return (
    <div>
      <ul role="list" className="mt-4 grid gap-3.5 md:grid-cols-3">
        {items.map((it) => (
          <li key={it.name} className="rounded-lg border border-[#e1e5eb] bg-[#f5f7fa] p-3">
            <div aria-hidden>{it.screen}</div>
            <p className="mt-2.5 text-[15px] font-[800]">{it.name}</p>
            <p className="mt-0.5 text-[13.5px] leading-[1.55] text-[#5b6370]">{it.desc}</p>
            {examples.filter((ex) => ex.country === it.name).map((ex) => <ExampleCard key={ex.url} ex={ex} />)}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12.5px] text-[#8a93a1]">위 세 화면은 그 시기 흔하던 모양을 곰파트너가 다시 그린 것입니다. 실제 사례는 인터넷 아카이브에 남은 그날의 화면이며, 문구는 보관본에서 직접 확인했습니다.</p>
    </div>
  );
}
