// 샘플 표지의 대화형 웹툰. 의뢰인(그 업종 사장님·담당자)과 곰파트너 곰이 주고받는 이야기로
// 기획 의도와 만드는 과정, 넣은 기능을 보여 준다. 샘플은 가상의 업종으로 만든 것이라 실제 의뢰처럼 쓰지 않는다.
export type BearImg = "bear-hello" | "bear-research" | "bear-think" | "bear-work" | "bear-point";

export type Scene =
  /** 노란 내레이션 상자. 장면 전환과 소제목("기획 의도", "만드는 중", "다음 날") */
  | { t: "note"; text: string }
  /** 의뢰인 말풍선(왼쪽) */
  | { t: "client"; text: string }
  /** 곰 말풍선(오른쪽) */
  | { t: "bear"; text: string }
  /** 곰 그림 컷. text는 컷 위 곰의 말 */
  | { t: "cut"; img: BearImg; text?: string }
  /** 의뢰인 쪽 장면 그림 컷(public 경로). note는 컷 왼쪽 위 내레이션, text는 컷 위 말풍선 */
  | { t: "pic"; src: string; alt: string; note?: string; text?: string }
  /** 샘플 화면 컷. tours[샘플id][step] 영역을 휴대폰 폭으로 캡처한 그림. text는 화면 아래 설명 한 줄 */
  | { t: "shot"; step: number; text?: string };

export interface SampleScenario {
  /** 의뢰인 호칭. 예: "펜션 사장님", "원장님", "주무관님" */
  client: string;
  scenes: Scene[];
}
