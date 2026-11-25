"use client";

import dynamic from "next/dynamic";
import { useVariant } from "@/lib/useVariant";
const LdWaterB = dynamic(() => import("./LdWaterB").then((m) => m.LdWaterB));
const LdCodeB = dynamic(() => import("./LdCodeB").then((m) => m.LdCodeB));
const LdCleanB = dynamic(() => import("./LdCleanB").then((m) => m.LdCleanB));
const LdPopupB = dynamic(() => import("./LdPopupB").then((m) => m.LdPopupB));
const LdZineB = dynamic(() => import("./LdZineB").then((m) => m.LdZineB));
const LdLeatherB = dynamic(() => import("./LdLeatherB").then((m) => m.LdLeatherB));

// 11-22 랜딩 시안 A, B. A는 신청, 계산, 결제가 실제로 도는 기존 랜딩, B는 새 디자인 메인 한 장(폼은 모양만).
const WaterA = dynamic(() => import("@/components/demos/LandingWaterRentalDemo").then((m) => m.LandingWaterRentalDemo));
const CodeA = dynamic(() => import("@/components/demos/LandingCodingCampDemo").then((m) => m.LandingCodingCampDemo));
const CleanA = dynamic(() => import("@/components/demos/LandingMoveCleanDemo").then((m) => m.LandingMoveCleanDemo));
const PopupA = dynamic(() => import("@/components/demos/LandingPopupStoreDemo").then((m) => m.LandingPopupStoreDemo));
const ZineA = dynamic(() => import("@/components/demos/LandingZineFairDemo").then((m) => m.LandingZineFairDemo));
const LeatherA = dynamic(() => import("@/components/demos/LandingLeatherClassDemo").then((m) => m.LandingLeatherClassDemo));

export function LandingWaterRentalDrafts() {
  return useVariant("landing-water-rental") === "b" ? <LdWaterB /> : <WaterA />;
}
export function LandingCodingCampDrafts() {
  return useVariant("landing-coding-camp") === "b" ? <LdCodeB /> : <CodeA />;
}
export function LandingMoveCleanDrafts() {
  return useVariant("landing-move-clean") === "b" ? <LdCleanB /> : <CleanA />;
}
export function LandingPopupStoreDrafts() {
  return useVariant("landing-popup-store") === "b" ? <LdPopupB /> : <PopupA />;
}
export function LandingZineFairDrafts() {
  return useVariant("landing-zine-fair") === "b" ? <LdZineB /> : <ZineA />;
}
export function LandingLeatherClassDrafts() {
  return useVariant("landing-leather-class") === "b" ? <LdLeatherB /> : <LeatherA />;
}
