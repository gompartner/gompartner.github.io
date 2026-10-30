"use client";

import { useSyncExternalStore } from "react";
import { ClassicLeadReceivedPanel, type LeadRow } from "./ClassicLeadReceivedPanel";

const noopSubscribe = () => () => {};

// 가상 신청 1건과 그 전에 쌓인 줄들. 곰파트너가 이 랜딩으로 받는 신청 모양 그대로다.
const PAST: LeadRow[] = [
  { at: "오늘 11:20", name: "박ㅅ연", digits: "01077310000", summary: "입주청소 · 상담 관리", source: "메타 광고", status: "통화함" },
  { at: "오늘 09:05", name: "이ㅈ민", digits: "01022900000", summary: "학원 모집 · 잘 모르겠음", source: "네이버 검색광고", status: "계약" },
  { at: "어제 21:40", name: "이ㅈ민", digits: "01022900000", summary: "학원 모집 · 신청 접수", source: "네이버 검색광고", status: "보류" },
  { at: "어제 14:12", name: "최ㅇ준", digits: "01050160000", summary: "인테리어 · 광고 성과 정리", source: "블로그", status: "통화 전" },
];

/**
 * 신청이 들어왔을 때 사장님 쪽 화면(알림, 시트, 광고별 계약 수) 미리보기.
 * 패널이 현재 시각과 주소의 utm_source를 읽어서, 서버 HTML과 어긋나지 않게 브라우저에서만 그린다.
 */
export function ClassicOwnerPreview() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!hydrated) return <div className="min-h-[1200px] lg:min-h-[640px]" aria-hidden />;
  return (
    <ClassicLeadReceivedPanel
      business="곰파트너"
      name="김하늘"
      phone="010-1234-5678"
      summary="렌탈 · 상담 관리"
      lines={[
        ["업종", "정수기 렌탈"],
        ["광고", "네이버, 메타"],
        ["관심 패키지", "상담 관리"],
      ]}
      pastRows={PAST}
    />
  );
}
