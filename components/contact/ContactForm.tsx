"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { profile } from "@/data/profile";

const FORM_ENDPOINT = "https://formspree.io/f/xbdndwog";

const needOptions = [
  "홈페이지 제작",
  "랜딩페이지",
  "예약·관리 시스템",
  "유지보수",
  "아직 모르겠어요 — 상담으로 정할게요",
];

type FormStatus = "idle" | "submitting" | "success" | "error";

// Firestore 보안 규칙과 동일한 제한 — 초과분은 입력 단계에서 차단
const LIMITS = { name: 100, contact: 200, message: 2000 } as const;

const inputClasses =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-foreground-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

function LengthCounter({ length, limit }: { length: number; limit: number }) {
  return (
    <span
      className={`text-xs tabular-nums ${
        length >= limit ? "font-medium text-warning" : "text-foreground-tertiary"
      }`}
      aria-live="polite"
    >
      {length.toLocaleString()} / {limit.toLocaleString()}자
    </span>
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  // 필수 필드가 (공백 제외) 채워져야만 제출 가능
  const isValid =
    name.trim().length > 0 && contact.trim().length > 0 && message.trim().length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // 허니팟이 채워졌으면 스팸 — 전송 없이 성공처럼 처리
    if (data.get("_gotcha")) {
      setStatus("success");
      return;
    }

    setStatus("submitting");

    const payload = {
      name: String(data.get("name") ?? ""),
      contact: String(data.get("contact") ?? ""),
      need: String(data.get("need") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    // 이메일 알림용 보조 채널 — 실패해도 접수 성공 판정에는 영향 없음
    const notifyByFormspree = () =>
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          이름: payload.name,
          연락처: payload.contact,
          "필요한 것": payload.need,
          "문의 내용": payload.message,
        }),
      });

    try {
      // Firestore가 주 저장소 — firebase 모듈은 제출 시점에만 로드해 초기 번들을 지킨다
      const [{ getFirebaseApp, INQUIRIES_COLLECTION }, firestore] = await Promise.all([
        import("@/lib/firebase"),
        import("firebase/firestore"),
      ]);
      const db = firestore.getFirestore(getFirebaseApp());
      await firestore.addDoc(firestore.collection(db, INQUIRIES_COLLECTION), {
        ...payload,
        status: "new",
        createdAt: firestore.serverTimestamp(),
      });

      notifyByFormspree().catch(() => {});

      // 성공한 제출만 전환으로 계수 — CtaTracker와 동일한 이벤트 형태
      window.dataLayer ??= [];
      window.dataLayer.push({ event: "cta_click", cta_id: "contact_form_submit" });
      setStatus("success");
    } catch {
      // Firestore 실패 시 Formspree 단독 접수를 폴백으로 시도
      try {
        const res = await notifyByFormspree();
        if (!res.ok) throw new Error(`submit failed: ${res.status}`);
        window.dataLayer ??= [];
        window.dataLayer.push({ event: "cta_click", cta_id: "contact_form_submit" });
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
  }

  if (status === "success") {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-9 text-center"
        role="status"
      >
        <CheckCircle2 size={36} className="text-success" aria-hidden />
        <h2 className="text-xl font-semibold text-foreground">문의가 접수되었습니다</h2>
        <p className="text-sm leading-relaxed text-foreground-secondary">
          보통 영업일 기준 24시간 안에 회신드립니다.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-surface p-7"
      aria-label="상담 문의 양식"
    >
      <h2 className="font-semibold text-foreground">문의 양식</h2>
      <div className="mt-5 flex flex-col gap-4">
        <div>
          <div className="mb-1.5 flex items-end justify-between gap-2">
            <label htmlFor="contact-name" className="block text-sm font-medium text-foreground-secondary">
              이름 <span className="text-accent">*</span>
            </label>
            <LengthCounter length={name.length} limit={LIMITS.name} />
          </div>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={LIMITS.name}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="name"
            placeholder="성함 또는 상호"
            className={inputClasses}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-end justify-between gap-2">
            <label htmlFor="contact-contact" className="block text-sm font-medium text-foreground-secondary">
              연락처 <span className="text-accent">*</span>
            </label>
            <LengthCounter length={contact.length} limit={LIMITS.contact} />
          </div>
          <input
            id="contact-contact"
            name="contact"
            type="text"
            required
            maxLength={LIMITS.contact}
            value={contact}
            onChange={(e) => setContact(e.currentTarget.value)}
            placeholder="이메일 또는 전화번호"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="contact-need" className="mb-1.5 block text-sm font-medium text-foreground-secondary">
            필요한 것
          </label>
          <select id="contact-need" name="need" defaultValue="" className={inputClasses}>
            <option value="" disabled>
              선택해 주세요 (선택 사항)
            </option>
            {needOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 flex items-end justify-between gap-2">
            <label htmlFor="contact-message" className="block text-sm font-medium text-foreground-secondary">
              문의 내용 <span className="text-accent">*</span>
            </label>
            <LengthCounter length={message.length} limit={LIMITS.message} />
          </div>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            maxLength={LIMITS.message}
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            placeholder="어떤 사업을 하시는지, 무엇이 필요한지 편하게 적어주세요."
            className={inputClasses}
          />
          {message.length >= LIMITS.message && (
            <p className="mt-1.5 text-xs text-warning">
              최대 {LIMITS.message.toLocaleString()}자까지 입력할 수 있습니다. 더 긴 내용은
              이메일로 보내주세요.
            </p>
          )}
        </div>

        {/* 스팸 방지 허니팟 — 사람에게는 보이지 않는다 */}
        <input
          type="text"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        {status === "error" && (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            전송에 문제가 생겼습니다. 잠시 후 다시 시도하시거나, 아래 이메일(
            {profile.email})로 보내주세요.
          </p>
        )}

        <Button
          type="submit"
          disabled={status === "submitting" || !isValid}
          className="w-full"
        >
          {status === "submitting" ? (
            "보내는 중…"
          ) : (
            <>
              문의 보내기
              <Send size={16} aria-hidden />
            </>
          )}
        </Button>
        <p className="text-center text-xs text-foreground-tertiary">
          상담과 견적은 무료입니다.
        </p>
      </div>
    </form>
  );
}
