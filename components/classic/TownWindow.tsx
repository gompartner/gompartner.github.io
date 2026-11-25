"use client";

import { useEffect, useState } from "react";

// 11-25 조립형 첫 화면 창 안의 3D 마을. 휴대폰에서 처음 열 때 3D를 바로 불러오면 버벅여서(사용자 제보)
// 처음에는 마을 사진을 보여 주고, 휴대폰은 누를 때, PC는 조립이 끝나고 화면이 한가할 때 3D를 불러온다.
const SRC = process.env.NODE_ENV === "development" ? "/3d/island.html" : "/3d/island";

export function TownWindow() {
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const phone = matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    if (phone) return;
    // 조립 연출(약 3초)이 끝난 뒤, 브라우저가 한가할 때
    let idle = 0;
    const t = window.setTimeout(() => {
      const go = () => setLoad(true);
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(go, { timeout: 2000 });
      else go();
    }, 3200);
    return () => {
      window.clearTimeout(t);
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
    };
  }, []);

  return (
    <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[#0f1b3d]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/3d-town-poster.jpg"
        alt="3D 미니어처 마을. 한옥 찻집, 가구 쇼룸, 간판 제작, 인테리어, 곰파트너 건물"
        className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      {load && (
        <iframe
          src={SRC}
          title="3D 마을. 건물 이름표를 누르면 해당 상품 화면을 엽니다."
          onLoad={() => window.setTimeout(() => setReady(true), 600)}
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
      {!load && (
        <button
          type="button"
          onClick={() => setLoad(true)}
          className="absolute inset-0 flex items-end justify-center pb-5 md:pb-8"
          aria-label="3D 마을 움직여 보기"
        >
          <span className="rounded-full bg-white px-5 py-2.5 text-[15px] font-bold text-[#0b0d12] shadow-[0_6px_20px_rgba(0,0,0,.35)]">3D 마을 움직여 보기</span>
        </button>
      )}
      {load && !ready && (
        <span className="absolute inset-x-0 bottom-5 flex justify-center md:bottom-8">
          <span className="rounded-full bg-black/60 px-4 py-2 text-[14px] font-bold text-white">3D 불러오는 중</span>
        </span>
      )}
    </span>
  );
}
