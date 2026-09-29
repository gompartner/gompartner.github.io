"use client";

import { useEffect } from "react";

// 채널톡 상담 버튼 — 랜딩(site 레이아웃)에서만 띄우고, 벗어나면 내린다.
// 플러그인 키는 공개 값이라 하드코딩하되 NEXT_PUBLIC_CHANNEL_PLUGIN_KEY로 바꿀 수 있다.
const PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY ?? "95ed443a-0c72-4d16-9d5d-ce8586e41201";

type ChannelIOFn = ((...args: unknown[]) => void) & { q?: unknown[][]; c?: (args: unknown[]) => void };

declare global {
  interface Window {
    ChannelIO?: ChannelIOFn;
    ChannelIOInitialized?: boolean;
  }
}

function loadChannelIO() {
  if (window.ChannelIO) return;
  const ch: ChannelIOFn = (...args: unknown[]) => ch.c?.(args);
  ch.q = [];
  ch.c = (args) => ch.q?.push(args);
  window.ChannelIO = ch;
  if (window.ChannelIOInitialized) return;
  window.ChannelIOInitialized = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
  document.head.appendChild(s);
}

/** 상담창 열기 — 버튼 onClick에서 쓴다 */
export function openChannelTalk() {
  window.ChannelIO?.("showMessenger");
}

export function ChannelTalk() {
  useEffect(() => {
    if (!PLUGIN_KEY) return;
    loadChannelIO();
    window.ChannelIO?.("boot", { pluginKey: PLUGIN_KEY });
    return () => window.ChannelIO?.("shutdown");
  }, []);
  return null;
}

export function ChannelTalkButton({ className, children, cta }: { className: string; children: React.ReactNode; cta: string }) {
  return (
    <button type="button" onClick={openChannelTalk} data-gtm-cta={cta} className={className}>
      {children}
    </button>
  );
}
