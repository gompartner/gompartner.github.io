"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// 카탈로그의 연출 화면을 실제로 그리는 곳(app/live/[id]). 화면마다 따로 불러와 하나를 열 때 다른 화면의 3D 코드까지 받지 않게 한다.
const SCREENS: Record<string, ComponentType> = {
  "dental-homepage-2026": dynamic(() => import("@/components/drafts/Dental2026").then((m) => m.Dental2026), { ssr: false }),
  "dental-homepage-2027-window": dynamic(() => import("@/components/drafts/Dental2027Window").then((m) => m.Dental2027Window), { ssr: false }),
  "dental-homepage-2027-stage": dynamic(() => import("@/components/drafts/Dental2027Stage").then((m) => m.Dental2027Stage), { ssr: false }),
  "clinic-homepage-2026": dynamic(() => import("@/components/drafts/SkinC2026").then((m) => m.SkinC2026), { ssr: false }),
  "clinic-homepage-2027": dynamic(() => import("@/components/drafts/SkinD2027").then((m) => m.SkinD2027), { ssr: false }),
};

export function LiveScreen({ id }: { id: string }) {
  const Screen = SCREENS[id];
  return Screen ? <Screen /> : null;
}
