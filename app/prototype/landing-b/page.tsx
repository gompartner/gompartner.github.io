import type { Metadata } from "next";
import { LandingB } from "./LandingB";

export const metadata: Metadata = {
  title: "랜딩 시안 B — Framer Motion",
  description: "React + Tailwind + Framer Motion 기반 메인 랜딩 2차 시안입니다.",
  robots: { index: false },
};

export default function LandingBPage() {
  return <LandingB />;
}
