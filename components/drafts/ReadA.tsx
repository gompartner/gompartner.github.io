"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";

// 독서 논술 시안 A 초등 독서 토론형(11-22 사례 분석: 독서하브루타처럼 프로그램 칸, 수업 진행 방식, 추천 도서를 앞에 둔다. 초등 학부모는 학년별로 무엇을 읽는지, 한 달 수업 흐름, 아이 글을 어떻게 받는지 묻는다). 흰 바탕, 초록. 인물 없음. 메인 한 장, 기능 없음.
// 사진: Unsplash 무료 라이선스(public/images/drafts/rd/a-*)
const IMG = "/images/drafts/rd";
const C = { ink: "#18211d", sub: "#5e6a64", line: "#e2eae6", soft: "#f2f7f4", green: "#2a7a5c", greenSoft: "#e2f1ea", orange: "#e8742c" };

const BOOKS = [
  ["초등 1 ~ 2학년", ["강아지똥", "나쁜 어린이표", "알사탕"]],
  ["초등 3 ~ 4학년", ["마당을 나온 암탉", "샬롯의 거미줄", "만복이네 떡집"]],
  ["초등 5 ~ 6학년", ["책과 노니는 집", "어린 왕자", "아몬드"]],
] as const;

export function ReadA() {
  return (
    <div className="min-h-screen bg-white text-[16px] leading-[1.75] md:text-[17px]" style={{ color: C.ink }}>
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <p className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.03em]">
            <BookOpen size={20} style={{ color: C.green }} aria-hidden /> 책숲 독서토론
          </p>
          <nav aria-label="주 메뉴" className="hidden gap-9 text-[15px] font-semibold lg:flex" style={{ color: "#404a45" }}>
            {["학년별 도서", "수업 흐름", "첨삭", "상담"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </nav>
          <span className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold text-white" style={{ background: C.green }}>
            체험 수업
          </span>
        </div>
      </header>

      <section className="px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.green }}>초등 1 ~ 6학년, 한 반 6명</p>
            <h1 className="mt-4 text-[36px] font-bold leading-[1.24] tracking-[-0.045em] md:text-[56px]">
              읽고, 묻고, 말한 뒤
              <br />
              한 편을 씁니다
            </h1>
            <p className="mt-5 max-w-[460px] text-[17px] md:text-[18px]" style={{ color: C.sub }}>
              한 달에 책 한 권을 깊게 읽습니다. 친구와 토론한 내용으로 마지막 주에 글 한 편을 완성합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src={`${IMG}/a-hero.jpg`} alt="여러 색 책등이 빼곡히 쌓인 책 더미" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28" style={{ background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">학년별 이번 학기 도서</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {BOOKS.map(([g, list]) => (
              <li key={g} className="rounded-[24px] bg-white p-7 md:p-8">
                <span className="inline-flex rounded-full px-3 py-0.5 text-[14px] font-bold" style={{ background: C.greenSoft, color: C.green }}>{g}</span>
                <ol className="mt-5 grid gap-2">
                  {list.map((b, i) => (
                    <li key={b} className="flex gap-3 border-b pb-2 last:border-b-0" style={{ borderColor: C.line }}>
                      <span className="w-5 font-bold tabular-nums" style={{ color: C.orange }}>{i + 1}</span>
                      <span className="text-[18px] font-bold">{b}</span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[30px] font-bold tracking-[-0.04em] md:text-[44px]">한 달 수업 흐름</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1주", "읽기와 질문", "함께 읽고 궁금한 점을 질문으로"],
              ["2주", "토론", "찬반을 나눠 근거 들어 말하기"],
              ["3주", "개요 짜기", "주장, 근거, 예시를 표로 정리"],
              ["4주", "글쓰기", "한 편 완성, 선생님 첨삭"],
            ].map(([w, t, d]) => (
              <li key={w} className="rounded-[22px] border p-6" style={{ borderColor: C.line }}>
                <p className="text-[15px] font-bold" style={{ color: C.orange }}>{w}</p>
                <h3 className="mt-1 text-[21px] font-bold tracking-[-0.03em]">{t}</h3>
                <p className="mt-1 text-[15px]" style={{ color: C.sub }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="overflow-hidden rounded-[28px]" style={{ background: C.greenSoft }}>
            <div className="relative aspect-[16/9]">
              <Image src={`${IMG}/a-note.jpg`} alt="펼친 공책 위에 놓인 샤프" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="p-8 md:p-10">
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">첨삭은 이렇게 받습니다</h2>
              <ul className="mt-5 grid gap-2.5" style={{ color: C.sub }}>
                <li>매달 쓴 글은 빨간 펜 첨삭과 함께 파일에 모아 집으로</li>
                <li>학기 말 한 학기 글을 묶은 문집 한 권</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] p-8 text-white md:p-10" style={{ background: C.green }}>
            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.04em] md:text-[30px]">체험 수업 60분</h2>
              <p className="mt-3 text-white/80">그림책 한 권으로 실제 토론 수업을 해 봅니다. 끝나면 아이가 쓴 글로 반을 정해 드립니다. 교습비는 교습소 안에 게시합니다.</p>
            </div>
            <p className="mt-8 text-[30px] font-bold tabular-nums tracking-[-0.02em]">02-000-0000</p>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-10 text-[14px] md:px-8" style={{ borderColor: C.line, color: C.sub }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 md:flex-row md:justify-between">
          <p>책숲 독서토론 교습소, 서울특별시 양천구 목동 일대. 교습소 등록번호 제000호</p>
          <p>02-000-0000</p>
        </div>
      </footer>
    </div>
  );
}
