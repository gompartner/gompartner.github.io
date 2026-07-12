const chartBars = [38, 52, 44, 66, 58, 74, 62, 82, 70, 88, 78, 94];

// 순수 CSS/JSX 대시보드 목업 — 이미지·SVG 없음, 토큰 색만 사용해 다크 모드 자동 대응.
export function HeroMockup() {
  return (
    <div aria-hidden className="pointer-events-none select-none relative">
      <div className="rounded-2xl border border-border bg-background shadow-2xl shadow-accent/10 overflow-hidden">
        {/* 브라우저 크롬 */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-surface">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          <div className="ml-3 h-5 flex-1 max-w-[55%] rounded-md border border-border bg-background" />
        </div>

        {/* 대시보드 본문 */}
        <div className="flex aspect-[16/11]">
          {/* 사이드바 */}
          <div className="w-[22%] border-r border-border bg-surface/60 p-3 space-y-3">
            <div className="h-2.5 w-3/4 rounded bg-foreground/60" />
            <div className="pt-2 space-y-2.5">
              <div className="h-2 w-full rounded bg-accent/70" />
              <div className="h-2 w-5/6 rounded bg-foreground-tertiary/30" />
              <div className="h-2 w-4/6 rounded bg-foreground-tertiary/30" />
              <div className="h-2 w-5/6 rounded bg-foreground-tertiary/30" />
              <div className="h-2 w-3/6 rounded bg-foreground-tertiary/30" />
            </div>
          </div>

          {/* 메인 */}
          <div className="flex-1 p-3.5 space-y-3">
            {/* KPI 카드 3개 */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { width: "w-10", delta: "bg-success/25" },
                { width: "w-8", delta: "bg-success/25" },
                { width: "w-12", delta: "bg-accent/25" },
              ].map((kpi, i) => (
                <div key={i} className="rounded-lg border border-border bg-surface/50 p-2.5 space-y-2">
                  <div className="h-1.5 w-8 rounded bg-foreground-tertiary/40" />
                  <div className={`h-3 ${kpi.width} rounded bg-foreground/70`} />
                  <div className={`h-1.5 w-6 rounded-full ${kpi.delta}`} />
                </div>
              ))}
            </div>

            {/* 바 차트 */}
            <div className="rounded-lg border border-border bg-surface/50 p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="h-1.5 w-14 rounded bg-foreground-tertiary/40" />
                <div className="h-1.5 w-8 rounded bg-foreground-tertiary/25" />
              </div>
              <div className="flex h-16 items-end gap-1.5 md:h-20">
                {chartBars.map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 origin-bottom rounded-t bg-accent/70 motion-reduce:animate-none"
                    style={{
                      height: `${height}%`,
                      animation: `grow-bar 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) ${0.4 + i * 0.05}s backwards`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 테이블 행 */}
            <div className="space-y-2">
              {["bg-success/25", "bg-warning/25", "bg-accent/25"].map((chip, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-surface/50 px-3 py-2"
                >
                  <div className="h-1.5 w-1/4 rounded bg-foreground-tertiary/40" />
                  <div className="h-1.5 w-1/3 rounded bg-foreground-tertiary/25" />
                  <div className={`ml-auto h-2 w-10 rounded-full ${chip}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 플로팅 알림 카드 — 예약 접수 → 자동 알림 발송 스토리 */}
      <div className="absolute -bottom-5 -left-4 flex items-center gap-2.5 rounded-xl border border-border bg-background px-4 py-3 shadow-xl md:-left-8">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/15 text-success text-sm">
          ✓
        </span>
        <div className="text-xs leading-tight">
          <p className="font-medium text-foreground">새 예약이 접수되었습니다</p>
          <p className="mt-0.5 text-foreground-tertiary">알림 발송 자동 완료</p>
        </div>
      </div>
    </div>
  );
}
