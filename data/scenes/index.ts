import { part1 } from "./part1";
import { part2 } from "./part2";
import { part3 } from "./part3";
import { part4 } from "./part4";
import type { SampleScenario } from "./types";

export type { Scene, SampleScenario, BearImg } from "./types";

/** 샘플(project id)별 대화형 웹툰 시나리오 */
export const scenarios: Record<string, SampleScenario> = { ...part1, ...part2, ...part3, ...part4 };
