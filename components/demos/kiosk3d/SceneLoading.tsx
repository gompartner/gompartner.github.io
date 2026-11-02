// 3D 장면 코드를 받는 동안 같은 자리에 띄우는 곰 로딩(three를 가져오지 않는 가벼운 파일). 장면 안 로딩과 모양이 같다
export function SceneLoading({ className = "", pct = 0, bg }: { className?: string; pct?: number; bg: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl ${className}`} style={{ background: bg }} aria-live="polite">
      <style>{"@keyframes kiosk-bear-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@media (prefers-reduced-motion: reduce){.kiosk-bear{animation:none!important}}"}</style>
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 내보내기 사이트라 next/image 최적화를 쓰지 않는다 */}
      <img src="/images/bear-avatar.webp" alt="곰파트너 곰 캐릭터" width={96} height={96} className="kiosk-bear h-24 w-24 select-none rounded-full shadow-[0_6px_16px_rgba(20,30,40,.12)]" style={{ animation: "kiosk-bear-bob 1.6s ease-in-out infinite" }} draggable={false} />
      <div className="flex w-[200px] flex-col items-center gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-[#3d4450]/40" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[13px] font-bold text-[#3d4450]">
          3D 공간 준비 중 <span className="tabular-nums">{pct}%</span>
        </p>
      </div>
    </div>
  );
}
