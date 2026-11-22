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
  "patent-office": [
    { id: "a", label: "시안 A 기술 특허형" },
    { id: "b", label: "시안 B 상표 출원형" },
  ],
  "family-law": [
    { id: "a", label: "시안 A 이혼 절차형" },
    { id: "b", label: "시안 B 재산 양육형" },
  ],
  "visa-agent": [
    { id: "a", label: "시안 A 기업 고용형" },
    { id: "b", label: "시안 B 개인 체류형" },
  ],
  "nursing-hospital": [
    { id: "a", label: "시안 A 재활 진료형" },
    { id: "b", label: "시안 B 생활 안내형" },
  ],
  optical: [
    { id: "a", label: "시안 A 누진 검안형" },
    { id: "b", label: "시안 B 셀렉트숍형" },
  ],
  "car-detailing": [
    { id: "a", label: "시안 A PPF 스튜디오" },
    { id: "b", label: "시안 B 동네 세차형" },
  ],
  "piano-academy": [
    { id: "a", label: "시안 A 어린이 피아노" },
    { id: "b", label: "시안 B 성인 취미" },
  ],
  taekwondo: [
    { id: "a", label: "시안 A 유초등부" },
    { id: "b", label: "시안 B 품새 심사" },
  ],
  "art-academy": [
    { id: "a", label: "시안 A 입시 미술" },
    { id: "b", label: "시안 B 어린이 미술" },
  ],
  "english-talk": [
    { id: "a", label: "시안 A 성인 회화" },
    { id: "b", label: "시안 B 어린이 영어" },
  ],
  "driving-school": [
    { id: "a", label: "시안 A 면허 취득" },
    { id: "b", label: "시안 B 도로 연수" },
  ],
  "reading-academy": [
    { id: "a", label: "시안 A 초등 독서" },
    { id: "b", label: "시안 B 중고등 국어" },
  ],
  pharmacy: [
    { id: "a", label: "시안 A 동네 약국" },
    { id: "b", label: "시안 B 복약 상담" },
  ],
  pension: [
    { id: "a", label: "시안 A 바다 전망" },
    { id: "b", label: "시안 B 숲속 독채" },
  ],
  "bakery-cafe": [
    { id: "a", label: "시안 A 동네 빵집" },
    { id: "b", label: "시안 B 베이커리 카페" },
  ],
  "hanok-cafe": [
    { id: "a", label: "시안 A 전통 찻집" },
    { id: "b", label: "시안 B 한옥 커피" },
  ],
  "furniture-workshop": [
    { id: "a", label: "시안 A 맞춤 제작" },
    { id: "b", label: "시안 B 쇼룸 컬렉션" },
  ],
  coworking: [
    { id: "a", label: "시안 A 코워킹" },
    { id: "b", label: "시안 B 비상주 사무실" },
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
