import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClassicShell } from "@/components/classic/ClassicShell";
import { wrap } from "@/components/classic/board/ui";

// 없는 주소로 들어왔을 때.
// 11-27 사용자 "그만 넘겨, 페이지 찾을 수 없다만 표시해도 되잖아", "404도 다시 만들어줘": 옛 주소 넘김을 모두 빼서 옛 주소는 이 화면으로 온다.
// 예전 화면은 밝은 바탕에 파란 단추(11-01 클래식 틀)라 지금 사이트(검정 바탕, 판)와 따로 놀았다. 판과 같은 바탕, 격자, 글자로 다시 만들었다.
// 11-27 사용자 "404는 앗 기존 지웠어요라고": 제목을 바꿈. 별점과 의견 받기는 넣었다가 사용자 "별점 의견 빼고"로 뺐다.
// 메뉴는 머리글과 같은 순서. 파란 면과 파란 단추는 쓰지 않는다(11-26 색 규칙).
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: true },
};

export const viewport: Viewport = { themeColor: "#0b0d12" };

const pages = [
  { href: "/", label: "첫 화면", en: "HOME" },
  { href: "/make", label: "제작", en: "BUILD" },
  { href: "/3d", label: "3D 웹", en: "3D WEB" },
  { href: "/maintenance", label: "유지보수", en: "CARE" },
  { href: "/works", label: "작업 사례", en: "WORKS" },
  { href: "/knowledge", label: "위키", en: "WIKI" },
  { href: "/contact", label: "상담 신청", en: "CONTACT" },
];

export default function NotFound() {
  return (
    <ClassicShell>
      <div className="keep-light gp-home">
        <section className="bg-[#0b0d12] bg-[linear-gradient(rgba(122,167,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(122,167,255,.05)_1px,transparent_1px)] bg-[size:48px_48px] text-white">
          <div className={`${wrap} pb-20 pt-12 md:pb-28 md:pt-20`}>
            <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.18em] text-[#7aa7ff] md:text-[14px]">
              <span>404</span>
              <span aria-hidden className="h-px w-10 bg-current" />
              <span>NOT FOUND</span>
            </p>
            <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
              <div>
                <p aria-hidden className="select-none text-[120px] font-[800] leading-[0.8] tracking-[-0.07em] bg-[linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.04))] bg-clip-text text-transparent md:text-[220px]">
                  404
                </p>
                <h1 className="mt-8 break-keep text-[30px] font-[800] leading-[1.2] tracking-[-0.045em] md:text-[44px]">페이지를 찾을 수 없습니다</h1>
                <p className="mt-4 max-w-[480px] break-keep text-[16px] leading-[1.7] text-[#aab2bf] md:text-[17px]">사이트 개편으로 이전 페이지가 삭제되었습니다. 아래 메뉴에서 원하시는 내용을 찾아 주세요.</p>
              </div>
              <nav aria-label="주요 메뉴">
                <ul className="border-t border-white/15" role="list">
                  {pages.map((p, i) => (
                    <li key={p.href}>
                      <Link href={p.href} className="group flex min-h-[60px] items-center gap-4 border-b border-white/15 py-3 text-white hover:bg-white/[0.04] md:min-h-[64px]">
                        <span className="w-7 text-[13px] font-bold tabular-nums text-white/40">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-[18px] font-[800] tracking-[-0.03em] md:text-[20px]">{p.label}</span>
                        <span className="ml-auto text-[12px] font-bold tracking-[0.12em] text-white/35 group-hover:text-[#7aa7ff]">{p.en}</span>
                        <ArrowUpRight size={18} aria-hidden className="shrink-0 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white motion-reduce:transition-none" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </section>
      </div>
    </ClassicShell>
  );
}
