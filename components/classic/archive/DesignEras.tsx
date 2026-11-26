// 7장: 시대별 첫 화면 모양을 같은 그림체로 다시 그린 것(11-21). 통계가 아니라 관찰.
const g = "absolute rounded-[3px] bg-[#c3cbd6]";
const g2 = "absolute rounded-[3px] bg-[#d8dde5]";

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="relative h-[190px] overflow-hidden rounded-md border border-[#aeb7c4] bg-white">{children}</div>;
}

export function DesignEras() {
  const eras = [
    {
      when: "2000년대 후반",
      name: "입체와 광택",
      desc: "그라데이션 메뉴 띠와 반짝이는 버튼, 그림자와 반사. 가운데 고정 폭.",
      screen: (
        <Screen>
          <div className="absolute left-[12%] right-[12%] top-2 h-4 rounded-[4px]" style={{ background: "linear-gradient(#f4f6f9,#b9c2ce)" }} />
          <div className="absolute left-[12%] right-[12%] top-9 h-[86px] rounded-[4px]" style={{ background: "linear-gradient(#ffffff,#dfe5ee)" }} />
          <div className="absolute left-[38%] top-[52px] h-10 w-[24%] rounded-[4px] bg-[#b9c2ce] shadow-[0_8px_10px_rgba(0,0,0,0.25)]" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute top-[134px] h-12 rounded-[4px] border border-[#aeb7c4]" style={{ left: `${12 + i * 19.5}%`, width: "17.5%", background: "linear-gradient(#fff,#dde2ea)" }} />
          ))}
        </Screen>
      ),
    },
    {
      when: "2013년 무렵부터",
      name: "플랫",
      desc: "광택과 그림자를 걷어 낸 단색 면과 화면 폭을 채운 큰 사진, 얇은 글꼴.",
      screen: (
        <Screen>
          <div className={g} style={{ left: 8, top: 8, width: 50, height: 9 }} />
          <div className="absolute left-0 right-0 top-6 h-[100px] bg-[#256ef4] opacity-45" />
          <div className="absolute left-[30%] right-[30%] top-[52px] h-2.5 bg-white" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute top-[132px] h-[50px]" style={{ left: `${i * 25}%`, width: "24.5%", background: ["#b7d0ff", "#d8dde5", "#c3cbd6", "#d6e4fd"][i] }} />
          ))}
        </Screen>
      ),
    },
    {
      when: "2014년 이후",
      name: "카드",
      desc: "옅은 그림자의 카드를 격자로 나열. 휴대폰에서는 한 줄로 쌓임.",
      screen: (
        <Screen>
          <div className={g} style={{ left: 8, top: 8, width: 50, height: 9 }} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="absolute rounded-[6px] bg-white shadow-[0_2px_6px_rgba(15,27,61,0.16)]" style={{ left: `${4 + (i % 3) * 32}%`, width: "28%", top: 28 + Math.floor(i / 3) * 80, height: 70 }}>
              <div className="h-7 rounded-t-[6px] bg-[#d6e4fd]" />
            </div>
          ))}
        </Screen>
      ),
    },
    {
      when: "2020년대",
      name: "크기가 다른 칸(벤토)",
      desc: "크고 작은 칸을 한 판에 섞어 배치. 칸마다 다른 기능이나 숫자.",
      screen: (
        <Screen>
          <div className={g} style={{ left: 8, top: 8, width: 50, height: 9 }} />
          <div className="absolute left-[4%] top-7 h-[150px] w-[44%] rounded-[10px] bg-[#b7d0ff]" />
          <div className="absolute left-[50%] top-7 h-[70px] w-[46%] rounded-[10px] bg-[#d8dde5]" />
          <div className="absolute left-[50%] top-[107px] h-[70px] w-[22%] rounded-[10px] bg-[#c3cbd6]" />
          <div className="absolute left-[74%] top-[107px] h-[70px] w-[22%] rounded-[10px] bg-[#d6e4fd]" />
          <span className={g2} style={{ left: "8%", top: 120, width: "30%", height: 8 }} />
        </Screen>
      ),
    },
  ];
  return (
    <div>
      <ul role="list" className="mt-4 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {eras.map((e) => (
          <li key={e.name} className="rounded-lg border border-[#e1e5eb] bg-[#f5f7fa] p-3">
            <div aria-hidden>{e.screen}</div>
            <p className="mt-2.5 text-[12.5px] font-bold text-[#1d5fd6]">{e.when}</p>
            <p className="text-[15px] font-[800]">{e.name}</p>
            <p className="mt-0.5 text-[13.5px] leading-[1.55] text-[#5b6370]">{e.desc}</p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12.5px] text-[#6b7380]">위 네 화면은 그 시기 흔하던 모양을 곰파트너가 다시 그린 것입니다. 시기는 대략이고 나라와 업종마다 겹칩니다.</p>
    </div>
  );
}
