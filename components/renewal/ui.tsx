"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

// 웹툰 시안 공용 조각: 컷, 말풍선, 효과음, 내레이션 상자, 회차 끝 카드.
// 색은 사이트 토큰(먹색 #1d1d1f, 곰파트너 파랑 accent)에 노란 내레이션(#fff3b0)만 더한다.

export const ink = "#1d1d1f";

/** 컷 하나. 그림이 있으면 정사각 그림 위에 말풍선·효과음을 얹고, 없으면 children이 컷 내용이 된다. */
export function Panel({
  img,
  alt,
  children,
  className,
  bg = "#ffffff",
}: {
  img?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  bg?: string;
}) {
  return (
    <figure className={cn("relative overflow-hidden border-[3px]", className)} style={{ borderColor: ink, background: bg }}>
      {img && <Image src={img} alt={alt ?? ""} width={900} height={900} sizes="(min-width: 768px) 640px, 100vw" className="block h-auto w-full" />}
      {children}
    </figure>
  );
}

/** 컷과 컷 사이 여백. 웹툰에서 시간이 흐르는 자리. */
export function Gutter({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return <div aria-hidden className={size === "lg" ? "h-28 md:h-40" : size === "sm" ? "h-6 md:h-8" : "h-14 md:h-20"} />;
}

type Tail = "bottom-left" | "bottom-right" | "top-left" | "top-right" | "none";

/** 말풍선 꼬리. 채운 삼각형이 풍선 테두리를 덮고, 빗변 두 줄만 먹선으로 긋는다. */
function TailMark({ tail, fill }: { tail: Tail; fill: string }) {
  if (tail === "none") return null;
  const top = tail.startsWith("top");
  const left = tail.endsWith("left");
  return (
    <svg
      aria-hidden
      width="26"
      height="20"
      viewBox="0 0 26 20"
      className="absolute"
      style={{ [top ? "top" : "bottom"]: -17, [left ? "left" : "right"]: 26, transform: `${top ? "scaleY(-1)" : ""} ${left ? "" : "scaleX(-1)"}` }}
    >
      <path d="M1 0 L5 19 L22 0 Z" fill={fill} />
      <path d="M1.5 0 L5 18 L21.5 0" fill="none" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 말풍선. 컷이 화면 절반쯤 들어오면 꼬리 쪽에서 톡 튀어나온다(스프링, 약 250ms).
 * 동작 줄이기를 켜면 처음부터 그대로 보인다.
 */
export function Bubble({
  children,
  className,
  tail = "bottom-left",
  delay = 0,
  tone = "white",
}: {
  children: React.ReactNode;
  className?: string;
  tail?: Tail;
  delay?: number;
  tone?: "white" | "blue";
}) {
  const reduce = useReducedMotionSafe();
  const origin = tail.startsWith("bottom") ? (tail.endsWith("left") ? "15% 100%" : "85% 100%") : tail.endsWith("left") ? "15% 0%" : "85% 0%";
  return (
    <motion.p
      initial={reduce ? false : { scale: 0.55, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ type: "spring", stiffness: 520, damping: 24, delay }}
      style={{ transformOrigin: origin, borderColor: ink }}
      className={cn(
        "relative w-fit max-w-[82%] rounded-[26px] border-[3px] px-5 py-3 text-[17px] font-bold leading-[1.45] md:text-[19px]",
        tone === "blue" ? "bg-accent text-white" : "bg-white text-[#1d1d1f]",
        className,
      )}
    >
      {children}
      <TailMark tail={tail} fill={tone === "blue" ? "#256ef4" : "#ffffff"} />
    </motion.p>
  );
}

/**
 * 효과음 글자. 비스듬히 크게 찍혔다가 제자리로 줄어든다(180ms, ease-out).
 */
export function Sfx({ children, className, color = "#256ef4", rotate = -8, delay = 0.15 }: { children: string; className?: string; color?: string; rotate?: number; delay?: number }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.span
      aria-hidden
      initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: rotate - 10 }}
      whileInView={{ scale: 1, opacity: 1, rotate }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn("pointer-events-none absolute select-none font-[family-name:var(--font-sfx)] leading-none", className)}
      style={{ color, WebkitTextStroke: `6px ${ink}`, paintOrder: "stroke fill" }}
    >
      {children}
    </motion.span>
  );
}

/** 내레이션 상자. 컷 귀퉁이에 붙는 노란 사각 상자. */
export function Narration({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("w-fit border-[3px] bg-[#fff3b0] px-3.5 py-1.5 text-[15px] font-bold md:text-[17px]", className)} style={{ borderColor: ink }}>
      {children}
    </p>
  );
}

/** 회차 끝 카드: 서비스 이름, 가격·기간, 포함 내용, 샘플·상담 버튼. */
export function EndCard({
  title,
  price,
  items,
  sample,
  consult,
}: {
  title: string;
  price: string;
  items: string[];
  sample?: { href: string; label: string };
  consult: { href: string; label: string };
}) {
  return (
    <div className="border-[3px] bg-white p-6 md:p-8" style={{ borderColor: ink, boxShadow: `8px 8px 0 ${ink}` }}>
      <h3 className="text-[22px] font-bold leading-[1.4] md:text-[26px]">{title}</h3>
      <p className="mt-1 text-[20px] font-bold tabular-nums text-accent md:text-[22px]">{price}</p>
      <ul className="mt-5 grid gap-1.5 text-[16px] leading-[1.6] text-foreground-secondary md:text-[17px]">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {it}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-2.5">
        {sample && (
          <Link href={sample.href} className="inline-flex h-12 items-center rounded-[6px] border-[3px] bg-white px-5 text-[16px] font-bold transition-colors hover:bg-[#fff3b0]" style={{ borderColor: ink }}>
            {sample.label}
          </Link>
        )}
        <Link href={consult.href} className="inline-flex h-12 items-center rounded-[6px] border-[3px] bg-accent px-5 text-[16px] font-bold text-white transition-colors hover:bg-accent-hover" style={{ borderColor: ink }}>
          {consult.label}
        </Link>
      </div>
    </div>
  );
}

/** 이름 가운데 글자를 초성으로 가린다(김하늘 → 김ㅎ늘, 두 글자는 김*). */
export function maskName(name: string) {
  const n = name.trim();
  if (n.length < 2) return n;
  if (n.length === 2) return `${n[0]}*`;
  const code = n.charCodeAt(1) - 0xac00;
  const cho = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  const mid = code >= 0 && code < 11172 ? cho[Math.floor(code / 588)] : "*";
  return `${n[0]}${mid}${n.slice(2)}`;
}
