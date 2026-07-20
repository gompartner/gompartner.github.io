import type { Project } from "@/lib/types";

// 카테고리별 미니 UI 목업 — 순수 div/토큰 색, 이미지·SVG 없음.
function HomepagePreview() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-8 rounded bg-foreground/60" />
        <div className="ml-auto flex gap-1.5">
          <div className="h-1.5 w-5 rounded bg-foreground-tertiary/30" />
          <div className="h-1.5 w-5 rounded bg-foreground-tertiary/30" />
          <div className="h-1.5 w-5 rounded bg-foreground-tertiary/30" />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <div className="h-2.5 w-2/3 rounded bg-foreground/70" />
        <div className="h-1.5 w-1/2 rounded bg-foreground-tertiary/35" />
        <div className="mt-1 h-4 w-16 rounded-full bg-accent" />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          ["#e6e8ff", "#4f5be6"],
          ["#d5f7f2", "#17c3b2"],
          ["#ffe6e3", "#ff6b5e"],
        ].map(([bg, c], i) => (
          <div
            key={i}
            className="flex h-8 items-center justify-center rounded-md"
            style={{ backgroundColor: bg }}
          >
            <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: c }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
      <div className="h-1.5 w-14 rounded-full bg-warning/60" />
      <div className="h-2.5 w-3/4 rounded bg-foreground/70" />
      <div className="h-1.5 w-1/2 rounded bg-foreground-tertiary/35" />
      <div className="mt-1 flex gap-1.5">
        {[
          ["#e6e8ff", "#4f5be6"],
          ["#d5f7f2", "#17c3b2"],
          ["#fff3d6", "#ffc63b"],
          ["#ffe6e3", "#ff6b5e"],
        ].map(([bg, c], i) => (
          <div
            key={i}
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ backgroundColor: bg }}
          >
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 h-4 w-24 rounded-full bg-accent" />
    </div>
  );
}

function SystemPreview() {
  return (
    <div className="grid h-full grid-cols-2 gap-2 p-3">
      <div className="flex flex-col gap-2 rounded-md border border-border bg-surface/70 p-2">
        <div className="h-1.5 w-10 rounded bg-foreground/60" />
        <div className="h-3.5 rounded border border-border bg-background" />
        <div className="h-3.5 rounded border border-border bg-background" />
        <div className="mt-auto h-3.5 rounded-full bg-accent" />
      </div>
      <div className="rounded-md border border-border bg-surface/70 p-2">
        <div className="mb-2 h-1.5 w-12 rounded bg-foreground/60" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-sm ${
                i === 9 || i === 17 ? "bg-accent" : i === 24 ? "bg-accent/40" : "bg-foreground-tertiary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPreview() {
  return (
    <div className="flex h-full p-3 gap-2">
      <div className="flex w-1/5 flex-col gap-1.5 rounded-md bg-[#4f5be6] p-1.5">
        <div className="h-1.5 w-3/4 rounded bg-white/80" />
        <div className="mt-1 h-1 w-full rounded bg-white/45" />
        <div className="h-1 w-5/6 rounded bg-white/45" />
        <div className="h-1 w-4/6 rounded bg-white/45" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-6 flex-1 rounded-md border border-border bg-surface/70" />
          ))}
        </div>
        {["bg-success/30", "bg-warning/30", "bg-accent/30", "bg-success/30"].map((chip, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface/70 px-2 py-1.5"
          >
            <div className="h-1 w-1/4 rounded bg-foreground-tertiary/40" />
            <div className="h-1 w-1/3 rounded bg-foreground-tertiary/25" />
            <div className={`ml-auto h-1.5 w-7 rounded-full ${chip}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function OperationPreview() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-3">
      <div className="flex items-center gap-1.5">
        <div className="flex h-7 flex-1 items-center justify-center rounded-md border border-accent/40 bg-accent/10">
          <div className="h-1.5 w-3/5 rounded bg-accent/70" />
        </div>
        <div className="h-px w-3 bg-border" />
        <div className="flex h-7 flex-1 items-center justify-center rounded-md border border-border bg-surface/70">
          <div className="h-1.5 w-3/5 rounded bg-foreground-tertiary/40" />
        </div>
        <div className="h-px w-3 bg-border" />
        <div className="flex h-7 flex-1 items-center justify-center rounded-md border border-success/40 bg-success/10">
          <div className="h-1.5 w-3/5 rounded bg-success/70" />
        </div>
      </div>
      <div className="space-y-1.5 rounded-md border border-border bg-surface/70 p-2 font-mono">
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full bg-success" />
          <div className="h-1 w-2/3 rounded bg-foreground-tertiary/40" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full bg-success" />
          <div className="h-1 w-1/2 rounded bg-foreground-tertiary/30" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-1 rounded-full bg-warning" />
          <div className="h-1 w-3/5 rounded bg-foreground-tertiary/30" />
        </div>
      </div>
    </div>
  );
}

// 유지보수·운영 — 운영 상태 패널(가동률 + 상태 로그)로 "오픈 이후 관리"를 보여준다
function MaintenancePreview() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface/70 px-2 py-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-success" />
        <div className="h-1.5 w-14 rounded bg-foreground/60" />
        <div className="ml-auto h-1.5 w-8 rounded-full bg-success/40" />
      </div>
      <div className="flex flex-1 items-end gap-1 rounded-md border border-border bg-surface/70 p-2">
        {[60, 80, 50, 90, 70, 100, 85, 95, 75, 100, 88, 92].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              backgroundColor: ["#c9cff5", "#a9ead9", "#17c3b2", "#4f5be6"][i % 4],
            }}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {["bg-success", "bg-success", "bg-warning"].map((dot, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface/70 px-2 py-1"
          >
            <div className={`h-1 w-1 rounded-full ${dot}`} />
            <div className="h-1 w-2/5 rounded bg-foreground-tertiary/40" />
            <div className="ml-auto h-1 w-6 rounded bg-foreground-tertiary/25" />
          </div>
        ))}
      </div>
    </div>
  );
}

export type PreviewCategory = Project["category"] | "maintenance";

const previews: Record<PreviewCategory, () => React.ReactElement> = {
  homepage: HomepagePreview,
  landing: LandingPreview,
  system: SystemPreview,
  admin: AdminPreview,
  operation: OperationPreview,
  maintenance: MaintenancePreview,
};

export function DemoPreview({ category }: { category: PreviewCategory }) {
  const Preview = previews[category];

  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-shadow duration-300 group-hover:shadow-md"
    >
      <div className="flex items-center gap-1 border-b border-border bg-surface px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-warning/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-success/50" />
        <div className="ml-2 h-2.5 flex-1 max-w-[50%] rounded-sm border border-border bg-background" />
      </div>
      <div className="aspect-[16/10]">
        <Preview />
      </div>
    </div>
  );
}
