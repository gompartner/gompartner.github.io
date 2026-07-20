import { cn } from "@/lib/utils";

// 섹션에 흩뿌리는 인라인 SVG 도형 (meetzi 플레이풀 포인트).
// 부모 섹션은 `relative overflow-hidden` 이어야 하며, 콘텐츠 뒤(-z-10)에 깔린다.
// variant로 섹션마다 다른 모양·위치·색 조합을 줘 반복감을 없앤다.

type ShapeProps = { className?: string; color: string };

function Triangle({ className, color }: ShapeProps) {
  return (
    <svg aria-hidden className={cn("absolute", className)} style={{ color }} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 22 20 2 20Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function Ring({ className, color }: ShapeProps) {
  return (
    <svg aria-hidden className={cn("absolute", className)} style={{ color }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

function Plus({ className, color }: ShapeProps) {
  return (
    <svg aria-hidden className={cn("absolute", className)} style={{ color }} viewBox="0 0 24 24" fill="none">
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function Squiggle({ className, color }: ShapeProps) {
  return (
    <svg aria-hidden className={cn("absolute", className)} style={{ color }} viewBox="0 0 40 24" fill="none">
      <path d="M2 14C6 4 12 4 16 12s10 8 14-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function Dots({ className, color, cols = 3, count = 9 }: ShapeProps & { cols?: number; count?: number }) {
  return (
    <div
      aria-hidden
      className={cn("absolute grid gap-1.5", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color, opacity: 0.5 }} />
      ))}
    </div>
  );
}

// 서로 다른 3개 조합 (모양·위치·색 전부 다르게)
const VARIANTS = [
  <>
    <Triangle className="left-[4%] top-[16%] h-5 w-5 -rotate-12" color="#ffc63b" />
    <Ring className="right-[7%] top-[11%] h-6 w-6" color="#ff6b5e" />
    <Plus className="right-[11%] bottom-[14%] h-5 w-5" color="#4f5be6" />
    <Dots className="bottom-[18%] left-[3%]" color="#17c3b2" />
  </>,
  <>
    <Squiggle className="left-[8%] top-[10%] h-7 w-10" color="#17c3b2" />
    <Dots className="right-[5%] top-[14%]" color="#4f5be6" cols={4} count={12} />
    <Ring className="left-[6%] bottom-[16%] h-7 w-7" color="#ffc63b" />
    <Triangle className="right-[9%] bottom-[10%] h-6 w-6 rotate-[18deg]" color="#ff6b5e" />
  </>,
  <>
    <Plus className="left-[6%] top-[12%] h-6 w-6" color="#ff6b5e" />
    <Triangle className="right-[6%] top-[16%] h-5 w-5 rotate-[200deg]" color="#17c3b2" />
    <Dots className="bottom-[12%] left-[46%]" color="#ffc63b" cols={5} count={10} />
    <Ring className="left-[9%] bottom-[18%] h-6 w-6" color="#4f5be6" />
  </>,
];

export function Doodles({ variant = 0 }: { variant?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {VARIANTS[variant % VARIANTS.length]}
    </div>
  );
}
