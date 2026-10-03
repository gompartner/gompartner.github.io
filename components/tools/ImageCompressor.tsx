"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, Download, ImagePlus, Trash2 } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 이미지 용량 줄이기.
   사진을 canvas에 다시 그려 JPG나 WebP로 저장한다. 다시 그리면 촬영 위치 같은 EXIF 정보는 자연히 빠진다.
   설정을 바꾸면 모든 사진을 다시 줄이고, 늦게 끝난 이전 작업 결과는 버린다.
   줄인 결과가 원본보다 크면 원본을 그대로 쓴다. 파일은 서버로 보내지 않는다. */

const EASE = [0.23, 1, 0.32, 1] as const;

type Format = "jpeg" | "webp" | "keep";
type Settings = { format: Format; quality: number; maxWidth: number };

type Item = {
  id: string;
  file: File;
  origUrl: string;
  origW?: number;
  origH?: number;
  status: "working" | "done" | "error";
  error?: string;
  out?: Blob;
  outUrl?: string;
  outW?: number;
  outH?: number;
  kept?: boolean; // 줄인 결과가 더 커서 원본을 그대로 쓴 경우
};

const FORMATS: [Format, string][] = [
  ["jpeg", "JPG"],
  ["webp", "WebP"],
  ["keep", "원래 형식"],
];
const WIDTHS: [number, string][] = [
  [0, "원본"],
  [1920, "1920px"],
  [1280, "1280px"],
  [800, "800px"],
];
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function isHeic(file: File) {
  return /hei[cf]$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function compress(file: File, s: Settings) {
  if (isHeic(file)) throw new Error("heic");
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("decode");
  }
  const scale = s.maxWidth && bmp.width > s.maxWidth ? s.maxWidth / bmp.width : 1;
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("decode");
  const type = s.format === "keep" ? (EXT[file.type] ? file.type : "image/jpeg") : `image/${s.format}`;
  // JPG는 투명 영역이 검게 나오므로 흰 바탕을 먼저 깐다
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, w, h);
  const origW = bmp.width;
  const origH = bmp.height;
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, type === "image/png" ? undefined : s.quality));
  if (!blob) throw new Error("decode");
  // 줄인 결과가 원본보다 크면 원본을 그대로 쓴다
  if (blob.size >= file.size) return { blob: file as Blob, w: origW, h: origH, origW, origH, kept: true };
  return { blob, w, h, origW, origH, kept: false };
}

function outName(item: Item) {
  const base = item.file.name.replace(/\.[^.]+$/, "");
  const ext = EXT[item.out?.type ?? ""] ?? "jpg";
  return item.kept ? item.file.name : `${base}-small.${ext}`;
}

let seq = 0;

export function ImageCompressor() {
  const reduce = useReducedMotionSafe();
  const [items, setItems] = useState<Item[]>([]);
  const [settings, setSettings] = useState<Settings>({ format: "jpeg", quality: 0.8, maxWidth: 1920 });
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [split, setSplit] = useState(50);
  const runRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  const urlsRef = useRef(new Set<string>());
  const itemsRef = useRef<Item[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const makeUrl = (b: Blob) => {
    const u = URL.createObjectURL(b);
    urlsRef.current.add(u);
    return u;
  };
  const dropUrl = (u?: string) => {
    if (!u) return;
    URL.revokeObjectURL(u);
    urlsRef.current.delete(u);
  };

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
      window.clearTimeout(timerRef.current);
    };
  }, []);

  // 한 장씩 줄여서 끝나는 대로 반영한다. 더 새 작업이 시작되면 이전 결과는 버린다
  const run = async (list: Item[], s: Settings) => {
    const token = ++runRef.current;
    for (const it of list) {
      let patch: Partial<Item>;
      try {
        const r = await compress(it.file, s);
        if (token !== runRef.current) return;
        patch = { status: "done", out: r.blob, outUrl: r.kept ? it.origUrl : makeUrl(r.blob), outW: r.w, outH: r.h, origW: r.origW, origH: r.origH, kept: r.kept, error: undefined };
      } catch (e) {
        if (token !== runRef.current) return;
        const heic = (e as Error).message === "heic";
        patch = {
          status: "error",
          error: heic
            ? "아이폰 HEIC 사진은 이 브라우저에서 열 수 없습니다. 아이폰 설정의 카메라, 포맷에서 '높은 호환성'을 고른 뒤 다시 찍거나 JPG로 저장해서 넣어 주세요."
            : "사진을 열 수 없습니다. JPG, PNG, WebP 파일인지 확인해 주세요.",
        };
      }
      setItems((prev) =>
        prev.map((p) => {
          if (p.id !== it.id) return p;
          if (p.outUrl && p.outUrl !== p.origUrl && p.outUrl !== patch.outUrl) dropUrl(p.outUrl);
          return { ...p, ...patch };
        }),
      );
    }
  };

  const addFiles = (files: FileList | File[]) => {
    const added: Item[] = [...files]
      .filter((f) => f.type.startsWith("image/") || isHeic(f))
      .map((f) => ({ id: `img-${++seq}`, file: f, origUrl: makeUrl(f), status: "working" as const }));
    if (!added.length) return;
    const next = [...items, ...added];
    setItems(next);
    if (!selected) setSelected(added[0].id);
    // 진행 중인 작업이 있으면 새 작업이 끊으므로 아직 안 끝난 사진까지 함께 다시 돌린다
    run(next.filter((i) => i.status !== "done" || added.includes(i)), settings);
  };

  const changeSettings = (patch: Partial<Settings>) => {
    const s = { ...settings, ...patch };
    setSettings(s);
    setItems((prev) => prev.map((p) => (p.status === "error" ? p : { ...p, status: "working" })));
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => run(itemsRef.current, s), 250);
  };

  const remove = (id: string) => {
    const it = items.find((i) => i.id === id);
    if (it) {
      if (it.outUrl !== it.origUrl) dropUrl(it.outUrl);
      dropUrl(it.origUrl);
    }
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    if (selected === id) setSelected(next[0]?.id ?? null);
  };

  const clearAll = () => {
    runRef.current++;
    items.forEach((it) => {
      if (it.outUrl !== it.origUrl) dropUrl(it.outUrl);
      dropUrl(it.origUrl);
    });
    setItems([]);
    setSelected(null);
  };

  const download = (it: Item) => {
    if (!it.outUrl) return;
    const a = document.createElement("a");
    a.href = it.outUrl;
    a.download = outName(it);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadAll = async () => {
    for (const it of items.filter((i) => i.status === "done")) {
      download(it);
      await new Promise((r) => setTimeout(r, 350));
    }
  };

  const done = items.filter((i) => i.status === "done" && i.out);
  const before = done.reduce((n, i) => n + i.file.size, 0);
  const after = done.reduce((n, i) => n + (i.out?.size ?? 0), 0);
  const saved = before ? Math.round((1 - after / before) * 100) : 0;
  const working = items.some((i) => i.status === "working");
  const current = items.find((i) => i.id === selected);

  const chip = (on: boolean) =>
    `inline-flex h-10 items-center rounded-md border px-4 text-[15px] font-bold transition-colors ${on ? "border-accent bg-accent-surface text-accent" : "border-border hover:bg-surface"}`;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="min-w-0">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed p-6 text-center transition-colors focus-within:border-accent ${dragging ? "border-accent bg-accent-surface" : "border-[#8a949e] hover:bg-surface"}`}
        >
          <ImagePlus size={28} className="text-accent" aria-hidden />
          <span className="text-[17px] font-bold">사진을 끌어다 놓거나 눌러서 고르세요</span>
          <span className="text-[15px] text-foreground-secondary">JPG, PNG, WebP 여러 장 가능</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-[15px] leading-[1.6] text-foreground-secondary">사진은 이 브라우저 안에서만 줄이고 어디로도 보내지 않습니다. 촬영 위치 같은 정보도 함께 지워집니다.</p>

        <fieldset className="mt-8">
          <legend className="w-full border-b-2 border-foreground pb-2 text-[19px] font-bold">저장 형식</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {FORMATS.map(([v, label]) => (
              <label key={v} className={`cursor-pointer ${chip(settings.format === v)}`}>
                <input type="radio" name="format" className="sr-only" checked={settings.format === v} onChange={() => changeSettings({ format: v })} />
                {label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[15px] leading-[1.6] text-foreground-secondary">WebP가 가장 작습니다. 아주 오래된 브라우저까지 신경 써야 하면 JPG를 고르세요.</p>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="w-full border-b-2 border-foreground pb-2 text-[19px] font-bold">가로 크기</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {WIDTHS.map(([v, label]) => (
              <label key={v} className={`cursor-pointer ${chip(settings.maxWidth === v)}`}>
                <input type="radio" name="width" className="sr-only" checked={settings.maxWidth === v} onChange={() => changeSettings({ maxWidth: v })} />
                {label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[15px] leading-[1.6] text-foreground-secondary">첫 화면 큰 사진은 1920px, 본문 사진은 1280px, 목록 사진은 800px이면 충분합니다. 더 작은 사진은 늘리지 않습니다.</p>
        </fieldset>

        <div className="mt-6">
          <label htmlFor="quality" className="flex items-baseline justify-between border-b-2 border-foreground pb-2 text-[19px] font-bold">
            화질
            <span className="text-[17px] tabular-nums">{Math.round(settings.quality * 100)}</span>
          </label>
          <input
            id="quality"
            type="range"
            min={40}
            max={95}
            step={5}
            value={Math.round(settings.quality * 100)}
            onChange={(e) => changeSettings({ quality: Number(e.target.value) / 100 })}
            className="mt-4 w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[14px] text-foreground-secondary">
            <span>용량 작게</span>
            <span>화질 좋게</span>
          </div>
          <p className="mt-2 text-[15px] leading-[1.6] text-foreground-secondary">홈페이지용은 75~85가 알맞습니다. PNG로 저장할 때는 화질 설정이 적용되지 않습니다.</p>
        </div>
      </div>

      <div className="min-w-0">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-[10px] border border-dashed border-border p-6 text-center text-[17px] text-foreground-secondary">
            사진을 넣으면 줄어든 용량과 비교 화면을 보여 드립니다.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3 rounded-[10px] bg-surface p-5" aria-live="polite">
              <div>
                <p className="text-[15px] text-foreground-secondary">
                  {done.length}장 합계 {formatSize(before)}에서 {formatSize(after)}로
                </p>
                <p className="text-[32px] font-bold leading-tight tabular-nums">
                  {saved > 0 ? (
                    <>
                      {saved}% <span className="text-[17px] font-normal text-foreground-secondary">줄었습니다</span>
                    </>
                  ) : (
                    <span className="text-[22px]">더 줄일 수 없습니다</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={downloadAll}
                  disabled={!done.length || working}
                  className="inline-flex h-11 items-center gap-1.5 rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover disabled:opacity-40"
                >
                  <Download size={16} aria-hidden />
                  모두 내려받기
                </button>
                <button type="button" onClick={clearAll} aria-label="모든 사진 지우기" className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#6d7882] hover:bg-background">
                  <Trash2 size={17} aria-hidden />
                </button>
              </div>
            </div>

            {current?.status === "done" && current.outUrl && (
              <section aria-label="원본과 비교" className="mt-5">
                <div
                  className="relative overflow-hidden rounded-[10px] border border-border bg-[repeating-conic-gradient(#e6e8ea_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px]"
                  style={{ aspectRatio: `${current.outW} / ${current.outH}`, maxHeight: 520 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- 브라우저에서 만든 blob 주소라 next/image를 쓸 수 없다 */}
                  <img src={current.origUrl} alt="원본 사진" className="absolute inset-0 h-full w-full object-contain" />
                  {/* eslint-disable-next-line @next/next/no-img-element -- 위와 같은 이유 */}
                  <img
                    src={current.outUrl}
                    alt="줄인 사진"
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ clipPath: `inset(0 0 0 ${split}%)` }}
                  />
                  <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" style={{ left: `${split}%` }} aria-hidden />
                  <span className="pointer-events-none absolute left-3 top-3 rounded bg-black/65 px-2 py-0.5 text-[13px] font-bold text-white">
                    원본 {formatSize(current.file.size)}
                  </span>
                  <span className="pointer-events-none absolute right-3 top-3 rounded bg-accent px-2 py-0.5 text-[13px] font-bold text-white">
                    줄인 사진 {formatSize(current.out?.size ?? 0)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={split}
                    onChange={(e) => setSplit(Number(e.target.value))}
                    aria-label="원본과 줄인 사진 경계 옮기기"
                    className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
                  />
                </div>
                <p className="mt-2 text-[14px] text-foreground-secondary">사진 위를 좌우로 끌면 원본과 줄인 사진을 비교할 수 있습니다. 확대해서 글자나 얼굴이 뭉개지지 않는지 확인하세요.</p>
              </section>
            )}

            <ul className="mt-5 divide-y divide-border rounded-[10px] border border-border">
              <AnimatePresence initial={false}>
                {items.map((it) => {
                  const pct = it.out ? Math.round((1 - it.out.size / it.file.size) * 100) : 0;
                  const on = it.id === selected;
                  return (
                    <motion.li
                      key={it.id}
                      layout={!reduce}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0.12 : 0.2, ease: EASE }}
                      className={`flex items-center gap-3 p-3 ${on ? "bg-accent-surface" : ""}`}
                    >
                      <button type="button" onClick={() => setSelected(it.id)} aria-pressed={on} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        {/* eslint-disable-next-line @next/next/no-img-element -- blob 주소 미리보기 */}
                        <img src={it.origUrl} alt="" className="h-12 w-12 shrink-0 rounded-md bg-surface object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-[16px] font-bold">{it.file.name}</span>
                          {it.status === "working" && <span className="block text-[14px] text-foreground-secondary">줄이는 중</span>}
                          {it.status === "done" && it.out && (
                            <span className="block text-[14px] tabular-nums text-foreground-secondary">
                              {formatSize(it.file.size)}에서 {formatSize(it.out.size)}
                              {it.kept ? ", 원본이 더 작아 그대로 둡니다" : <b className="ml-1.5 text-[#1b6b2d]">{pct}% 줄임</b>}
                              {it.outW && it.origW !== it.outW && (
                                <span className="ml-1.5">
                                  (가로 {it.origW}px에서 {it.outW}px)
                                </span>
                              )}
                            </span>
                          )}
                          {it.status === "error" && (
                            <span className="mt-0.5 flex gap-1.5 text-[14px] leading-[1.5] text-[#b42318]">
                              <CircleAlert size={15} className="mt-0.5 shrink-0" aria-hidden />
                              {it.error}
                            </span>
                          )}
                        </span>
                      </button>
                      {it.status === "done" && (
                        <button type="button" onClick={() => download(it)} aria-label={`${it.file.name} 내려받기`} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background hover:bg-surface">
                          <Download size={17} aria-hidden />
                        </button>
                      )}
                      <button type="button" onClick={() => remove(it.id)} aria-label={`${it.file.name} 빼기`} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground-secondary hover:bg-surface">
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-surface p-5">
          <p className="text-[16px] font-bold">사진을 줄여도 홈페이지가 느린가요?</p>
          <ChannelTalkButton cta="tool_image_chat" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
            채팅 상담
          </ChannelTalkButton>
        </div>
      </div>
    </div>
  );
}
