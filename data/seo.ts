import { manwon, plans } from "./pricing";
import { profile } from "./profile";
import { projects } from "./projects";

// 첫 화면 검색 제목·설명. 구글 상위 업체들이 제목에 가격·기간을 넣어서 같은 정보를 앞에 둔다.
// 가격·샘플 수는 데이터에서 계산해 바뀌어도 따로 고치지 않는다.
const [basic, standard] = plans;
const demoCount = projects.filter((p) => p.demoUrl.startsWith("/demo/")).length;

export const homeTitle = `홈페이지 제작 ${manwon(basic.price)}부터, 업종별 샘플 ${demoCount}개 | ${profile.name}`;
export const homeDescription =
  `쇼핑몰, 펜션, 회사, 병원, 학원 홈페이지를 1인 개발자가 직접 만듭니다. ` +
  `소개 홈페이지 ${manwon(basic.price)} ${basic.days}일, 예약 홈페이지 ${manwon(standard.price)} ${standard.days}일. ` +
  `원본 소스를 드리고 완료 후 1개월 동안 오류를 무상으로 고칩니다.`;
