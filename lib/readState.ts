"use client";

import { useEffect, useState } from "react";

// 11-22 위키 읽음 기록(LMS식). 방문자 브라우저에만 저장한다(서버로 보내지 않음).
// p: 가장 멀리 읽은 비율(0~100), y: 마지막 위치, v: 읽을 때 문서의 최종 수정일, d: 마지막으로 연 날
export type ReadRec = { p: number; y: number; v?: string; d: string };
const KEY = "gp-kn-read";
const EVT = "gp-kn-read";

export function loadAll(): Record<string, ReadRec> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function saveRec(href: string, rec: ReadRec) {
  try {
    const all = loadAll();
    all[href] = rec;
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(EVT));
  } catch {}
}

/** 목록에서 쓰는 상태. 처음 그릴 때는 비워 두고(서버 화면과 같게) 붙은 뒤 읽는다 */
export function useReadAll() {
  const [all, setAll] = useState<Record<string, ReadRec> | null>(null);
  useEffect(() => {
    const f = () => setAll(loadAll());
    f();
    window.addEventListener(EVT, f);
    window.addEventListener("storage", f);
    return () => {
      window.removeEventListener(EVT, f);
      window.removeEventListener("storage", f);
    };
  }, []);
  return all;
}

export type ReadStatus = "none" | "reading" | "done" | "changed";
export function statusOf(rec: ReadRec | undefined, ver?: string): ReadStatus {
  if (!rec) return "none";
  if (ver && rec.v && ver > rec.v) return "changed";
  return rec.p >= 90 ? "done" : "reading";
}
