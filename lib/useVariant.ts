"use client";

import { useEffect, useState } from "react";

// 사례마다 시안을 두 개 이상 두고 맨 위 줄에서 바꿔 본다(11-21). 주소의 ?v=a 로 고정해 링크로 보낼 수 있다.
export const VARIANTS: Record<string, { id: string; label: string }[]> = {
  company: [
    { id: "brand", label: "시안 A 브랜드형" },
    { id: "info", label: "시안 B 정보형" },
  ],
  "law-firm": [
    { id: "a", label: "시안 A 프리미엄" },
    { id: "b", label: "시안 B 상담형" },
  ],
  "tax-office": [
    { id: "a", label: "시안 A 법인형" },
    { id: "b", label: "시안 B 사장님형" },
  ],
  "dental-homepage": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 가족형" },
  ],
  academy: [
    { id: "a", label: "시안 A 입시형" },
    { id: "b", label: "시안 B 초중등형" },
  ],
  interior: [
    { id: "a", label: "시안 A 갤러리형" },
    { id: "b", label: "시안 B 비용 안심형" },
  ],
  "korean-restaurant": [
    { id: "a", label: "시안 A 노포 브랜드형" },
    { id: "b", label: "시안 B 동네 밥집형" },
  ],
  "pilates-studio": [
    { id: "a", label: "시안 A 프리미엄" },
    { id: "b", label: "시안 B 체험 상담형" },
  ],
  "real-estate": [
    { id: "a", label: "시안 A 단지 전문형" },
    { id: "b", label: "시안 B 매물 상담형" },
  ],
  "hair-salon": [
    { id: "a", label: "시안 A 프리미엄" },
    { id: "b", label: "시안 B 가격표형" },
  ],
  "nail-shop": [
    { id: "a", label: "시안 A 컬러형" },
    { id: "b", label: "시안 B 1인 샵형" },
  ],
  roastery: [
    { id: "a", label: "시안 A 원두 브랜드" },
    { id: "b", label: "시안 B 카페 매장" },
  ],
  orthopedics: [
    { id: "a", label: "시안 A 척추관절형" },
    { id: "b", label: "시안 B 동네 의원형" },
  ],
  pediatrics: [
    { id: "a", label: "시안 A 진료시간형" },
    { id: "b", label: "시안 B 검진 접종형" },
  ],
  "korean-medicine": [
    { id: "a", label: "시안 A 전통 브랜드" },
    { id: "b", label: "시안 B 증상 상담형" },
  ],
  "eye-clinic": [
    { id: "a", label: "시안 A 수술센터형" },
    { id: "b", label: "시안 B 동네 안과형" },
  ],
  "animal-hospital": [
    { id: "a", label: "시안 A 24시 진료" },
    { id: "b", label: "시안 B 주치의형" },
  ],
  "labor-firm": [
    { id: "a", label: "시안 A 기업 자문형" },
    { id: "b", label: "시안 B 근로자 상담형" },
  ],
  scrivener: [
    { id: "a", label: "시안 A 등기 전문형" },
    { id: "b", label: "시안 B 회생 상담형" },
  ],
  "architect-office": [
    { id: "a", label: "시안 A 작품 갤러리" },
    { id: "b", label: "시안 B 주택 건축주형" },
  ],
  "photo-studio": [
    { id: "a", label: "시안 A 증명 프로필" },
    { id: "b", label: "시안 B 가족 기념" },
  ],
  "clinic-homepage": [
    { id: "a", label: "시안 A 미니멀" },
    { id: "b", label: "시안 B 진료 안내형" },
  ],
};

export function setVariant(v: string) {
  const u = new URL(window.location.href);
  u.searchParams.set("v", v);
  window.history.replaceState(null, "", u);
  window.dispatchEvent(new CustomEvent("demo:variant", { detail: v }));
}

export function useVariant(projectId: string) {
  const list = VARIANTS[projectId];
  const first = list?.[0]?.id ?? "a";
  const [v, setV] = useState(first);
  useEffect(() => {
    const read = () => {
      const q = new URLSearchParams(window.location.search).get("v");
      setV(q && list?.some((x) => x.id === q) ? q : first);
    };
    read();
    window.addEventListener("demo:variant", read);
    window.addEventListener("popstate", read);
    return () => {
      window.removeEventListener("demo:variant", read);
      window.removeEventListener("popstate", read);
    };
  }, [first, list]);
  return v;
}
