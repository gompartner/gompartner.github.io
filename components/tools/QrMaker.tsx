"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { CircleAlert, Download } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";

/* QR코드 만들기.
   홈페이지 주소, 와이파이, 전화, 문자, 일반 글을 QR로 바꾸고 PNG와 SVG로 내려받는다.
   캔버스에 QR을 그린 뒤 원하면 아래에 짧은 문구(예: 메뉴판 보기)를 함께 그린다.
   모두 브라우저 안에서 만들고, 만료나 접속 기록이 없는 일반 QR이다. */

type Kind = "url" | "wifi" | "tel" | "sms" | "text";
type Level = "L" | "M" | "Q" | "H";

const KINDS: [Kind, string][] = [
  ["url", "홈페이지 주소"],
  ["wifi", "와이파이"],
  ["tel", "전화번호"],
  ["sms", "문자"],
  ["text", "일반 글"],
];

const COLORS = [
  { name: "검정", value: "#111111" },
  { name: "남색", value: "#1e3a8a" },
  { name: "청록", value: "#0b6664" },
  { name: "자주", value: "#7a1f4b" },
  { name: "갈색", value: "#5b3a1e" },
];

const LEVELS: [Level, string, string][] = [
  ["L", "기본", "화면에 띄워 쓸 때"],
  ["M", "보통", "대부분 여기에 맞습니다"],
  ["Q", "튼튼하게", "전단지, 스티커처럼 인쇄할 때"],
  ["H", "가장 튼튼하게", "긁히거나 구겨질 수 있는 곳"],
];

const SIZES = [
  { label: "작게", px: 512 },
  { label: "보통", px: 1024 },
  { label: "크게 (인쇄용)", px: 2048 },
];

// 와이파이 QR 표준에서 특수문자는 역슬래시로 감싼다
const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

// 흰 배경 대비 명도 비율
function contrast(hex: string) {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (l + 0.05);
}

type Fields = { url: string; ssid: string; password: string; security: "WPA" | "WEP" | "nopass"; hidden: boolean; tel: string; smsTo: string; smsBody: string; text: string };

function payload(kind: Kind, f: Fields) {
  switch (kind) {
    case "url": {
      const u = f.url.trim();
      if (!u) return "";
      return /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
    }
    case "wifi":
      if (!f.ssid.trim()) return "";
      return `WIFI:T:${f.security};S:${wifiEscape(f.ssid)};${f.security === "nopass" ? "" : `P:${wifiEscape(f.password)};`}${f.hidden ? "H:true;" : ""};`;
    case "tel": {
      const n = f.tel.replace(/[^\d+]/g, "");
      return n ? `tel:${n}` : "";
    }
    case "sms": {
      const n = f.smsTo.replace(/[^\d+]/g, "");
      return n ? `SMSTO:${n}:${f.smsBody}` : "";
    }
    case "text":
      return f.text;
  }
}

export function QrMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [kind, setKind] = useState<Kind>("url");
  const [f, setF] = useState<Fields>({
    url: "https://www.gompartner.co.kr",
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
    tel: "",
    smsTo: "",
    smsBody: "",
    text: "",
  });
  const [color, setColor] = useState(COLORS[0].value);
  const [level, setLevel] = useState<Level>("M");
  const [size, setSize] = useState(1024);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  const data = payload(kind, f);
  const lowContrast = contrast(color) < 4.5;
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  // 캔버스에 QR과 아래 문구를 그린다. 미리보기도 내려받기와 같은 캔버스를 쓴다
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!data) {
      canvas.width = canvas.height = 0;
      return;
    }
    let cancelled = false;
    const qr = document.createElement("canvas");
    QRCode.toCanvas(qr, data, { errorCorrectionLevel: level, margin: 4, width: size, color: { dark: color, light: "#ffffff" } })
      .then(() => {
        if (cancelled) return;
        const text = caption.trim();
        const capH = text ? Math.round(size * 0.14) : 0;
        canvas.width = size;
        canvas.height = size + capH;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(qr, 0, 0);
        if (text) {
          let fontSize = Math.round(size * 0.07);
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const font = (px: number) => `bold ${px}px Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
          ctx.font = font(fontSize);
          while (ctx.measureText(text).width > size * 0.86 && fontSize > 10) {
            fontSize -= 2;
            ctx.font = font(fontSize);
          }
          ctx.fillText(text, size / 2, size + capH * 0.32);
        }
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("내용이 너무 깁니다. 글자 수를 줄이거나 오류 복원 수준을 낮춰 주세요.");
      });
    return () => {
      cancelled = true;
    };
  }, [data, level, size, color, caption]);

  const fileName = () => `qr-${kind}-${new Date().toISOString().slice(0, 10)}`;

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${fileName()}.png`;
    a.click();
  };

  const downloadSvg = async () => {
    if (!data) return;
    let svg = await QRCode.toString(data, { type: "svg", errorCorrectionLevel: level, margin: 4, color: { dark: color, light: "#ffffff" } });
    const text = caption.trim();
    if (text) {
      // viewBox 아래쪽을 늘려 문구를 넣는다
      const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      if (m) {
        const w = Number(m[1]);
        const h = Number(m[2]);
        const extra = Math.round(w * 0.14);
        const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        svg = svg
          .replace(m[0], `viewBox="0 0 ${w} ${h + extra}"`)
          .replace(/<path fill="#ffffff"[^>]*\/>/, `<rect width="${w}" height="${h + extra}" fill="#ffffff"/>`)
          .replace(
            "</svg>",
            `<text x="${w / 2}" y="${h + extra * 0.32}" text-anchor="middle" dominant-baseline="middle" font-family="Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" font-weight="700" font-size="${(w * 0.07).toFixed(2)}" fill="${color}">${esc}</text></svg>`,
          );
      }
    }
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const input = "mt-1.5 h-12 w-full rounded-md border border-[#8a949e] bg-background px-3 text-[17px] focus:border-accent";
  const chip = (on: boolean) =>
    `inline-flex h-10 cursor-pointer items-center rounded-md border px-4 text-[15px] font-bold transition-colors ${on ? "border-accent bg-accent-surface text-accent-hover" : "border-border hover:bg-surface"}`;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <form className="min-w-0" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="w-full border-b-2 border-foreground pb-2 text-[19px] font-bold">무엇을 담을까요?</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {KINDS.map(([k, label]) => (
              <label key={k} className={chip(kind === k)}>
                <input type="radio" name="kind" checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4">
          {kind === "url" && (
            <label className="block text-[16px] font-bold">
              홈페이지 주소
              <input value={f.url} onChange={set("url")} className={input} inputMode="url" placeholder="https://www.gompartner.co.kr" />
            </label>
          )}
          {kind === "wifi" && (
            <>
              <label className="block text-[16px] font-bold">
                와이파이 이름
                <input value={f.ssid} onChange={set("ssid")} className={input} placeholder="GOMSUNIM_5G" autoComplete="off" />
              </label>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
                <label className="block text-[16px] font-bold">
                  비밀번호
                  <input value={f.password} onChange={set("password")} className={input} disabled={f.security === "nopass"} autoComplete="off" spellCheck={false} />
                </label>
                <label className="block text-[16px] font-bold">
                  보안 방식
                  <select value={f.security} onChange={set("security")} className={input}>
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">비밀번호 없음</option>
                  </select>
                </label>
              </div>
              <label className="inline-flex items-center gap-2 text-[16px]">
                <input type="checkbox" checked={f.hidden} onChange={set("hidden")} className="h-5 w-5" />
                숨겨진 와이파이입니다
              </label>
            </>
          )}
          {kind === "tel" && (
            <label className="block text-[16px] font-bold">
              전화번호
              <input value={f.tel} onChange={set("tel")} className={input} inputMode="tel" placeholder="02-000-0000" />
            </label>
          )}
          {kind === "sms" && (
            <>
              <label className="block text-[16px] font-bold">
                받는 번호
                <input value={f.smsTo} onChange={set("smsTo")} className={input} inputMode="tel" placeholder="010-0000-0000" />
              </label>
              <label className="block text-[16px] font-bold">
                미리 써 둘 문자
                <input value={f.smsBody} onChange={set("smsBody")} className={input} placeholder="예약 문의드립니다" />
              </label>
            </>
          )}
          {kind === "text" && (
            <label className="block text-[16px] font-bold">
              내용
              <textarea value={f.text} onChange={set("text")} rows={4} className={`${input} h-auto py-2 leading-[1.5]`} placeholder="QR을 찍으면 보일 글" />
            </label>
          )}
        </div>

        <fieldset className="mt-8">
          <legend className="w-full border-b-2 border-foreground pb-2 text-[19px] font-bold">모양</legend>
          <p className="mt-4 text-[16px] font-bold">색상</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {COLORS.map((c) => (
              <label key={c.value} className={chip(color === c.value)}>
                <input type="radio" name="color" checked={color === c.value} onChange={() => setColor(c.value)} className="sr-only" />
                <span className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: c.value }} aria-hidden />
                {c.name}
              </label>
            ))}
            <label className={chip(!COLORS.some((c) => c.value === color))}>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mr-2 h-5 w-6 cursor-pointer border-0 bg-transparent p-0" />
              직접 고르기
            </label>
          </div>
          {lowContrast && (
            <p className="mt-2 flex gap-2 rounded-md bg-[#fff4e5] px-3 py-2 text-[15px] leading-[1.5] text-[#8a4b08]" role="status">
              <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
              색이 너무 연해서 휴대폰 카메라가 못 읽을 수 있습니다. 더 진한 색을 고르세요.
            </p>
          )}

          <p className="mt-5 text-[16px] font-bold">오류 복원 수준</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {LEVELS.map(([v, label, hint]) => (
              <label key={v} className={`flex cursor-pointer flex-col rounded-md border px-4 py-2.5 transition-colors ${level === v ? "border-accent bg-accent-surface" : "border-border hover:bg-surface"}`}>
                <input type="radio" name="level" checked={level === v} onChange={() => setLevel(v)} className="sr-only" />
                <span className={`text-[15px] font-bold ${level === v ? "text-accent-hover" : ""}`}>{label}</span>
                <span className="text-[14px] text-foreground-secondary">{hint}</span>
              </label>
            ))}
          </div>

          <p className="mt-5 text-[16px] font-bold">내려받을 크기</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <label key={s.px} className={chip(size === s.px)}>
                <input type="radio" name="size" checked={size === s.px} onChange={() => setSize(s.px)} className="sr-only" />
                {s.label} <span className="ml-1 font-normal tabular-nums text-foreground-secondary">{s.px}px</span>
              </label>
            ))}
          </div>

          <label className="mt-5 block text-[16px] font-bold">
            QR 아래 문구 <span className="font-normal text-foreground-secondary">(선택)</span>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={20} className={input} placeholder="메뉴판 보기, 와이파이 연결" />
          </label>
        </fieldset>
      </form>

      <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <section aria-labelledby="qr-preview" className="rounded-[10px] border border-border p-5">
          <h2 id="qr-preview" className="text-[19px] font-bold">
            미리보기
          </h2>
          <div className="mt-4 flex min-h-[240px] items-center justify-center rounded-md bg-surface p-4">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={data ? "만든 QR코드" : ""}
              className={`h-auto w-full max-w-[320px] bg-white ${data && !error ? "" : "hidden"}`}
            />
            {(!data || error) && <p className="text-center text-[16px] text-foreground-secondary">{error || "입력한 내용이 없습니다."}</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={downloadPng} disabled={!data || !!error} className="inline-flex h-11 items-center gap-1.5 rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover disabled:opacity-40">
              <Download size={16} aria-hidden />
              PNG 내려받기
            </button>
            <button type="button" onClick={downloadSvg} disabled={!data || !!error} className="inline-flex h-11 items-center gap-1.5 rounded-md border border-[#6d7882] px-4 text-[15px] font-bold hover:bg-surface disabled:opacity-40">
              <Download size={16} aria-hidden />
              SVG 내려받기
            </button>
          </div>
          <p className="mt-3 text-[14px] leading-[1.6] text-foreground-secondary">
            인쇄용은 SVG로 받으면 깨지지 않습니다. 기간 제한 없이 계속 쓸 수 있습니다.
          </p>
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-surface p-5">
          <p className="text-[16px] font-bold">QR로 연결할 홈페이지가 필요하신가요?</p>
          <ChannelTalkButton cta="tool_qr_chat" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
            채팅 상담
          </ChannelTalkButton>
        </div>
      </div>
    </div>
  );
}
