import type { BlogCategory } from "@/lib/types";

// 블로그 전용 CSS 미리보기 — Live Demos와 같은 브라우저 프레임 언어를 쓰되,
// 카테고리별로 글 주제를 은유하는 장면을 그린다. 이미지·SVG 파일 없이 토큰 색만 사용.

/* 홈페이지 제작 — 섹션 블록을 쌓아 올리는 화면 */
function BuildScene() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="h-8 rounded-md bg-gradient-to-r from-accent/70 to-accent/30" />
      <div className="grid flex-1 grid-cols-3 gap-2">
        <div className="rounded-md bg-foreground-tertiary/15" />
        <div className="rounded-md bg-foreground-tertiary/15" />
        <div className="rounded-md border-2 border-dashed border-accent/50 bg-accent/10" />
      </div>
      <div className="h-5 w-2/5 self-center rounded-full bg-accent" />
    </div>
  );
}

/* 홈페이지 비용 — 견적서 */
function CostScene() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4">
      {[50, 33, 66].map((w, i) => (
        <div key={i} className="flex items-center justify-between gap-2">
          <div
            className="h-2.5 rounded bg-foreground-tertiary/25"
            style={{ width: `${w}%` }}
          />
          <div className="h-2.5 w-10 rounded bg-foreground-tertiary/20" />
        </div>
      ))}
      <div className="my-1 h-px bg-border" />
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-1/3 rounded bg-foreground/50" />
        <div className="h-3 w-14 rounded bg-accent" />
      </div>
    </div>
  );
}

/* 랜딩페이지 — 한 흐름으로 떨어지는 전환 구조 */
function LandingScene() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
      <div className="h-3.5 w-3/5 rounded bg-foreground/50" />
      <div className="h-2 w-2/5 rounded bg-foreground-tertiary/25" />
      <div className="my-0.5 h-4 w-px bg-accent/40" />
      <div className="grid w-4/5 grid-cols-3 gap-1.5">
        <div className="h-6 rounded bg-foreground-tertiary/15" />
        <div className="h-6 rounded bg-foreground-tertiary/15" />
        <div className="h-6 rounded bg-foreground-tertiary/15" />
      </div>
      <div className="my-0.5 h-4 w-px bg-accent/40" />
      <div className="h-6 w-2/5 rounded-full bg-accent shadow-[0_4px_14px_rgba(0,113,227,0.4)]" />
    </div>
  );
}

/* 검색 노출 — 검색창과 결과, 첫 번째가 우리 사이트 */
function SearchScene() {
  return (
    <div className="flex h-full flex-col gap-2.5 p-4">
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1.5">
        <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-foreground-tertiary/50" />
        <div className="h-2 w-1/2 rounded bg-foreground-tertiary/25" />
      </div>
      <div className="space-y-1 rounded-md border border-accent/40 bg-accent/10 p-2">
        <div className="h-2.5 w-3/5 rounded bg-accent/80" />
        <div className="h-2 w-4/5 rounded bg-foreground-tertiary/25" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="space-y-1 p-1">
          <div className="h-2.5 w-1/2 rounded bg-foreground-tertiary/30" />
          <div className="h-2 w-3/4 rounded bg-foreground-tertiary/15" />
        </div>
      ))}
    </div>
  );
}

/* 유지보수 — 점검 체크리스트 */
function MaintainScene() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4">
      {[true, true, true, false].map((done, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              done ? "bg-success/80" : "border border-foreground-tertiary/40"
            }`}
          >
            {done && <div className="h-1.5 w-2 -rotate-45 border-b-2 border-l-2 border-background" />}
          </div>
          <div
            className={`h-2.5 flex-1 rounded ${
              done ? "bg-foreground-tertiary/20" : "bg-foreground-tertiary/30"
            }`}
            style={{ maxWidth: `${85 - i * 12}%` }}
          />
        </div>
      ))}
    </div>
  );
}

/* 온라인 마케팅 — 우상향 그래프 */
function MarketingScene() {
  const bars = [30, 45, 38, 60, 55, 78, 92];
  return (
    <div className="flex h-full items-end justify-center gap-2 p-4 pb-5">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-5 rounded-t ${i >= bars.length - 2 ? "bg-accent" : "bg-accent/30"}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

/* 창업 — 시작을 알리는 첫 화면 */
function StartupScene() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15">
        <div className="h-4 w-4 rounded-full bg-accent" />
      </div>
      <div className="h-3 w-1/2 rounded bg-foreground/50" />
      <div className="h-2 w-2/3 rounded bg-foreground-tertiary/25" />
      <div className="mt-1 flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-accent" />
        <div className="h-5 w-16 rounded-full border border-border" />
      </div>
    </div>
  );
}

/* 운영 노하우 — 정리된 노트 */
function KnowhowScene() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4">
      <div className="h-3 w-2/5 rounded bg-foreground/50" />
      {[80, 65, 72].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
          <div className="h-2 rounded bg-foreground-tertiary/20" style={{ width: `${w}%` }} />
        </div>
      ))}
      <div className="mt-1 rounded-md border-l-2 border-accent bg-accent/10 p-2">
        <div className="h-2 w-3/4 rounded bg-foreground-tertiary/30" />
      </div>
    </div>
  );
}

const scenes: Record<BlogCategory, () => React.ReactElement> = {
  "홈페이지 제작": BuildScene,
  "홈페이지 비용": CostScene,
  랜딩페이지: LandingScene,
  "검색 노출": SearchScene,
  유지보수: MaintainScene,
  "온라인 마케팅": MarketingScene,
  창업: StartupScene,
  "운영 노하우": KnowhowScene,
};

export function BlogPreview({ category }: { category: BlogCategory }) {
  const Scene = scenes[category];

  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
    >
      <div className="flex items-center gap-1 border-b border-border bg-surface px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-warning/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-success/50" />
        <div className="ml-2 h-2.5 max-w-[50%] flex-1 rounded-sm border border-border bg-background" />
      </div>
      <div className="aspect-[16/10] bg-surface/40">
        <Scene />
      </div>
    </div>
  );
}
