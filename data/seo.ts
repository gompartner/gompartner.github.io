import { landingPlans, manwon, plans } from "./pricing";
import { profile } from "./profile";

// 첫 화면 검색 제목·설명. 첫 화면이 서비스 네 갈래(광고 랜딩·회사 홈페이지·유지보수·업무 프로그램)를 고르는 웹툰이라 제목도 네 가지를 담는다.
// 가격은 데이터에서 계산한다.
const [basic] = plans;

export const homeTitle = `랜딩페이지·홈페이지 제작, 유지보수, 업무 프로그램 | ${profile.name}`;
export const homeDescription =
  `광고 신청을 받는 랜딩페이지 ${manwon(landingPlans[0].price)}(${landingPlans[0].days}일)부터, 회사·가게 홈페이지 ${manwon(basic.price)}(${basic.days}일)부터. ` +
  `만든 홈페이지 오류 수정과 월 유지보수, 엑셀로 하던 일을 줄이는 업무 프로그램도 만듭니다. 샘플에서 직접 신청하고 눌러 보며 확인하세요.`;
