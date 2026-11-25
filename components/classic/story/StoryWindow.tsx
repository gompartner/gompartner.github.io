"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { Frame } from "@/components/classic/story/Frame";
import type { Stage } from "@/data/classic/storyline";

// 변천사: 창 하나가 왼쪽에 붙어 있고, 오른쪽 글을 내리면 그 창의 화면이 단계 순서대로 바뀐다(같은 사이트가 여덟 번 바뀐 것을 한 창으로 보여 준다).
// 넓은 화면(lg)만 창을 붙인다. 휴대폰, 태블릿은 단계마다 캡처를 글 위에 한 장씩 크게 놓는다.
// 캡처는 누르면 크게 본다(1920x1200 원본). 스크립트가 없어도 글과 그림은 모두 보인다.

const css = `
.sw-layer { transition: opacity .45s ease; }
@media (prefers-reduced-motion: reduce) { .sw-layer { transition: none; } }
`;

function Shot({ s, sizes, priority = false }: { s: Stage; sizes: string; priority?: boolean }) {
  return <Image src={s.img} alt={s.alt} fill sizes={sizes} priority={priority} className="object-cover object-top" />;
}

export function StoryWindow({ stages }: { stages: Stage[] }) {
  const [on, setOn] = useState(0);
  const [seen, setSeen] = useState(0);
  const [zoom, setZoom] = useState<Stage | null>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const dlg = useRef<HTMLDialogElement>(null);
  const cur = stages[on];

  // 화면 가운데 조금 위를 지나는 단계가 지금 단계
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.i);
          setOn(i);
          setSeen((n) => Math.max(n, i));
        }
      },
      { rootMargin: "-42% 0px -57% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (zoom && !d.open) d.showModal();
    if (!zoom && d.open) d.close();
  }, [zoom]);

  const zoomBtn = (s: Stage) => (
    <button type="button" onClick={() => setZoom(s)} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/25 px-4 text-[15px] font-bold text-white hover:border-white">
      <Maximize2 size={15} aria-hidden />
      크게 보기
    </button>
  );

  return (
    <div className="mt-8 md:mt-12 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
      <style>{css}</style>

      {/* 붙어 있는 창(넓은 화면) */}
      <div className="hidden lg:block">
        <div className="sticky top-[100px]">
          <Frame label={`${cur.date} ${cur.name}`}>
            <span className="relative block aspect-[16/10] bg-[#0f131b]">
              {stages.map((s, i) =>
                // 다음 단계 그림까지만 미리 올려 둔다(여덟 장을 한꺼번에 받지 않게)
                i <= Math.max(seen, on) + 1 ? (
                  <span key={s.no} aria-hidden={i !== on} className={`sw-layer absolute inset-0 ${i === on ? "opacity-100" : "opacity-0"}`}>
                    <Shot s={s} sizes="(min-width: 1280px) 700px, 58vw" priority={i === 0} />
                  </span>
                ) : null,
              )}
            </span>
          </Frame>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="break-keep text-[15px] leading-[1.6] text-[#aab2bf]">{cur.caption}</p>
            {zoomBtn(cur)}
          </div>
          <ol className="mt-5 grid grid-cols-8 gap-1.5" role="list" aria-label="단계 이동">
            {stages.map((s, i) => (
              <li key={s.no}>
                <button
                  type="button"
                  aria-label={`${s.no} ${s.name}`}
                  aria-current={i === on ? "step" : undefined}
                  onClick={() => items.current[i]?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })}
                  className="group block min-h-11 w-full text-left"
                >
                  <span className={`block h-[3px] rounded-full transition-colors ${i === on ? "bg-white" : i < on ? "bg-[#7aa7ff]" : "bg-white/20 group-hover:bg-white/50"}`} />
                  <span className={`mt-2 block text-[13px] font-bold tabular-nums ${i === on ? "text-white" : "text-[#8a94a6] group-hover:text-white"}`}>{s.no}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 단계별 글. 좁은 화면에서는 캡처가 글 위에 함께 놓인다 */}
      <ol role="list">
        {stages.map((s, i) => (
          <li
            key={s.no}
            data-i={i}
            ref={(el) => {
              items.current[i] = el;
            }}
            className={`scroll-mt-24 border-t border-white/12 py-10 first:border-t-0 first:pt-0 lg:min-h-[62vh] lg:scroll-mt-[100px] lg:border-l-2 lg:border-t-0 lg:py-0 lg:pb-16 lg:pl-8 lg:transition-colors lg:last:min-h-0 lg:last:pb-2 ${i === on ? "lg:border-l-[#7aa7ff]" : "lg:border-l-white/10"}`}
          >
            <p className="flex items-baseline gap-3 text-[15px] font-bold">
              <span className="tabular-nums text-[#7aa7ff]">{s.no}</span>
              <span className="tabular-nums text-white">{s.date}</span>
              <span className="text-[#aab2bf]">{s.name}</span>
            </p>
            <h3 className="mt-3 break-keep text-[24px] font-[800] leading-[1.3] tracking-[-0.045em] md:text-[30px]">{s.title}</h3>

            <figure className="mt-6 lg:hidden">
              <Frame label={`${s.date} ${s.name}`}>
                <span className="relative block aspect-[16/10] bg-[#0f131b]">
                  <Shot s={s} sizes="100vw" priority={i === 0} />
                </span>
              </Frame>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="min-w-0 flex-1 basis-[220px] break-keep text-[15px] leading-[1.6] text-[#aab2bf]">{s.caption}</span>
                {zoomBtn(s)}
              </figcaption>
            </figure>

            <dl className="mt-7 space-y-6">
              <div>
                <dt className="text-[15px] font-bold text-[#7aa7ff]">고민</dt>
                <dd className="mt-1.5 break-keep text-[17px] leading-[1.7] text-[#dbe2ee]">{s.worry}</dd>
              </div>
              <div>
                <dt className="text-[15px] font-bold text-[#ffd84d]">결정</dt>
                <dd className="mt-1.5 break-keep text-[18px] font-bold leading-[1.65] text-white">{s.decision}</dd>
              </div>
            </dl>
            <ul className="mt-7 space-y-1.5 border-t border-white/12 pt-5" role="list">
              {s.log.map((l) => (
                <li key={l.date + l.text} className="grid grid-cols-[52px_1fr] gap-2 text-[15px] leading-[1.6]">
                  <span className="tabular-nums text-[#8a94a6]">{l.date}</span>
                  <span className="break-keep text-[#c9ced6]">{l.text}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <dialog ref={dlg} onClose={() => setZoom(null)} onClick={(e) => e.target === dlg.current && setZoom(null)} className="m-auto w-[min(1400px,calc(100vw-24px))] max-w-none rounded-[20px] bg-[#121722] p-0 text-white backdrop:bg-black/80">
        {zoom && (
          <div className="flex max-h-[calc(100dvh-24px)] flex-col">
            <div className="flex items-center justify-between gap-3 px-5 py-3 md:px-6">
              <p className="break-keep text-[15px] font-bold md:text-[16px]">{zoom.caption}</p>
              <button type="button" onClick={() => setZoom(null)} aria-label="닫기" className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-white hover:bg-white/10">
                <X size={22} aria-hidden />
              </button>
            </div>
            {/* 좁은 화면에서는 그림을 줄이지 않고 옆으로 밀어 본다 */}
            <div className="min-h-0 overflow-auto">
              <Image src={zoom.img} alt={zoom.alt} width={1920} height={1200} sizes="1400px" className="h-auto w-full min-w-[900px]" />
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
