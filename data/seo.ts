import { manwon, plans } from "./pricing";
import { profile } from "./profile";
import { projects } from "./projects";

// 첫 화면 검색 제목·설명. 차별점은 캡처가 아니라 직접 눌러 보는 샘플(라이브 데모)과 샘플별 가격.
// 일반 사장님이 "라이브 데모"를 모르니 "눌러 보는 샘플"로 쓴다. 가격·샘플 수는 데이터에서 계산한다.
const [basic] = plans;
const demoCount = projects.filter((p) => p.demoUrl.startsWith("/demo/")).length;

export const homeTitle = `홈페이지 제작 ${manwon(basic.price)}부터, 눌러 보는 샘플 ${demoCount}개 | ${profile.name}`;
export const homeDescription =
  `업종별 홈페이지 샘플 ${demoCount}개를 캡처 사진이 아니라 실제 화면으로 눌러 볼 수 있습니다. ` +
  `학원은 반 찾기, 치과는 치아 지도, 빵집은 빵 나오는 시간. 샘플마다 이대로 만들 때 가격과 기간이 나옵니다. ` +
  `소개 홈페이지 ${manwon(basic.price)}(${basic.days}일)부터, 만드는 사람이 직접 상담합니다.`;
