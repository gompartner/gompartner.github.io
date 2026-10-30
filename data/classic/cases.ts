// 고객 사례(/classic/cases). 게재 동의를 받은 실제 사례만 넣는다.
// 비어 있으면 메뉴에 나오지 않고 페이지도 열리지 않는다.
export interface CustomerCase {
  id: string;
  industry: string;
  problem: string;
  made: string;
  /** 고객 한마디. 동의받은 문장 그대로 */
  quote?: string;
  url?: string;
}

export const cases: CustomerCase[] = [];
