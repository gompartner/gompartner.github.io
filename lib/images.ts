// 데모 썸네일 경로. 원본(1440x900)은 public/images/demos, 카드용 작은 판(720x450)은 그 아래 sm/ 에 둔다.
// 작은 판은 `python3`+PIL로 원본을 가로 720px·품질 80으로 줄여 만든다. 공유 이미지·메타데이터에는 원본 경로를 그대로 쓴다.
const DEMOS = "/images/demos/";
const DEMOS_SM = "/images/demos/sm/";

export const SMALL_IMAGE_WIDTH = 720;
export const SMALL_IMAGE_HEIGHT = 450;

/** 카드처럼 작게 보이는 자리에 쓸 썸네일 경로. 데모 이미지가 아니면 그대로 돌려준다. */
export function smallImage(url: string): string {
  if (!url.startsWith(DEMOS) || url.startsWith(DEMOS_SM)) return url;
  return DEMOS_SM + url.slice(DEMOS.length);
}
