// 손가락으로 넘기는 기기(휴대폰, 태블릿)인지. 조립을 시작하는 자리를 기기에 맞게 잡는 데 쓴다.
// 11-26 스크롤을 붙잡던 장치는 걷어 냈다(사용자 "스크롤 블럭은 하지 말자. 잘 안 되는 듯. 자연스럽게 냅두자"). 파일 이름은 불러 쓰는 곳을 그대로 두려고 남겼다.
export const coarsePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
