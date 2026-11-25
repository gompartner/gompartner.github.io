"use client";

import Image from "next/image";
import { Lightbulb } from "lucide-react";

// 가격 시세 확인(11-25): 거실등 제품 4.5~16만(glasswallet.com LED 거실등), 방등, 주방등 설치비 개당 2만부터, 펜던트 설치 3만부터(당근 조명 설치 프로필).
// 조명 가게 시안 B 동네 조명 교체형(11-22 사례 분석: 숨고 조명 시공 목록처럼 동네 조명 가게 손님은 LED 교체 비용, 출장 지역, 당일 되는지, A/S를 묻는다. 쇼룸형과 달리 가격표와 순서를 앞에). 흰 바탕, 노랑과 검정. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/lt/b-*)
const IMG = "/images/drafts/lt";
const C = { ink: "#17150f", sub: "#67625a", line: "#ebe7de", soft: "#f7f5ef", yellow: "#f2b705", yellowSoft: "#fdf3cf" };

const PRICE = [
  ["거실등 LED 교체", "등기구 포함, 50W", "9만 원부터"],
  ["방등 LED 교체", "등기구 포함, 30W", "5만 원부터"],
  ["주방등, 욕실등", "방습형 포함", "4만 원부터"],
  ["매입등 교체", "1개당, 4개 이상", "1만 5천 원"],
  ["펜던트 달기", "고객 구매 제품 설치", "3만 원"],
];

export function LtB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.03em]">
            <Lightbulb size={20} style={{ color: C.yellow }} aria-hidden /> 환한 조명
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#48443c" }}>
            {["교체 비용", "출장 지역", "순서", "매장"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold" style={{ background: C.yellow, color: C.ink }}>
            출장 문의
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="inline-flex rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.yellowSoft }}>오전에 전화하시면 당일 방문</p>
            <h1 className="mt-5 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              깜빡이는 형광등,
              <br />
              LED로 바꿔 드립니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              등기구를 가지고 가서 그 자리에서 달아 드립니다. 떼어 낸 기존 등은 저희가 가져갑니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/b-hero.jpg`} alt="천장에 매달린 에디슨 전구들" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">교체 비용</h2>
          <ul className="mt-10 overflow-hidden rounded-[22px] bg-white">
            {PRICE.map(([t, d, p]) => (
              <li key={t} className="grid grid-cols-[1fr_auto] gap-x-4 border-b px-6 py-5 last:border-b-0 md:grid-cols-[1.2fr_1fr_auto] md:px-8" style={{ borderColor: C.line }}>
                <span className="text-[18px] font-bold">{t}</span>
                <span className="order-3 col-span-2 text-[15px] md:order-none md:col-span-1" style={{ color: C.sub }}>{d}</span>
                <span className="text-right text-[17px] font-bold tabular-nums">{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[15px]" style={{ color: C.sub }}>출장비 포함 금액입니다. 천장 배선을 새로 깔아야 하면 보고 말씀드립니다.</p>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div>
            <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.04em] md:text-[38px]">교체 순서</h2>
            <ol className="mt-7 grid gap-3">
              {[
                ["사진", "지금 달린 등 사진을 문자로"],
                ["견적", "맞는 등기구와 금액 안내"],
                ["방문", "차단기 내리고 30분 안팎"],
                ["점검", "밝기, 스위치 확인 뒤 정리"],
              ].map(([k, v]) => (
                <li key={k} className="flex gap-4 border-b pb-3" style={{ borderColor: C.line }}>
                  <span className="w-[44px] shrink-0 font-bold" style={{ color: "#a77d00" }}>{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-bulb.jpg`} alt="회색 바탕 앞 필라멘트 전구" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[22px]">
              <Image src={`${IMG}/b-shade.jpg`} alt="청록 벽 앞 흰 갓 펜던트" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-2">
          <div className="rounded-[28px] p-8 md:p-10" style={{ background: C.yellowSoft }}>
            <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">출장 지역</h2>
            <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
              <li>대전 서구, 유성구, 중구</li>
              <li>세종 일부(대평동, 보람동)</li>
              <li>교체한 등은 2년 동안 무상 A/S</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] bg-black p-8 text-white md:p-10">
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">매장</h2>
              <p className="mt-3 text-white/75">평일 08:30 ~ 19:00, 토요일 오후 3시까지. 전구, 스위치, 콘센트도 매장에서 팝니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]" style={{ color: C.yellow }}>042-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>환한 조명, 대전광역시 서구 일대. 전기공사업 등록번호 제000호</p>
          <p>042-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
