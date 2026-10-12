import { landingPlans, manwon, plans } from "./pricing";
import { profile } from "./profile";

// 첫 화면 검색 제목·설명. 지금 집중하는 상품은 광고 신청 접수 랜딩이고, 차별점은 신청이 들어온 다음(알림·상태·광고별 계약 수).
// 가격은 데이터에서 계산한다.
const [basic] = plans;

export const homeTitle = `광고 신청 접수 랜딩페이지 제작, 신청 뒤 관리까지 | ${profile.name}`;
export const homeDescription =
  `광고를 보고 온 사람의 상담 신청을 받는 랜딩페이지를 만듭니다. 신청이 들어오면 바로 알리고, 구글 시트에 통화했는지 계약했는지까지 적고, ` +
  `광고별 신청과 계약 수를 묶어 보여 줍니다. 렌탈·입주청소·학원 모집 샘플에서 직접 신청해 보고 사장님 쪽 화면까지 확인하세요. ` +
  `${manwon(landingPlans[0].price)}(${landingPlans[0].days}일)부터. 회사·가게 홈페이지 ${manwon(basic.price)}부터.`;
