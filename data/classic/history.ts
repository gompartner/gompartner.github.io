// 연혁. 11-26 회사소개(/story)의 사이트 변천사로 합쳤다. 단계, 날짜, 화면 그림은 data/classic/storyline.ts 한 곳에서 고친다.
// 그림은 단계마다 그 날짜의 커밋을 띄워 다시 찍은 public/images/history/<번호-단계>.jpg 를 가리킨다. 지어낸 실적, 고객은 넣지 않는다.
import { stages } from "@/data/classic/storyline";

export type HistoryItem = { date: string; title: string; body: string; img: string; alt: string };

export const historyLead = "2026년 7월 사이트 오픈 이후 화면과 상품 구성을 바꿔 온 과정입니다.";

// 새것이 위
export const history: HistoryItem[] = [...stages].reverse().map((s) => ({ date: s.date, title: s.title, body: s.decision, img: s.img, alt: s.alt }));
