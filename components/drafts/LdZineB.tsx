"use client";

import Image from "next/image";

// 독립출판 북페어 사전 등록 랜딩 시안 B 행사 안내문형(11-22. 시안 A는 기존 리소 포스터형 랜딩과 부스 지도. 언리미티드 에디션 같은 북페어 공지처럼 일정, 장소, 셀러 수, 등록 혜택을 차분한 표로 먼저, 셀러 목록은 이름만). 흰 바탕, 파랑과 주황. 인물 없음. 메인 한 장, 등록은 버튼만.
// 사진: Unsplash 무료 라이선스(public/images/drafts/ld/zine-*)
const IMG = "/images/drafts/ld";
const C = { ink: "#111a2e", sub: "#5c6578", line: "#e2e6ee", soft: "#f3f5f9", blue: "#2346d8", orange: "#ff6a2b" };

const SELLERS = ["고양이 세탁소", "밤의 영수증", "두부 출판", "방구석 리소", "느린 우편", "초록 계단", "동네 지도 연구회", "마감 직전", "소금빵 비평", "버스 맨 뒷자리", "작은 우주선", "종이 비행"];

export function LdZineB() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <section className="px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
        <div className="mx-auto grid max-w-[1120px] items-end gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h1 className="text-[40px] font-bold leading-[1.18] tracking-[-0.05em] md:text-[64px]">
              반쯤 접힌
              <br />
              북페어
            </h1>
            <dl className="mt-8 border-t-2" style={{ borderColor: C.ink }}>
              {[
                ["일정", "12. 13(토) ~ 12. 14(일), 12:00 ~ 19:00"],
                ["장소", "망원역 1번 출구 5분, 창고 2층"],
                ["셀러", "24팀, 진과 굿즈"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[56px_1fr] gap-3 border-b py-3" style={{ borderColor: C.line }}>
                  <dt className="font-bold">{k}</dt>
                  <dd style={{ color: C.sub }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
            <Image src={`${IMG}/zine-hero.jpg`} alt="부채처럼 펼쳐진 여러 색 종이" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-[28px] font-bold tracking-[-0.04em] md:text-[40px]">사전 등록하면</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["무료 입장", "현장 입장료 3,000원 면제"],
              ["팔찌 교환", "등록 줄에서 이름만 말하면 바로"],
              ["전날 안내", "행사 전날 저녁 7시 셀러 지도 문자"],
            ].map(([t, d]) => (
              <li key={t} className="rounded-[20px] bg-white p-7">
                <h3 className="text-[21px] font-bold" style={{ color: C.blue }}>{t}</h3>
                <p className="mt-1" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <div>
            <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">참가 셀러</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SELLERS.map((s) => (
                <li key={s} className="rounded-full border px-4 py-1.5 font-semibold" style={{ borderColor: C.line }}>{s}</li>
              ))}
              <li className="rounded-full px-4 py-1.5 font-semibold text-white" style={{ background: C.ink }}>외 12팀</li>
            </ul>
            <p className="mt-5 text-[15px]" style={{ color: C.sub }}>부스마다 결제 방법이 다릅니다. 현금이나 계좌이체를 준비해 오시면 편합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/zine-paper.jpg`} alt="여러 색이 겹친 종이 단면" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[18px]">
              <Image src={`${IMG}/zine-books.jpg`} alt="쌓아 올린 여러 색 책등" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto max-w-[1120px] rounded-[24px] p-8 text-white md:p-12" style={{ background: C.blue }}>
          <h2 className="text-[26px] font-bold tracking-[-0.04em] md:text-[34px]">사전 등록</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {["방문 날짜", "인원", "이름", "휴대폰 번호"].map((f) => (
              <div key={f} className="rounded-xl bg-white/12 px-4 py-3 text-[15px] text-white/80">{f}</div>
            ))}
          </div>
          <button type="button" className="mt-5 h-14 w-full rounded-xl text-[17px] font-bold text-white md:w-auto md:px-10" style={{ background: C.orange }}>
            무료로 등록하기
          </button>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto max-w-[1120px]">반쯤 접힌 북페어 운영팀, 서울특별시 마포구 망원동 일대. 2층까지 화물용 엘리베이터가 있습니다.</div>
      </footer>
    </div>
  );
}
