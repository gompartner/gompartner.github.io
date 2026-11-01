"use client";

import { useEffect } from "react";

// 카카오톡 채널 1:1 상담. 사이트에 스크립트를 싣지 않고 채팅방 주소로 연다(휴대폰은 카카오톡 앱, PC는 새 창).
export const KAKAO_CHAT_URL = "https://pf.kakao.com/_JxntWX/chat";

/** 상담창 열기. 카카오톡은 입력칸 미리 채우기를 지원하지 않아 주소만 연다. */
export function openKakaoChat() {
  window.open(KAKAO_CHAT_URL, "_blank", "noopener");
}

// 예전 채팅 링크(/?chat=1&msg=…)로 들어오면 카카오톡 상담으로 넘긴다
export function KakaoChat() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("chat") === "1") {
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      window.location.assign(KAKAO_CHAT_URL);
    }
  }, []);
  return null;
}

// 카카오톡 버튼만 카카오 노랑. 자리마다 넘어온 클래스에서 바탕과 글자 색만 빼고 노랑 바탕, 검은 글자로 바꾼다(크기, 테두리, 그림자는 그대로)
const COLOR_CLASS = /^(hover:)?bg-|^text-(white|accent-foreground|foreground)|^border-white/;
function kakaoColors(className: string) {
  const kept = className.split(/\s+/).filter((c) => c && !COLOR_CLASS.test(c));
  const gap = kept.some((c) => c.startsWith("gap-")) ? [] : ["gap-2"];
  return [...kept, ...gap, "bg-[#FEE500]", "text-[#191919]", "hover:bg-[#F5D800]"].join(" ");
}

// 카카오 심볼(검은 말풍선). simple-icons의 KakaoTalk 아이콘에서 말풍선 모양만 옮김
function KakaoSymbol() {
  return (
    <svg viewBox="2.25 3.375 19.5 17.85" width="18" height="17" aria-hidden="true" className="shrink-0">
      <path
        fill="currentColor"
        d="M12 3.375c-5.3848 0-9.75 3.4418-9.75 7.6875 0 2.7449 1.8249 5.1535 4.5701 6.5135-.1494.515-.9598 3.3135-.992 3.5333 0 0-.0194.1652.0876.2282s.2328.0141.2328.0141c.3068-.0428 3.5572-2.326 4.1198-2.7225.562.0796 1.1407.1209 1.7317.1209 5.3848 0 9.75-3.4418 9.75-7.6875S17.3848 3.375 12 3.375z"
      />
    </svg>
  );
}

export function KakaoChatButton({
  className,
  children,
  cta,
}: {
  className: string;
  children: React.ReactNode;
  cta: string;
  message?: string;
}) {
  return (
    <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" data-gtm-cta={cta} className={kakaoColors(className)}>
      <KakaoSymbol />
      {children}
    </a>
  );
}
