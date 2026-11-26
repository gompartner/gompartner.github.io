// 11-26 작업(/works). 가상 브랜드 카탈로그를 내리고 곰파트너가 직접 만들어 지금 운영하는 것만 올린다.
// 사용자: "개수를 줄여서 실제 우리가 한 걸 보여 주는 게 맞나", 업종별 가상 화면은 신뢰도가 없어 보인다.
// 지인 작업(JUST.D 홈페이지, 현장 관리 앱)은 11-22 지인이 공개에 동의하지 않아 넣지 않는다.
// 그림은 실제 주소를 PC 1440, 휴대폰 390 폭으로 찍은 것(public/images/works).

export interface WorkCase {
  id: string;
  kind: string;
  name: string;
  href: string;
  /** 주소 표시용 */
  host: string;
  problem: string;
  made: string;
  now: string;
  pc: string;
  m: string;
  alt: string;
}

export const workCases: WorkCase[] = [
  {
    id: "site",
    kind: "홈페이지",
    name: "곰파트너 사이트",
    href: "/",
    host: "gompartner.co.kr",
    problem: "제작 비용을 알려면 상담부터 해야 하는 구조였습니다. 고객은 금액과 기간을 먼저 보고 싶어 합니다.",
    made: "종류나 상황을 고르면 만든 화면과 금액, 기간이 바로 나오는 판을 만들었습니다. 첫 화면은 글자와 부품이 조립되고 3D 마을을 끌어 돌려 볼 수 있습니다.",
    now: "174쪽을 운영합니다. 배포할 때마다 접근성과 검색 기본 설정, 문구 점검을 자동으로 거치고 하나라도 틀리면 올라가지 않습니다.",
    pc: "/images/works/site-pc.jpg",
    m: "/images/works/site-m.jpg",
    alt: "곰파트너 사이트 첫 화면. Build, Run, Care 제목과 3D 마을",
  },
  {
    id: "jangbu",
    kind: "업무 시스템",
    name: "거래장부",
    href: "https://jangbu.gompartner.co.kr/",
    host: "jangbu.gompartner.co.kr",
    problem: "거래명세서를 사진이나 메신저로 보내면 거래처가 받았는지 남지 않습니다. 외상 미수금은 장부에 따로 옮겨 적어야 합니다.",
    made: "가입 없이 명세서를 쓰고 링크로 보냅니다. 받는 쪽은 가입 없이 열어 지문이나 얼굴 인증으로 받았다고 확인합니다. 외상 거래처는 월 합계로 정리됩니다.",
    now: "휴대폰으로 체험 명세서를 직접 받아 수령 확인까지 해 볼 수 있습니다. PDF 저장과 거래처별 미수금 정리를 운영 중입니다. 곰파트너 3D 견적 화면에서 고른 구성도 견적서로 받습니다.",
    pc: "/images/works/jangbu-pc.jpg",
    m: "/images/works/jangbu-m.jpg",
    alt: "거래장부 첫 화면. 거래명세서 미리보기와 휴대폰 수령 확인 화면",
  },
  {
    id: "jikimi",
    kind: "운영 도구",
    name: "사이트 지킴이",
    href: "https://jikimi.gompartner.co.kr/",
    host: "jikimi.gompartner.co.kr",
    problem: "사이트가 멈추거나 SSL 인증서가 만료돼도 방문자가 알려 주기 전까지 모르는 경우가 많습니다.",
    made: "등록한 사이트의 응답과 응답 시간을 10분마다 점검합니다. SSL 인증서와 도메인 만료일을 추적해 만료 전에 단계별로 알립니다.",
    now: "사이트 3개까지 무료로 쓸 수 있습니다. 이용 신청을 하면 기기별 설치 안내를 메일로 받습니다.",
    pc: "/images/works/jikimi-pc.jpg",
    m: "/images/works/jikimi-m.jpg",
    alt: "사이트 지킴이 화면. SSL 인증서 만료 D-6 알림",
  },
  {
    id: "3d",
    kind: "3D 홈페이지",
    name: "3D 거실 상담 화면",
    href: "/3d/room/",
    host: "gompartner.co.kr/3d/room",
    problem: "인테리어와 가구 상담은 손님이 자기 집에 들어갈지 몰라 같은 질문을 반복하고, 실측을 다녀와도 계약으로 이어지지 않는 일이 잦습니다.",
    made: "손님이 거실 크기를 정하고 소파와 선반, 붙박이장을 직접 놓고 옮겨 보며 금액을 확인합니다. 고른 구성은 거래장부 견적서로 이어집니다.",
    now: "가구는 끌어 옮기고 손잡이로 크기를 바꾸며 서로 겹치지 않습니다. 바닥재와 벽 색까지 바꿔 보고 링크로 저장합니다.",
    pc: "/images/works/room-pc.jpg?v=11272",
    m: "/images/works/room-m.jpg?v=11272",
    alt: "3D 거실 상담 화면. 시스템 선반과 카우치 소파를 놓은 거실과 오른쪽 선택 패널",
  },
];
