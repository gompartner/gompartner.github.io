import { Phone } from "lucide-react";
import { KakaoChatButton } from "@/components/layout/KakaoChat";
import { profile } from "@/data/classic/profile";

// 11-12 휴대폰 화면 아래에 늘 떠 있는 전화, 카카오톡 상담 버튼. 휴대폰은 머리글 "상담 신청" 하나뿐이고
// 전화와 카톡은 바닥글에만 있어서 둔다. PC(md 이상)는 머리글과 상담 띠로 충분해 숨긴다.
// 바닥글의 pb-24(휴대폰)가 이 띠 높이만큼 비워 두어 맨 아래 글을 가리지 않는다. 메뉴 패널(z-50)보다 아래에 깔린다.
export function MobileContactBar() {
  return (
    <div
      role="region"
      aria-label="전화, 카카오톡 상담"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e6e9ee] bg-white px-3 pt-2 shadow-[0_-6px_20px_rgba(21,23,28,.08)] md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-[560px] grid-cols-2 gap-2">
        <a
          href={`tel:${profile.phone.replace(/-/g, "")}`}
          data-gtm-cta="mobile_bar_tel"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0f1b3d] text-[16px] font-bold text-white"
        >
          <Phone size={18} aria-hidden />
          전화 상담
        </a>
        <KakaoChatButton cta="mobile_bar_chat" className="inline-flex h-12 items-center justify-center rounded-md text-[16px] font-bold">
          카카오톡 상담
        </KakaoChatButton>
      </div>
    </div>
  );
}
