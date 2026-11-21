"use client";

import Image from "next/image";
import { Car, ShoppingBag, Users } from "lucide-react";

// 한식당 시안 B 동네 밥집 정보형(11-21 사례 분석: 실제 음식점 사이트는 빨강, 노랑 원색과 굵은 글씨, 메뉴 사진 묶음. 동네 손님에게는 메뉴판과 가격, 영업시간, 주차, 단체석이 먼저다). 흰 바탕, 빨강 포인트. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/food/b-*)
const IMG = "/images/drafts/food";
const C = { ink: "#1c1816", sub: "#6a625c", line: "#ece6e2", soft: "#f7f4f2", red: "#d8321f", redSoft: "#fdebe8", yellow: "#ffc533" };

const BOARD = [
  { g: "식사", items: [["순두부찌개", "9,000"], ["된장찌개", "9,000"], ["김치찌개", "9,500"], ["제육 정식", "11,000"], ["고등어구이 정식", "12,000"]] },
  { g: "전골, 안주", items: [["버섯 두부 전골 (2인)", "28,000"], ["해물파전", "16,000"], ["두부김치", "15,000"], ["수육 (소)", "25,000"]] },
];

export function FoodB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="text-[21px] font-extrabold tracking-[-0.04em]" style={{ color: C.red }}>순두부 밥집</p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#443d39" }}>
            {["메뉴", "점심 정식", "단체 예약", "오시는 길"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.red }}>
            02-000-0000
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3.5 py-1 text-[14px] font-bold" style={{ background: C.redSoft, color: C.red }}>점심 정식 11:00 ~ 14:00</p>
            <h1 className="mt-5 text-[40px] font-extrabold leading-[1.18] tracking-[-0.05em] md:text-[64px]">
              뚝배기 하나에
              <br />
              반찬 여섯 가지
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[19px]" style={{ color: C.sub }}>
              아침마다 콩물을 끓여 순두부를 만듭니다. 반찬과 공깃밥은 더 드시는 만큼 무료입니다.
            </p>
            <div className="mt-9 grid max-w-[480px] grid-cols-3 gap-3">
              {[
                [Car, "주차 6대"],
                [Users, "단체 40석"],
                [ShoppingBag, "포장 가능"],
              ].map(([Icon, t]) => {
                const I = Icon as typeof Car;
                return (
                  <div key={t as string} className="flex flex-col items-center gap-2 rounded-[16px] py-4 text-[15px] font-bold" style={{ background: C.soft }}>
                    <I size={22} style={{ color: C.red }} aria-hidden />
                    {t as string}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-stew.jpg`} alt="두부와 파를 올린 빨간 순두부찌개" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            <span className="absolute bottom-5 left-5 rounded-full px-4 py-1.5 text-[15px] font-extrabold" style={{ background: C.yellow }}>대표 메뉴 순두부찌개 9,000원</span>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[30px] font-extrabold tracking-[-0.04em] md:text-[44px]">메뉴판</h2>
            <p className="text-[15px]" style={{ color: C.sub }}>쌀, 김치, 두부콩 국내산. 원산지 전체는 매장에 게시합니다.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {BOARD.map((b) => (
              <div key={b.g} className="rounded-[24px] bg-white p-7 md:p-10">
                <h3 className="text-[20px] font-extrabold" style={{ color: C.red }}>{b.g}</h3>
                <ul className="mt-5">
                  {b.items.map(([n, p]) => (
                    <li key={n} className="flex items-baseline gap-3 border-b py-3.5 text-[17px]" style={{ borderColor: C.line }}>
                      <span className="font-semibold">{n}</span>
                      <span className="flex-1 border-b border-dotted" style={{ borderColor: "#cfc6c0" }} aria-hidden />
                      <span className="font-bold tabular-nums">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-3">
          {[
            ["b-hero", "반찬과 찌개가 가득 차려진 상"],
            ["b-table", "여러 가지 한식 반찬이 놓인 식탁"],
            ["b-room", "빨간 의자와 나무 기둥이 있는 식당 홀"],
          ].map(([img, alt]) => (
            <div key={img} className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
              <Image src={`${IMG}/${img}.jpg`} alt={alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-5 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-[28px] p-8 text-white md:p-12" style={{ background: C.red }}>
            <h2 className="text-[28px] font-extrabold leading-[1.35] tracking-[-0.04em] md:text-[38px]">회식, 가족 모임은 단체석으로</h2>
            <p className="mt-4 text-white/85">칸막이 방 두 개를 합치면 40명까지 앉습니다. 하루 전까지 전화로 인원과 메뉴를 말씀해 주세요.</p>
            <p className="mt-8 text-[30px] font-extrabold tabular-nums md:text-[36px]">02-000-0000</p>
          </div>
          <dl className="grid content-center gap-3 rounded-[28px] p-8 md:p-12" style={{ background: C.soft }}>
            {[
              ["평일", "10:30 ~ 21:00"],
              ["토요일", "11:00 ~ 20:00"],
              ["일요일", "휴무"],
              ["위치", "경기도 고양시 일산동구 일대"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                <dt style={{ color: C.sub }}>{k}</dt>
                <dd className="text-right font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>순두부 밥집, 경기도 고양시 일산동구 일대</p>
          <p>포장, 예약 02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
