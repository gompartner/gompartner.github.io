"use client";

// 11-08 상담 신청 접수 뒤 채널톡으로 바로 이어서 묻게 한다(사용자: 카카오톡은 메시지를 미리 채워 바로 보낼 수 없어 예전 채널톡이 낫다).
// 페이지를 열 때는 싣지 않고, 접수 완료 화면의 버튼을 누를 때 스크립트를 불러와 신청자 이름과 휴대폰으로 boot 한다.
// 플러그인 키는 공개 값이다(11-02 이전 ChannelTalk.tsx와 같은 키).
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

let booted = false;

/** 접수 뒤 채팅 열기. 처음 한 번은 신청자 정보로 boot 하고, 입력칸에 message를 미리 채운다. */
export function openChannelChat({ name, phone, message }: { name?: string; phone?: string; message: string }) {
  loadChannelIO();
  const open = () => window.ChannelIO?.("openChat", undefined, message);
  if (booted) return open();
  const mobileNumber = phone ? phone.replace(/\D/g, "").replace(/^0/, "+82") : undefined;
  window.ChannelIO?.(
    "boot",
    { pluginKey: PLUGIN_KEY, hideChannelButtonOnBoot: true, profile: { name: name || undefined, mobileNumber } },
    (error: unknown) => {
      if (error) return;
      booted = true;
      open();
    },
  );
}
