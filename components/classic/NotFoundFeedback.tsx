"use client";

import { useRef, useState } from "react";
import { Star } from "lucide-react";
import { LEAD_ENDPOINT } from "@/data/classic/leadEndpoint";

// 11-27 사용자 "404는 앗 기존 지웠어요라고 하고 불편사항 받도록 해보는 건 어때? 별점이랑".
// 이름, 연락처는 받지 않는다. 별점과 한 줄 내용, 들어온 주소만 상담 신청과 같은 구글 시트("불편사항" 탭)로 보낸다(Apps Script action site_feedback).
// 누르는 단추는 흰 알약(11-26 색 규칙). 별은 라디오 묶음이라 키보드 화살표로도 고른다.
const LABELS = ["매우 불편", "불편", "보통", "괜찮음", "좋음"];

export function NotFoundFeedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const startedAt = useRef(Date.now());
  const trap = useRef<HTMLInputElement>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating && !message.trim()) { setState("error"); setErr("별점이나 내용을 남겨 주세요."); return; }
    setState("sending");
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({ action: "site_feedback", rating, message: message.trim(), page: location.href, ref: document.referrer, startedAt: startedAt.current, website: trap.current?.value || "" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) setState("done");
      else { setState("error"); setErr(data.error || "보내지 못했습니다. 다시 시도해 주세요."); }
    } catch {
      setState("error"); setErr("보내지 못했습니다. 다시 시도해 주세요.");
    }
  };

  if (state === "done")
    return (
      <div role="status" className="mt-10 rounded-[20px] border border-white/12 bg-[#121722] p-6 md:p-7">
        <p className="text-[18px] font-[800] tracking-[-0.03em]">보내 주셔서 감사합니다</p>
        <p className="mt-2 break-keep text-[15px] leading-[1.7] text-[#aab2bf]">남겨 주신 내용을 확인하고 필요한 페이지는 다시 만들거나 맞는 곳으로 연결하겠습니다.</p>
      </div>
    );

  const shown = hover || rating;
  return (
    <form onSubmit={send} className="mt-10 rounded-[20px] border border-white/12 bg-[#121722] p-6 md:p-7" noValidate>
      <fieldset>
        <legend className="text-[18px] font-[800] tracking-[-0.03em]">불편했던 점을 알려 주세요</legend>
        <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label="사이트 이용 별점" onMouseLeave={() => setHover(0)}>
          {LABELS.map((t, i) => {
            const v = i + 1;
            return (
              <label key={v} className="cursor-pointer p-1" onMouseEnter={() => setHover(v)}>
                <input type="radio" name="rating" value={v} checked={rating === v} onChange={() => setRating(v)} className="peer sr-only" aria-label={`별 ${v}개, ${t}`} />
                <Star size={30} aria-hidden strokeWidth={1.6} className={`transition-colors motion-reduce:transition-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white ${v <= shown ? "fill-[#ffd84d] text-[#ffd84d]" : "text-white/35"}`} />
              </label>
            );
          })}
          <span className="ml-2 text-[14px] text-[#aab2bf]" aria-live="polite">{shown ? LABELS[shown - 1] : "별점"}</span>
        </div>
      </fieldset>
      <label className="mt-5 block">
        <span className="text-[15px] font-bold text-[#c9ced6]">찾으시던 내용이나 불편했던 점</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3} placeholder="예: 예전에 보던 가격표 페이지를 찾고 있었어요" className="mt-2 block w-full resize-y rounded-[12px] border border-white/15 bg-[#0b0d12] px-4 py-3 text-[16px] leading-[1.6] text-white placeholder:text-white/35 focus:border-white/60 focus:outline-none" />
      </label>
      <input ref={trap} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-px w-px opacity-0" />
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="gp-primary inline-flex min-h-12 items-center rounded-full px-6 text-[16px] font-[800] disabled:opacity-60">
          {state === "sending" ? "보내는 중" : "보내기"}
        </button>
      </div>
      {state === "error" ? <p role="alert" className="mt-3 text-[15px] text-[#ffb4a6]">{err}</p> : null}
    </form>
  );
}
