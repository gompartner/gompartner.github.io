"use client";

import { Clock, Heart, MapPin, Megaphone, Phone } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STORAGE_KEY = "gs-demo:homepage:v1";

const menuItems = [
  { id: "croissant", emoji: "🥐", name: "버터 크루아상", desc: "72시간 저온 숙성 반죽", price: "3,800원", tag: "베스트" },
  { id: "sourdough", emoji: "🍞", name: "천연발효 사워도우", desc: "매일 아침 한정 수량", price: "7,500원", tag: "한정" },
  { id: "saltbread", emoji: "🥖", name: "소금빵", desc: "프랑스산 버터 듬뿍", price: "3,200원", tag: "베스트" },
  { id: "cupcake", emoji: "🧁", name: "당근 컵케이크", desc: "크림치즈 프로스팅", price: "4,500원", tag: null },
  { id: "cheesecake", emoji: "🍰", name: "바스크 치즈케이크", desc: "진한 풍미의 시그니처", price: "6,000원", tag: "시그니처" },
  { id: "cookie", emoji: "🍪", name: "르뱅 쿠키", desc: "겉바속촉 초코청크", price: "3,500원", tag: null },
];

const notices = [
  { date: "7월 둘째 주", title: "여름 시즌 신메뉴 3종 출시", body: "옥수수 치아바타, 레몬 마들렌, 콜드브루 크림빵이 새로 나왔습니다." },
  { date: "매주 월요일", title: "정기 휴무 안내", body: "매주 월요일은 쉬어갑니다. 예약 주문은 전날 오후 6시까지 받아요." },
];

interface HomepageState {
  favorites: string[];
}

export function HomepageDemo() {
  const [state, setState] = useLocalStorage<HomepageState>(STORAGE_KEY, {
    favorites: [],
  });

  const toggleFavorite = (id: string) => {
    setState((prev) => ({
      favorites: prev.favorites.includes(id)
        ? prev.favorites.filter((f) => f !== id)
        : [...prev.favorites, id],
    }));
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans text-stone-800">
      {/* 상단 내비 */}
      <nav className="sticky top-0 z-40 border-b border-amber-200/70 bg-amber-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="#top" className="text-lg font-bold tracking-tight text-stone-900">
            🐻 곰곰 베이커리
          </a>
          <div className="flex items-center gap-1 text-sm font-medium sm:gap-4">
            <a href="#menu" className="rounded-full px-3 py-1.5 transition-colors hover:bg-amber-100">메뉴</a>
            <a href="#notice" className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-amber-100 sm:block">공지</a>
            <a href="#visit" className="rounded-full px-3 py-1.5 transition-colors hover:bg-amber-100">오시는 길</a>
            <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1.5 text-white">
              <Heart size={14} fill="currentColor" aria-hidden />
              {state.favorites.length}
            </span>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <header id="top" className="mx-auto max-w-5xl px-5 pb-14 pt-16 text-center sm:pt-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Since 2019 · 동네 빵집
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-6xl">
          매일 아침 굽는
          <br />
          <span className="text-orange-600">정직한 빵</span> 한 조각
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-stone-600">
          방부제 없이 국산 밀과 천연 발효종으로 만듭니다.
          마음에 드는 빵에 <Heart size={14} className="inline text-orange-600" fill="currentColor" aria-label="하트" />를 눌러
          나만의 단골 리스트를 만들어보세요. 다시 방문해도 그대로 남아있어요.
        </p>
        <a
          href="#menu"
          className="mt-8 inline-block rounded-full bg-stone-900 px-7 py-3.5 font-semibold text-amber-50 transition-transform hover:scale-105"
        >
          오늘의 메뉴 보기
        </a>
      </header>

      {/* 메뉴 */}
      <section id="menu" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-14">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">오늘의 메뉴</h2>
        <p className="mt-2 text-stone-500">하트를 누르면 즐겨찾기에 저장됩니다.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const liked = state.favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="group relative rounded-3xl border border-amber-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {item.tag && (
                  <span className="absolute left-5 top-5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                    {item.tag}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  aria-pressed={liked}
                  aria-label={`${item.name} 즐겨찾기 ${liked ? "해제" : "추가"}`}
                  className={`absolute right-5 top-5 rounded-full p-2 transition-all ${
                    liked
                      ? "bg-orange-600 text-white"
                      : "bg-amber-100 text-stone-400 hover:text-orange-600"
                  }`}
                >
                  <Heart size={17} fill={liked ? "currentColor" : "none"} aria-hidden />
                </button>
                <div className="pt-8 text-center">
                  <span className="text-6xl" role="img" aria-hidden>
                    {item.emoji}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-stone-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-stone-500">{item.desc}</p>
                  <p className="mt-3 font-semibold text-orange-700">{item.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 공지 */}
      <section id="notice" className="scroll-mt-20 bg-white py-14">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            <Megaphone className="text-orange-600" size={26} aria-hidden />
            공지사항
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {notices.map((notice) => (
              <article key={notice.title} className="rounded-3xl bg-amber-50 p-6">
                <p className="text-xs font-semibold text-orange-600">{notice.date}</p>
                <h3 className="mt-2 font-bold text-stone-900">{notice.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{notice.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 오시는 길 */}
      <section id="visit" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-14">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">오시는 길</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl border border-amber-200 bg-white p-6">
            <MapPin className="text-orange-600" size={22} aria-hidden />
            <h3 className="mt-3 font-bold text-stone-900">위치</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              서울시 곰곰구 베이커리로 12
              <br />
              곰곰빌딩 1층
            </p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-white p-6">
            <Clock className="text-orange-600" size={22} aria-hidden />
            <h3 className="mt-3 font-bold text-stone-900">영업시간</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              화–일 08:00 – 20:00
              <br />
              월요일 정기 휴무
            </p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-white p-6">
            <Phone className="text-orange-600" size={22} aria-hidden />
            <h3 className="mt-3 font-bold text-stone-900">예약 주문</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              02-1234-5678
              <br />
              전날 18시까지 접수
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-amber-200 bg-white py-8 text-center text-sm text-stone-400">
        © 곰곰 베이커리 — 곰선임 데모 사이트 (모든 정보는 가상입니다)
      </footer>
    </div>
  );
}
