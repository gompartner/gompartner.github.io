"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const noopSubscribe = () => () => {};

/**
 * framer-motion의 useReducedMotion을 하이드레이션에 안전하게 감싼다.
 * 서버 렌더와 하이드레이션 동안에는 false로 두어 서버 HTML(애니메이션 시작 상태)과 맞추고,
 * 그 뒤 사용자 설정을 따른다. 처음부터 true를 쓰면 서버가 그린 opacity 0 같은 시작 상태가
 * 고쳐지지 않고 남아 동작 줄이기를 켠 사용자에게 내용이 보이지 않는다.
 */
export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return hydrated ? !!reduce : false;
}
