import { manwon, plans } from "./pricing";
import { profile } from "./profile";
import { projects } from "./projects";

// 첫 화면 검색 제목·설명. 차별점은 계약 뒤 시안 그림이 아니라, 계약 전에 직접 써 보는 샘플(라이브 데모)과 샘플별 가격.
// 가격·샘플 수는 데이터에서 계산한다.
const [basic] = plans;
const demoCount = projects.filter((p) => p.demoUrl.startsWith("/demo/")).length;

export const homeTitle = `홈페이지 제작, 시안 말고 진짜 화면으로 고르세요 | ${profile.name}`;
export const homeDescription =
  `보통은 계약하고 나서 시안 그림을 받아 봅니다. 여기서는 계약 전에 업종별 홈페이지 샘플 ${demoCount}개를 직접 써 볼 수 있습니다. ` +
  `학원 반 찾기, 치과 치아 지도, 빵집 빵 나오는 시간까지 직접 사용해 보고, 이대로 만들 때 가격과 기간도 바로 확인하세요. ` +
  `소개 홈페이지 ${manwon(basic.price)}(${basic.days}일)부터.`;
