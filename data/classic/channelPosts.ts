// ops/channel-posts.mjs 가 채널 RSS로 만든 파일. 직접 고치지 않는다.
export type ChannelSource = "naver" | "tistory" | "youtube";
export type ChannelPost = { source: ChannelSource; id: string; title: string; date: string; url: string; desc: string; tags: string[]; thumb?: string };
export const channelPosts: ChannelPost[] = [
  {
    "source": "youtube",
    "id": "ZmcN2qWTR8Q",
    "title": "넣은 적 없는 광고, 모르는 주소로 튕김 | 그누보드 운영 노하우 7편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=ZmcN2qWTR8Q",
    "desc": "그누보드 운영 노하우 7편, 넣은 적 없는 광고, 모르는 주소로 튕김. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 오늘 정리 1. 광고는 설정 칸부터 2. 튕김은 .htaccess부터 3. 원본과 통째 비교",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/ZmcN2qWTR8Q/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "yOvyQGsrLo8",
    "title": "느려진 사이트, 원인 찾는 순서 | 그누보드 운영 노하우 9편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=yOvyQGsrLo8",
    "desc": "그누보드 운영 노하우 9편, 느려진 사이트, 원인 찾는 순서. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 오늘 정리 1. 전부인가, 한 페이지인가 2. 개발자 도구로 느린 줄 찾기 3. 게시물과 용량 확인",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/yOvyQGsrLo8/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "wQn85pIymgA",
    "title": "같은 서버 이웃 사이트까지 털렸다면 | 그누보드 운영 노하우 6편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=wQn85pIymgA",
    "desc": "그누보드 운영 노하우 6편, 같은 서버 이웃 사이트까지 털렸다면. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 오늘 정리 1. 여러 사이트 동시면 업체에 먼저 2. 지우기 전에 남기기 3. 비밀번호는 깨끗한 컴퓨터에서",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/wQn85pIymgA/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "lccfZsXNiTk",
    "title": "넘겨받은 그누보드, 처음 30분에 볼 것 | 그누보드 운영 노하우 1편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=lccfZsXNiTk",
    "desc": "그누보드 운영 노하우 1편, 넘겨받은 그누보드, 처음 30분에 볼 것. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 넘겨받은 날 적어 둘 다섯 가지 1. 그누보드 버전 2. 서버와 PHP 버전 3. 최고관리자와 권한 10 계정",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/lccfZsXNiTk/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "KkA67jjoiFI",
    "title": "관리자 비밀번호를 바꿔도 또 들어온다 | 그누보드 운영 노하우 5편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=KkA67jjoiFI",
    "desc": "그누보드 운영 노하우 5편, 관리자 비밀번호를 바꿔도 또 들어온다. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 오늘 정리 1. 비밀번호는 앞문 열쇠 2. 권한 10과 빈 계정 확인 3. data 안 php 파일 4. 업데이트",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/KkA67jjoiFI/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "kiLbneR_Td0",
    "title": "PHP 서버가 AI 해킹에 17분 만에 뚫렸어요, 내 사이트 PHP 버전 1분 확인",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/shorts/kiLbneR_Td0",
    "desc": "11월 7일 MBC 뉴스데스크에 나온 AI 모의해킹 결과, PHP 서버가 17분 42초 만에 뚫렸습니다. 국내 서버의 85%가 아직 취약한 PHP를 쓴다고 합니다. 호스팅 관리 화면, 워드프레스 사이트 건강, 만든 업체에 한 줄 질문으로 내 사이트 PHP 버전을 확인하세요. 8.1 이하",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "PHP보안"
    ],
    "thumb": "https://i.ytimg.com/vi/kiLbneR_Td0/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "iV7i02i3va4",
    "title": "PHP 버전 올리는 순서 | 그누보드 운영 노하우 3편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=iV7i02i3va4",
    "desc": "그누보드 운영 노하우 3편, PHP 버전 올리는 순서. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 올리는 순서 1. 백업 받기 (2편) 2. 운영 서버를 복사한 시험 서버에 새 버전 3. 오류 기록에서 Fatal error ",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/iV7i02i3va4/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "I_WGrn6ZUXg",
    "title": "백업이 없으면 못 살립니다 | 그누보드 운영 노하우 2편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=I_WGrn6ZUXg",
    "desc": "그누보드 운영 노하우 2편, 백업이 없으면 못 살립니다. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 오늘 정리 1. DB와 data 폴더, 같은 날짜로 같이 받기 2. 받은 백업은 연습 서버에 되살려 보기 3. 넘겨받은 날 ",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/I_WGrn6ZUXg/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "a2PO1vtHAYg",
    "title": "업데이트 뒤 기능 하나가 안 될 때 | 그누보드 운영 노하우 4편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=a2PO1vtHAYg",
    "desc": "그누보드 운영 노하우 4편, 업데이트 뒤 기능 하나가 안 될 때. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 오늘 정리 1. 바꾸기 전에 백업 2. 추측 말고 오류 기록 한 줄 3. 본체는 한 버전으로 통째로",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/a2PO1vtHAYg/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "3gPu9SkceGg",
    "title": "매달 30분 점검표 | 그누보드 운영 노하우 10편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=3gPu9SkceGg",
    "desc": "그누보드 운영 노하우 10편, 매달 30분 점검표. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 매달 30분 점검표 1. 버전: 그누보드, PHP 버전 (1, 3편) 2. 백업: 이번 달 DB와 data 폴더 (2편) 3. 계",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/3gPu9SkceGg/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "-nX6Ka56NHs",
    "title": "스팸 봇, 하루 트래픽이 수백 배 | 그누보드 운영 노하우 8편",
    "date": "2026-11-09",
    "url": "https://www.youtube.com/watch?v=-nX6Ka56NHs",
    "desc": "그누보드 운영 노하우 8편, 스팸 봇, 하루 트래픽이 수백 배. 실제로 자주 올라오는 질문을 바탕으로 다시 꾸민 사례와, 연습 서버에서 직접 해 본 내용으로 설명합니다. 오늘 정리 1. 게시판 삭제는 마지막 수단 2. 권한, 캡챠, 단어, IP 순서 3. 트래픽 메일은 봇 신호",
    "tags": [
      "그누보드",
      "홈페이지관리"
    ],
    "thumb": "https://i.ytimg.com/vi/-nX6Ka56NHs/hqdefault.jpg"
  },
  {
    "source": "naver",
    "id": "224468687164",
    "title": "PHP 8.1 이하 홈페이지, 올리면 무엇이 깨질까요? 같은 코드를 세 버전에서 돌려 봤습니다",
    "date": "2026-11-08",
    "url": "https://blog.naver.com/gompartner/224468687164",
    "desc": "PHP 보안 경보 대응 기록 3편이에요. 1편: blog.naver.com/gompartner/224468362362 2편: blog.naver.com/gompartner/224468547004 10월 PHP 긴급 패치는 8.2 이상에만 나왔어요. 8.1 이하는 공식 패치가 없어서 버전",
    "tags": [
      "PHP업그레이드",
      "PHP버전",
      "PHP8",
      "그누보드",
      "영카트",
      "홈페이지유지보수",
      "PHP보안",
      "홈페이지오류"
    ]
  },
  {
    "source": "naver",
    "id": "224468547004",
    "title": "홈페이지 로그에 PHP 공격 흔적이 남을까요, 연습 서버에 직접 보내 봤습니다",
    "date": "2026-11-07",
    "url": "https://blog.naver.com/gompartner/224468547004",
    "desc": "PHP 보안 경보 대응 기록 2편이에요. 1편에서는 보안 설정을 바꿔도 재시작 전에는 그대로라는 걸 직접 재 봤어요. 1편: blog.naver.com/gompartner/224468362362 이번에는 그다음 질문이에요. \"패치 전에 이미 누가 들어왔으면 어떡하죠?\" 업체에 물어보면 ",
    "tags": [
      "PHP보안",
      "PHP2Shell",
      "서버로그",
      "해킹흔적",
      "홈페이지보안",
      "홈페이지유지보수",
      "아파치로그",
      "그누보드"
    ]
  },
  {
    "source": "naver",
    "id": "224468362362",
    "title": "PHP 보안 설정을 바꿨는데 그대로였어요, 재시작 전후를 직접 재 봤습니다",
    "date": "2026-11-07",
    "url": "https://blog.naver.com/gompartner/224468362362",
    "desc": "PHP 보안 경보 대응 기록 1편이에요. \"설정은 바꿔 두었습니다.\" 10월 PHP 보안 경보 뒤에 업체에서 이런 답을 받은 곳이 꽤 있을 거예요. 그런데 설정을 바꾼 것과 설정이 실제로 적용된 것은 다른 일이에요. 정말 그런지 직접 재 봤어요. 무엇을 시험했나요? 10월 21일 PHP",
    "tags": [
      "PHP보안",
      "PHP2Shell",
      "PHP업데이트",
      "홈페이지보안",
      "서버재시작",
      "보안조치확인",
      "홈페이지유지보수",
      "그누보드"
    ]
  },
  {
    "source": "naver",
    "id": "224468342585",
    "title": "아파치 보안 업데이트 권고, 우리 홈페이지도 해당될까",
    "date": "2026-11-07",
    "url": "https://blog.naver.com/gompartner/224468342585",
    "desc": "\"아파치 보안 업데이트 권고\" 11월 6일 KISA 보호나라에 올라온 공지 제목이에요. 홈페이지를 아파치 서버에 올려 두셨다는 말을 들은 적이 있다면 놀라실 수 있어요. 이번 공지의 대상은? 이번 공지는 아파치 웹서버가 아니라 Apache Juneau라는 프로그램 부품이에요. Junea",
    "tags": [
      "아파치",
      "아파치보안",
      "KISA보안공지",
      "홈페이지보안",
      "웹서버",
      "보안업데이트",
      "홈페이지유지보수",
      "보호나라"
    ]
  },
  {
    "source": "naver",
    "id": "224468339781",
    "title": "영카트 토스페이먼츠 쓰는 쇼핑몰, 5.6.47 업데이트 해야 할까",
    "date": "2026-11-07",
    "url": "https://blog.naver.com/gompartner/224468339781",
    "desc": "11월 6일, 그누보드 5.6.47이 나왔어요. 영카트로 쇼핑몰을 운영하고 결제를 토스페이먼츠로 받는다면 해당되는 업데이트예요. 무엇이 바뀌었나요? 토스페이먼츠가 결제마다 붙는 거래번호를 앞으로 최대 200자까지 늘린다고 안내했어요. 긴 번호를 쇼핑몰이 그대로 저장하게 고친 판이에요. ",
    "tags": [
      "영카트",
      "그누보드",
      "토스페이먼츠",
      "쇼핑몰업데이트",
      "결제취소",
      "가상계좌",
      "쇼핑몰유지보수",
      "홈페이지보안"
    ]
  },
  {
    "source": "youtube",
    "id": "f0oMCIl8dlU",
    "title": "홈페이지 메뉴, 태블릿으로 누르면 열리는지 30초 점검",
    "date": "2026-11-05",
    "url": "https://www.youtube.com/shorts/f0oMCIl8dlU",
    "desc": "태블릿으로 홈페이지 위 메뉴를 눌러 보세요. 아래 메뉴가 안 펼쳐지고 바로 넘어가면 손님이 오시는 길, 회사 소개를 못 찾습니다. 한 번 누르면 펼치고 한 번 더 누르면 이동하게 고쳐 달라고 하세요.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "태블릿메뉴"
    ],
    "thumb": "https://i.ytimg.com/vi/f0oMCIl8dlU/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "42",
    "title": "운전학원 홈페이지 제작기, 면허 탭을 누르면 취득 순서가 바뀐다",
    "date": "2026-11-04",
    "url": "https://gompartner.tistory.com/42",
    "desc": "퇴근하고 저녁 7시. 면허를 따려고 운전학원 사이트를 연다. 팝업이 서너 장 겹쳐 뜬다. 닫고 나면 배너 사진이 돌아간다. 알고 싶은 건 저녁에도 탈 수 있는지, 몇 시간 들으면 끝나는지다. 결국 대표번호를 누른다. 그 두 가지가 첫 화면에서 보이게, 1종 보통과 2종 보통, 2종 소형",
    "tags": [
      "카페&middot;가게",
      "곰파트너",
      "도로주행 시험 일정",
      "셔틀버스 노선",
      "운전전문학원 홈페이지 제작",
      "운전학원 홈페이지",
      "학원 홈페이지 제작"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/bxYo7Q/dJMcairOwtq/Abv9FO1yLY9U9hWKNndoMk/img.png"
  },
  {
    "source": "naver",
    "id": "224464251233",
    "title": "쇼핑몰 홈페이지 하단 사업자 정보, 무엇을 꼭 써야 할까",
    "date": "2026-11-04",
    "url": "https://blog.naver.com/gompartner/224464251233",
    "desc": "처음 보는 쇼핑몰에서 3만 원짜리 그릇을 사기 전에 손님은 맨 아래로 내려가요. 사업자 정보가 있는지 보려고요. 거기가 비어 있으면 결제 전에 창을 닫습니다. 법으로도 꼭 써야 하는 자리예요. 무엇을 써야 하나요? 전자상거래법이 정한 것은 여덟 가지예요. 법은 첫 화면에 두라고 해요. ",
    "tags": [
      "쇼핑몰사업자정보",
      "통신판매업신고번호",
      "전자상거래법",
      "쇼핑몰하단표시",
      "사업자정보확인",
      "호스팅서비스제공자",
      "쇼핑몰과태료",
      "쇼핑몰이용약관"
    ]
  },
  {
    "source": "youtube",
    "id": "GrGnkDDpPvA",
    "title": "거래처가 \"입금 계좌 바뀌었어요\" 문자를 보내면, 보내기 전에 할 일",
    "date": "2026-11-03",
    "url": "https://www.youtube.com/shorts/GrGnkDDpPvA",
    "desc": "직원 계정 하나가 털려 손님과 거래처 정보가 나간 사고(2026-10-30 공지). 이런 일 뒤엔 배송 사칭 문자와 계좌 변경 사기가 따라옵니다. 원래 알던 번호로 전화해 확인하고, 직원 계정은 사람마다 따로 쓰세요.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "계좌변경사기"
    ],
    "thumb": "https://i.ytimg.com/vi/GrGnkDDpPvA/hqdefault.jpg"
  },
  {
    "source": "naver",
    "id": "224457488350",
    "title": "우리 홈페이지 문제 있는지 1분 안에 확인하는 법, 주소만 넣으면 끝",
    "date": "2026-10-31",
    "url": "https://blog.naver.com/gompartner/224457488350",
    "desc": "쇼핑몰 솔루션 회사 홈페이지 한 곳을 넣어 봤어요. 결과는 급함 0, 주의 3, 양호 5. 겉으로는 멀쩡한 사이트였는데 주의 세 개가 나왔어요. 휴대폰 확대 막힘, 기본 보안 설정 빠짐, 그리고 쓰는 솔루션 지원 상태. 무엇을 보나요 홈페이지 주소를 넣으면 손님이 보는 첫 화면을 한 번",
    "tags": [
      "홈페이지점검",
      "홈페이지진단",
      "홈페이지보안",
      "홈페이지속도",
      "반응형확인",
      "검색노출확인",
      "홈페이지유지보수",
      "무료점검도구"
    ]
  },
  {
    "source": "youtube",
    "id": "rflYU0PlM_U",
    "title": "사진 때문에 느린 홈페이지, 휴대폰에서 바로 뜨게 고친 방법",
    "date": "2026-10-30",
    "url": "https://www.youtube.com/shorts/rflYU0PlM_U",
    "desc": "찍은 그대로의 사진(3648x2736, 4,482KB)을 1200x900으로 줄이고 WebP로 바꾸니 282KB가 됐어요. 첫 화면 밖 사진은 내려갈 때 불러오게 했어요. 사진: Wikimedia Commons \"A shot of bouquets in a shop\" (CC BY-SA 3",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "홈페이지속도"
    ],
    "thumb": "https://i.ytimg.com/vi/rflYU0PlM_U/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "41",
    "title": "조명 가게 홈페이지 제작기, 사진 속 조명을 누르면 그 제품이 나온다",
    "date": "2026-10-30",
    "url": "https://gompartner.tistory.com/41",
    "desc": "거실 사진 한 장을 캡처해 둔 손님이 있다. \"이 소파 옆 스탠드 어디 거예요?\" 매장에 전화하면 펜던트인지 장스탠드인지부터 다시 설명해야 한다. 사진 속 조명을 누르면 같은 모양 제품이 나오게, 설치 시공까지 하는 조명 매장으로 샘플을 만들었다. 데모 주소: gompartner.co.",
    "tags": [
      "카페&middot;가게",
      "곰파트너",
      "색온도 고르기",
      "인테리어 조명",
      "조명 가게 홈페이지",
      "조명 매장 홈페이지 제작",
      "조명 시공"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/dMHP2E/dJMcadYlqlm/cRsP7Bp6Hegyk8OQ3mUCaK/img.png"
  },
  {
    "source": "naver",
    "id": "224457513083",
    "title": "동물병원 진료비 게시, 홈페이지에는 무엇을 어디에 올려야 할까",
    "date": "2026-10-30",
    "url": "https://blog.naver.com/gompartner/224457513083",
    "desc": "결론부터요. 홈페이지가 있는 동물병원은 병원 안과 홈페이지 두 곳에 진료비를 올려야 해요. 둘 중 한 곳만 하면 되던 때가 있었는데 지금은 둘 다입니다. 올려야 하는 항목은 몇 개일까요? 처음엔 11개였어요. 지난해 20개 넘는 항목으로 늘었습니다. 전해질 검사처럼 새로 들어온 것도 있",
    "tags": [
      "동물병원진료비게시",
      "동물병원홈페이지",
      "진료비게시의무",
      "수의사법",
      "동물병원과태료",
      "동물진료비공개",
      "동물병원운영",
      "진료비안내"
    ]
  },
  {
    "source": "naver",
    "id": "224449585635",
    "title": "사진 때문에 느린 홈페이지, 휴대폰에서 바로 뜨게 고치는 방법",
    "date": "2026-10-30",
    "url": "https://blog.naver.com/gompartner/224449585635",
    "desc": "카메라로 찍은 사진을 그대로 올리던 때가 있었어요. 다들 PC로 봤으니 괜찮았죠. 지금은 휴대폰 데이터로 여는 손님이 많습니다. 사진이 무거우면 첫 화면이 늦게 떠요. 꽃다발 사진 한 장으로 재 봤어요 원본은 3648x2736, 4,482KB. 디지털카메라로 찍은 그대로예요. 홈페이지 ",
    "tags": [
      "홈페이지속도",
      "이미지용량줄이기",
      "WebP변환",
      "사진용량",
      "모바일속도",
      "홈페이지느림",
      "이미지최적화",
      "꽃집홈페이지"
    ]
  },
  {
    "source": "youtube",
    "id": "TaJeUFTyRTY",
    "title": "홈페이지 제작 견적서, 총액보다 먼저 볼 3줄",
    "date": "2026-10-29",
    "url": "https://www.youtube.com/shorts/TaJeUFTyRTY",
    "desc": "도메인과 서버 명의, 완성 후 원본 파일과 관리자 계정, 수정 횟수. 견적서에 없으면 계약 전에 적어 달라고 하세요.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "홈페이지제작"
    ],
    "thumb": "https://i.ytimg.com/vi/TaJeUFTyRTY/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "40",
    "title": "소스 OEM 홈페이지 제작기, 공정 사진 다섯 칸과 포장별 최소 수량",
    "date": "2026-10-29",
    "url": "https://gompartner.tistory.com/40",
    "desc": "매장에서 끓이던 소스를 병에 담아 팔고 싶다. 제조 공장 사이트를 몇 군데 열어 본다. 인증서 사진과 회사 연혁이 먼저 나온다. 궁금한 건 따로 있다. \"몇 개부터 만들어 줘요?\" \"디핑컵도 돼요?\" 그 답이 첫 화면과 바로 아래에서 나오게, HACCP 인증을 받은 소스 공장으로 샘플을",
    "tags": [
      "기업",
      "곰파트너",
      "소스 OEM",
      "식품 OEM 홈페이지",
      "식품 제조 홈페이지",
      "제조업 홈페이지 제작",
      "최소 주문 수량"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/9yJsV/dJMcackJMNX/P80xKSiC8yPJ8YgaGGxAXk/img.png"
  },
  {
    "source": "naver",
    "id": "224449584791",
    "title": "홈페이지 제작 견적서, 총액보다 먼저 볼 3줄",
    "date": "2026-10-29",
    "url": "https://blog.naver.com/gompartner/224449584791",
    "desc": "총액보다 먼저 찾을 줄은 세 개예요. 도메인 명의, 원본 파일, 수정 횟수. 셋 다 계약 뒤엔 바꾸기 어렵습니다. 견적서에 없으면 계약 전에 적어 달라고 하세요. 도메인과 서버, 누구 명의인가요 도메인은 주소, 서버(호스팅)는 홈페이지를 두는 곳이에요. 업체가 대신 사 주면서 업체 명의",
    "tags": [
      "홈페이지제작견적",
      "홈페이지견적서",
      "도메인명의",
      "호스팅명의",
      "원본파일",
      "수정횟수",
      "홈페이지계약",
      "홈페이지제작비용"
    ]
  },
  {
    "source": "youtube",
    "id": "Q3967oDTDw4",
    "title": "매일 같은 문의 답장, AI로 자주 묻는 질문 10개 만드는 부탁 문장",
    "date": "2026-10-28",
    "url": "https://www.youtube.com/shorts/Q3967oDTDw4",
    "desc": "부탁 문장: 이 문의들을 자주 묻는 질문 10개로 묶어 줘. 많이 나온 순서로, 답은 두 문장씩. 주차, 가격 같은 사실은 먼저 알려 주세요.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "자주묻는질문"
    ],
    "thumb": "https://i.ytimg.com/vi/Q3967oDTDw4/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "39",
    "title": "노무법인 홈페이지 제작기, 사업주와 근로자 입구를 첫 화면에서 나눴다",
    "date": "2026-10-28",
    "url": "https://gompartner.tistory.com/39",
    "desc": "해고 통지서를 받은 지 3주가 지났다. 노무법인 사이트를 여니 저울 사진과 인사말이 먼저 나온다. 궁금한 건 하나다. 아직 늦지 않았나. 같은 사이트에 직원 열두 명 회사 대표도 들어온다. 이쪽은 월 자문을 찾는다. 두 사람이 첫 화면에서 각자 갈 길로 가게, 노무법인으로 샘플을 만들었",
    "tags": [
      "전문직&middot;부동산",
      "곰파트너",
      "공인노무사 사무소 홈페이지",
      "노무법인 홈페이지 제작",
      "노무사 홈페이지",
      "부당해고 구제신청 기한",
      "전문직 홈페이지 제작"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/bAGHdy/dJMcaf9t6g6/2lfnkkkms0P9wO7ML7I341/img.png"
  },
  {
    "source": "naver",
    "id": "224449583990",
    "title": "매일 같은 문의 답장, AI로 자주 묻는 질문 10개 만드는 부탁 문장",
    "date": "2026-10-28",
    "url": "https://blog.naver.com/gompartner/224449583990",
    "desc": "주차 돼요? 체험은 얼마예요? 토요일에도 수업 있어요? 가게를 하면 같은 질문에 하루에도 몇 번씩 답하죠. 한 번 정리해 두면 답장이 줄어요. 정리는 AI에게 맡겨도 됩니다. 준비물은 지난달 문의 30개 카톡이나 문자로 받은 문의를 한 달 치 복사해요. ChatGPT나 Claude 같은",
    "tags": [
      "자주묻는질문",
      "FAQ만들기",
      "챗GPT활용",
      "카톡채널자동응답",
      "문의답장",
      "가게운영",
      "필라테스",
      "사장님AI"
    ]
  },
  {
    "source": "youtube",
    "id": "E16R7NEFKwM",
    "title": "홈페이지 문의 폼, 보낸 문의가 정말 도착하는지 30초 점검",
    "date": "2026-10-27",
    "url": "https://www.youtube.com/shorts/E16R7NEFKwM",
    "desc": "이름에 시험이라고 쓰고 문의를 보내 보세요. 5분 안에 메일이나 문자로 와야 정상이에요. 안 오면 스팸함, 받는 메일 주소를 확인하세요.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "문의폼"
    ],
    "thumb": "https://i.ytimg.com/vi/E16R7NEFKwM/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "38",
    "title": "소아청소년과 홈페이지 제작기, 사진 대신 오늘 진료판을 첫 화면에",
    "date": "2026-10-27",
    "url": "https://gompartner.tistory.com/38",
    "desc": "아침에 열이 오른 아이를 안고 소아과 사이트를 연다. \"지금 가면 얼마나 기다려요?\" \"오후 진료 몇 시까지 받아요?\" 알고 싶은 건 그 두 가지인데 첫 화면엔 웃는 아이 사진뿐이다. 결국 전화를 건다. 데스크는 이미 다른 전화를 받고 있다. 이 두 질문이 첫 화면에서 끝나게 동네 소아",
    "tags": [
      "병원&middot;약국",
      "곰파트너",
      "병원 홈페이지 제작",
      "소아과 홈페이지 제작",
      "소아청소년과 홈페이지",
      "영유아검진",
      "예방접종 일정"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/chWpOZ/dJMcaa1ymx5/hSkqsIJmSKrTwyxCndBsF1/img.png"
  },
  {
    "source": "naver",
    "id": "224454951990",
    "title": "홈페이지 PHP 버전 확인하는 법, 10월 21일 긴급 패치 뒤에 할 일",
    "date": "2026-10-27",
    "url": "https://blog.naver.com/gompartner/224454951990",
    "desc": "약 75%. 언어를 알 수 있는 웹사이트 가운데 PHP로 만든 곳의 비율이에요. 10월 21일, 이 PHP에 긴급 보안 패치가 나왔습니다. 워드프레스와 그누보드도 PHP로 돌아가요. 이번 허점은 뭐가 다른가요? 로그인하지 않은 사람이 밖에서 서버에 명령을 내릴 수 있는 허점 두 건이에요",
    "tags": [
      "PHP보안패치",
      "PHP버전확인",
      "PHP업데이트",
      "홈페이지보안",
      "워드프레스보안",
      "그누보드",
      "홈페이지호스팅",
      "홈페이지해킹"
    ]
  },
  {
    "source": "naver",
    "id": "224450823499",
    "title": "홈페이지 문의 폼, 보낸 문의가 정말 도착하는지 30초 점검",
    "date": "2026-10-27",
    "url": "https://blog.naver.com/gompartner/224450823499",
    "desc": "손님이 견적 문의를 쓰고 보내기를 눌렀어요. \"접수되었습니다\" 화면도 봤고요. 사장님 메일함은 그날도 비어 있습니다. 우리 홈페이지에도 이런 일이 있는지, 30초면 확인할 수 있어요. \"시험\"이라고 쓰고 보내기 휴대폰으로 문의 폼을 열어요. 이름 칸에 \"시험\", 나머지는 아무 값이나 넣",
    "tags": [
      "홈페이지문의폼",
      "견적문의",
      "문의메일",
      "문의안옴",
      "스팸메일함",
      "홈페이지점검",
      "메일주소변경",
      "홈페이지관리"
    ]
  },
  {
    "source": "youtube",
    "id": "XVRQTyR9OFw",
    "title": "홈페이지 맡긴 업체가 해킹되면 우리 손님 정보도 나갈까",
    "date": "2026-10-26",
    "url": "https://www.youtube.com/shorts/XVRQTyR9OFw",
    "desc": "업체 한 곳이 뚫려 맡긴 20여 곳의 회원 정보가 같이 유출된 사건(2026-10-13 보도). 안 쓰는 회원 정보 지우기, 문자 발송 계정 비밀번호 바꾸기, 사고 연락 조항 확인.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "개인정보유출"
    ],
    "thumb": "https://i.ytimg.com/vi/XVRQTyR9OFw/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "37",
    "title": "로스터리 홈페이지 제작기, 이번 주 볶은 원두를 첫 화면 표로",
    "date": "2026-10-26",
    "url": "https://gompartner.tistory.com/37",
    "desc": "\"이번 주엔 뭐 볶았어요?\" \"예가체프는 언제 볶은 거예요?\" 원두를 사는 사람은 맛만큼 날짜를 본다. 그런데 로스터리 사이트를 열면 큰 사진이 먼저다. 날짜는 상품 상세까지 들어가야 나온다. 화요일과 금요일에 볶아 다음 날 보내는 로스터리로 샘플을 만들었다. 데모 주소: gompart",
    "tags": [
      "카페&middot;가게",
      "곰파트너",
      "로스터리 홈페이지 제작",
      "원두 쇼핑몰",
      "원두 정기구독",
      "카페 홈페이지 제작",
      "커피 홈페이지"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/dUWrCq/dJMcaggm85Q/QuNGLLHfqS7jC1yaYpKx8K/img.png"
  },
  {
    "source": "naver",
    "id": "224450820715",
    "title": "홈페이지 맡긴 업체가 해킹되면, 우리 회원 정보도 같이 나갈까",
    "date": "2026-10-26",
    "url": "https://blog.naver.com/gompartner/224450820715",
    "desc": "약 237만 건. 10월 13일 보도에 나온 개인정보 유출 신고 건수예요. 교육 사이트 운영을 여러 곳에서 맡은 업체 서버 하나가 뚫렸습니다. 그 업체에 맡긴 20여 곳의 회원 정보가 같이 나갔어요. 왜 맡긴 곳이 다 같이 위험해지나요? 작은 업체는 여러 고객 홈페이지를 서버 한 대에 ",
    "tags": [
      "홈페이지해킹",
      "개인정보유출",
      "회원정보유출",
      "홈페이지보안",
      "유지보수업체",
      "문자발송계정",
      "관리자비밀번호",
      "홈페이지관리"
    ]
  },
  {
    "source": "tistory",
    "id": "36",
    "title": "홈페이지 오류 수정 접수 제작기, 금액 동의 전에는 손대지 않는다",
    "date": "2026-10-25",
    "url": "https://gompartner.tistory.com/36",
    "desc": "광고는 돌고 있는데 버튼이 안 눌린다. 홈페이지 주인에게 제일 다급한 날이다. 광고비는 나가고 예약은 안 들어온다. 가상의 꽃집 홈페이지로 그런 날 하루를 그렸다. 접수부터 보고서까지 한 페이지에 순서대로 이어 붙인 샘플이다. 데모 주소: gompartner.co.kr/demo/main",
    "tags": [
      "유지보수",
      "곰파트너",
      "모바일 버튼 안 눌림",
      "홈페이지 수리",
      "홈페이지 오류 수정",
      "홈페이지 유지보수",
      "홈페이지 유지보수 비용"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/yuqML/dJMcacZoM6z/JAyfffap2LHq8h3ER5c6B0/img.png"
  },
  {
    "source": "tistory",
    "id": "35",
    "title": "원데이 클래스 랜딩페이지 제작기, 남은 자리가 0이면 대기 신청으로",
    "date": "2026-10-24",
    "url": "https://gompartner.tistory.com/35",
    "desc": "폼 하나, 통장 하나, 카톡 하나. 수강생이 토요일 수업 자리 하나를 잡는 데 세 군데를 거친다. 입금을 했는데 확인 답이 없어 다시 묻는 일도 생긴다. 가죽 공방 카드지갑 클래스로 이걸 한 페이지에 모은 샘플을 만들었다. 데모 주소: gompartner.co.kr/demo/landin",
    "tags": [
      "랜딩페이지",
      "곰파트너",
      "공방 수업 신청 페이지",
      "랜딩페이지 제작",
      "랜딩페이지 제작 견적",
      "원데이 클래스 랜딩페이지",
      "클래스 예약 페이지"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/c1RYj5/dJMb999kiLP/RkfgFNXHkNODfESfqMeXlk/img.png"
  },
  {
    "source": "youtube",
    "id": "jGCc3IlGcg4",
    "title": "PC 화면 그대로 줄인 홈페이지, 휴대폰에서 이렇게 고쳐요",
    "date": "2026-10-23",
    "url": "https://www.youtube.com/shorts/jGCc3IlGcg4",
    "desc": "휴대폰 화면 기준: 본문 글자 16px 이상, 버튼 높이 44px 이상, 옆으로 밀리는 화면 없음.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "모바일홈페이지"
    ],
    "thumb": "https://i.ytimg.com/vi/jGCc3IlGcg4/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "34",
    "title": "북페어 랜딩페이지 제작기, 장르를 고르면 부스 지도가 칠해진다",
    "date": "2026-10-23",
    "url": "https://gompartner.tistory.com/34",
    "desc": "토요일 11시, 창고 2층으로 오르는 계단에 줄이 선다. 들어가서는 종이 지도를 들고 부스 번호를 찾는다. 줄 서기와 셀러 찾기, 이 둘을 페이지 안에서 끝내고 싶었다. 셀러 24팀이 이틀 동안 여는 독립출판 북페어로 샘플을 만들었다. 데모 주소: gompartner.co.kr/demo",
    "tags": [
      "랜딩페이지",
      "곰파트너",
      "독립출판",
      "랜딩페이지 제작",
      "부스 지도",
      "북페어 사전등록",
      "행사 사전등록 페이지"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/LgS8t/dJMcagtT3A3/TdumGK24jDbBMhnHr75Rfk/img.png"
  },
  {
    "source": "naver",
    "id": "224449581382",
    "title": "휴대폰에서 글자가 작은 홈페이지, 반응형으로 고칠 때 보는 기준 3가지",
    "date": "2026-10-23",
    "url": "https://blog.naver.com/gompartner/224449581382",
    "desc": "10여 년 전에 만든 홈페이지라면 대부분 PC 화면 기준이에요. 휴대폰으로 열면 그 화면이 그대로 작아져서 보입니다. 글자가 아주 작아요. 그때는 다들 손가락으로 벌려 읽었죠. 지금은 휴대폰으로 먼저 들어오는 손님이 많아요. 고치기 전과 후 왼쪽은 PC 화면을 그대로 줄인 펜션 홈페이지",
    "tags": [
      "반응형홈페이지",
      "모바일홈페이지",
      "홈페이지글자크기",
      "모바일최적화",
      "버튼크기",
      "휴대폰화면",
      "홈페이지리뉴얼",
      "펜션홈페이지"
    ]
  },
  {
    "source": "naver",
    "id": "224449580477",
    "title": "상호 검색하면 우리 가게는 무엇이 나올까, 휴대폰으로 5분 점검",
    "date": "2026-10-23",
    "url": "https://blog.naver.com/gompartner/224449580477",
    "desc": "휴대폰 하나로 5분이면 끝나요. 우리 가게 상호 검색 화면 점검. 지난 글의 스포츠센터 이야기를 이어서 써요. 그곳의 네이버 첫 화면은 플레이스, 인스타그램, 클립, 후기로 차 있었어요. 전부 업체가 올렸거나 손님이 남긴 것들이죠. 그래서 홈페이지가 고장 나 있어도 검색 화면은 멀쩡해 ",
    "tags": [
      "상호검색",
      "네이버플레이스",
      "스마트플레이스",
      "구글비즈니스프로필",
      "가게전화번호",
      "플레이스리뷰",
      "가게홈페이지점검"
    ]
  },
  {
    "source": "youtube",
    "id": "3Wdp42zFu6Q",
    "title": "홈페이지 유지보수 견적서, 금액보다 먼저 볼 5가지",
    "date": "2026-10-22",
    "url": "https://www.youtube.com/shorts/3Wdp42zFu6Q",
    "desc": "서버와 도메인 비용 포함 여부, 수정 횟수와 범위, 고장 대응 시간, 백업, 안 쓴 달 요금.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "유지보수"
    ],
    "thumb": "https://i.ytimg.com/vi/3Wdp42zFu6Q/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "33",
    "title": "팝업스토어 랜딩페이지 제작기, 영수증 화면에서 회차를 발권한다",
    "date": "2026-10-22",
    "url": "https://gompartner.tistory.com/33",
    "desc": "팝업 오픈 전날 밤 인스타에 예약 링크를 올린다. 다음 날 아침 DM이 쌓인다. \"몇 시 회차 남았어요?\", \"현장 가면 줄 서나요?\" 답하는 사이 자리는 또 바뀐다. 이 질문이 페이지 안에서 끝나게, 성수에서 7일만 여는 붕어빵 팝업으로 샘플을 만들었다. 데모 주소: gompartne",
    "tags": [
      "랜딩페이지",
      "곰파트너",
      "랜딩페이지 제작",
      "사전예약 페이지",
      "팝업스토어 랜딩페이지",
      "현장 웨이팅",
      "회차 예약"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/uLN9D/dJMcaatLrMs/Kbdvk3WLQn4uJVZyRwkoZK/img.png"
  },
  {
    "source": "naver",
    "id": "224449579036",
    "title": "홈페이지 유지보수 견적서, 월 금액보다 먼저 볼 5가지",
    "date": "2026-10-22",
    "url": "https://blog.naver.com/gompartner/224449579036",
    "desc": "월 금액이 같은 견적서 두 장. 1년 뒤 낸 돈은 다를 수 있어요. \"월 유지보수\"라는 이름은 같아도 안에 든 게 업체마다 달라서예요. 서버비가 들어간 곳도, 별도인 곳도 있죠. 두 장을 놓고 아래 다섯 가지만 비교해 보세요. 서버와 도메인, 포함인가요 별도인가요 유지보수비와 서버비는 ",
    "tags": [
      "홈페이지유지보수",
      "유지보수견적",
      "유지보수계약",
      "홈페이지관리비",
      "유지보수범위",
      "홈페이지백업",
      "웹호스팅비용",
      "도메인연장비용"
    ]
  },
  {
    "source": "naver",
    "id": "224449576702",
    "title": "홈페이지에 \"연결이 비공개로 설정되어 있지 않습니다\" 경고가 뜰 때 확인할 것",
    "date": "2026-10-22",
    "url": "https://blog.naver.com/gompartner/224449576702",
    "desc": "도심의 한 스포츠센터를 네이버에서 검색한 적이 있어요. 첫 화면은 잘 관리되고 있었어요. 플레이스 사진은 최근 것, 인스타그램과 클립 영상, 꾸준히 올라오는 후기까지. 홈페이지를 누르자 빨간 경고 화면이 떴어요. 연결이 비공개로 설정되어 있지 않습니다. 열어 본 인증서 만료일은 2년 전",
    "tags": [
      "연결이비공개로설정되어있지않습니다",
      "홈페이지보안경고",
      "SSL인증서만료",
      "https인증서",
      "인증서만료일",
      "무료SSL",
      "홈페이지유지보수"
    ]
  },
  {
    "source": "youtube",
    "id": "uOmBaahf1ns",
    "title": "한옥 찻집 골목에서 길 잃은 손님, 전화 말고 방법 없을까",
    "date": "2026-10-21",
    "url": "https://www.youtube.com/shorts/uOmBaahf1ns",
    "desc": "평면도에서 방을 고르고 날짜와 시간을 눌러 예약해요. 골목길은 순서대로 그림으로 알려 줘서 파란 대문까지 바로 와요.",
    "tags": [
      "홈페이지제작",
      "소상공인홈페이지",
      "한옥카페",
      "찻집",
      "카페홈페이지"
    ],
    "thumb": "https://i.ytimg.com/vi/uOmBaahf1ns/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "7MSILHqBlGk",
    "title": "리뷰 답글 10개를 3분 만에 쓰는 AI 부탁 문장",
    "date": "2026-10-21",
    "url": "https://www.youtube.com/shorts/7MSILHqBlGk",
    "desc": "부탁 문장: 리뷰마다 답글을 써 줘. 사장님 말투로 두 문장, 리뷰에 나온 메뉴 이름을 넣어 줘. 불만 리뷰는 사과로 시작하고 변명은 쓰지 마.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "리뷰답글"
    ],
    "thumb": "https://i.ytimg.com/vi/7MSILHqBlGk/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "32",
    "title": "입주청소 랜딩페이지 제작기, 평수를 넣으면 금액이 나오는 견적 계산기",
    "date": "2026-10-21",
    "url": "https://gompartner.tistory.com/32",
    "desc": "\"32평 아파트인데 얼마예요?\" 입주청소 광고를 누른 사람이 제일 먼저 묻는 말이다. 전화로 묻기 전에 화면에서 답이 나오면 된다. 입주와 이사 청소 업체로 잡고, 계산기를 첫 화면에 올린 샘플을 만들었다. 데모 주소: gompartner.co.kr/demo/landing-move-cl",
    "tags": [
      "랜딩페이지",
      "견적 계산기",
      "곰파트너",
      "랜딩페이지 제작",
      "이사청소 견적",
      "입주청소 견적",
      "입주청소 랜딩페이지"
    ],
    "thumb": "https://blog.kakaocdn.net/dn/cJWzFn/dJMcackHl59/8vBCcms9fhEu57PcrIk7dk/img.png"
  },
  {
    "source": "naver",
    "id": "224444433777",
    "title": "리뷰 답글 AI로 쓰는 법, 10개를 3분에 끝내는 부탁 문장",
    "date": "2026-10-21",
    "url": "https://blog.naver.com/gompartner/224444433777",
    "desc": "10개에 한 시간, 아니면 3분. 리뷰 답글을 하나씩 쓸 때와 AI에 초안을 맡길 때의 차이예요. 하루만 미뤄도 금방 쌓이죠. 같은 말을 계속 쓰다 보면 답글끼리 다 비슷해지고요. 대신 AI는 부탁하는 문장이 결과를 거의 다 정해요. 순서대로 따라 해 보세요. 리뷰 10개 복사해서 붙여",
    "tags": [
      "리뷰답글",
      "리뷰답글예시",
      "AI리뷰답글",
      "챗GPT리뷰답글",
      "사장님답글",
      "배달앱리뷰",
      "플레이스리뷰",
      "악성리뷰대응"
    ]
  },
  {
    "source": "naver",
    "id": "224439108585",
    "title": "가게 QR코드 만드는 법, 메뉴판과 전단지에 넣을 때 주의할 것",
    "date": "2026-10-21",
    "url": "https://blog.naver.com/gompartner/224439108585",
    "desc": "셀 4개. QR코드 둘레에 비워 둘 최소 여백이에요. QR은 무료 도구로 금방 만들어요. 어려운 건 인쇄했을 때 잘 찍히게 하는 거예요. 아래 순서는 QR코드를 만든 덴소웨이브의 안내를 바탕으로 했어요. 주소는 짧게 QR코드는 작은 네모 칸, 셀로 이뤄져 있어요. 담는 글자가 많을수록 ",
    "tags": [
      "가게QR코드",
      "QR코드만들기",
      "메뉴판QR코드",
      "전단지QR코드",
      "QR코드인쇄크기",
      "QR코드여백",
      "QR코드유효기간",
      "와이파이QR코드"
    ]
  },
  {
    "source": "youtube",
    "id": "OVKLfJbIHmI",
    "title": "우리 홈페이지 주소창에 주의 요함이 뜬다면",
    "date": "2026-10-20",
    "url": "https://www.youtube.com/shorts/OVKLfJbIHmI",
    "desc": "크롬은 주의 요함, 사파리는 안전하지 않음으로 보여요. SSL 인증서가 없거나 기한이 끝난 경우예요.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "SSL인증서"
    ],
    "thumb": "https://i.ytimg.com/vi/OVKLfJbIHmI/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "jp2LNlSDH24",
    "title": "수업 50분 동안 메시지 여덟 개, 답장은 언제 할까",
    "date": "2026-10-20",
    "url": "https://www.youtube.com/shorts/jp2LNlSDH24",
    "desc": "요일과 난이도를 고르면 빈자리 수업이 나오고 바로 체험 신청해요. 질문 세 개에 답하면 몸에 맞는 레슨도 추천해 줘요.",
    "tags": [
      "홈페이지제작",
      "소상공인홈페이지",
      "필라테스",
      "필라테스홈페이지",
      "체험레슨"
    ],
    "thumb": "https://i.ytimg.com/vi/jp2LNlSDH24/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "31",
    "title": "코딩 교실 특강 랜딩페이지 제작기, 남은 자리와 마감일을 첫 화면에",
    "date": "2026-10-20",
    "url": "https://gompartner.tistory.com/31",
    "desc": "\"초3인데 게임 만들기반 들을 수 있어요?\"\"자리 남았어요? 마감이 언제예요?\" 방학 특강 모집 때 학원 전화와 카톡에 오는 말이다. 답을 첫 화면에 두려고, 어린이 코딩 교실의 겨울방학 특강 모집 페이지를 샘플로 만들었다. 데모 주소: gompartner. co. kr/demo/lan",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcH8MiL%2FdJMcaiZmi0R%2FAAAAAAAAAAAAAAAAAAAAAFb2wq7pQLk025AL5Dc7hZXwTwwTZjZa7hFCWDyLT7zP%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DPNWOHWAHqZboafClsf593VcgCW0%253D"
  },
  {
    "source": "naver",
    "id": "224444433190",
    "title": "우리 홈페이지 주소창에 주의 요함이 뜬다면, 휴대폰 30초 점검",
    "date": "2026-10-20",
    "url": "https://blog.naver.com/gompartner/224444433190",
    "desc": "우리 홈페이지 주소창, 마지막으로 본 게 언제인가요? 지금 휴대폰으로 열어 보세요. 볼 곳은 맨 위 주소창 하나. 주소 앞에 무엇이 붙어 있는지만 보면 돼요. 주소창이 보여 주는 세 가지 주소만 깔끔하거나 작은 아이콘만 정상이에요. 할 일 없어요. 주소 앞에 '주의 요함' 크롬은 '주의",
    "tags": [
      "주의요함",
      "안전하지않음",
      "주소창경고",
      "크롬주의요함",
      "SSL인증서",
      "https",
      "홈페이지점검",
      "홈페이지보안"
    ]
  },
  {
    "source": "naver",
    "id": "224439107126",
    "title": "내 가게 홈페이지가 네이버 검색에 안 나올 때 확인할 것",
    "date": "2026-10-20",
    "url": "https://blog.naver.com/gompartner/224439107126",
    "desc": "새 홈페이지를 열고 네이버에 상호를 쳐 봅니다. 그런데 아무것도 안 나와요. 네이버는 검색로봇이 사이트를 찾아와 읽어 가야 결과에 올려요. 어디서 막혔는지 아래 네 가지로 찾아봐요. 네이버 서치어드바이저 웹마스터 가이드를 기준으로 했어요. 등록과 소유확인 서치어드바이저에 사이트 등록 웹",
    "tags": [
      "네이버검색안나옴",
      "홈페이지네이버등록",
      "네이버서치어드바이저",
      "사이트소유확인",
      "사이트맵제출",
      "검색반영기간",
      "홈페이지제목설명"
    ]
  },
  {
    "source": "youtube",
    "id": "kVjWn_kKNGY",
    "title": "도메인 연장 하나 놓쳐서 홈페이지가 도박 사이트가 된 이유",
    "date": "2026-10-19",
    "url": "https://www.youtube.com/shorts/kVjWn_kKNGY",
    "desc": "도메인 만료일은 도메인을 산 곳의 내 도메인 목록에서 볼 수 있어요. 자동 연장과 결제 카드 유효기간을 같이 확인하세요.",
    "tags": [
      "사장님IT",
      "홈페이지관리",
      "도메인만료"
    ],
    "thumb": "https://i.ytimg.com/vi/kVjWn_kKNGY/hqdefault.jpg"
  },
  {
    "source": "youtube",
    "id": "BVV4SLZrxZU",
    "title": "밤 10시 40분 학부모 전화, 오늘 열한 번째",
    "date": "2026-10-19",
    "url": "https://www.youtube.com/shorts/BVV4SLZrxZU",
    "desc": "학년과 점수만 고르면 맞는 반과 시간표가 바로 나와요. 한 달 교습비도 눌러서 계산하니 같은 질문 전화가 줄어요.",
    "tags": [
      "홈페이지제작",
      "소상공인홈페이지",
      "학원홈페이지",
      "수학학원",
      "영어학원"
    ],
    "thumb": "https://i.ytimg.com/vi/BVV4SLZrxZU/hqdefault.jpg"
  },
  {
    "source": "tistory",
    "id": "30",
    "title": "정수기 렌탈 랜딩페이지 제작기, 월 요금과 상담 신청만 남긴 한 쪽",
    "date": "2026-10-19",
    "url": "https://gompartner.tistory.com/30",
    "desc": "월 19,900원. 렌탈 광고를 누른 사람이 첫 화면에서 찾는 건 이 숫자 하나다. 제품 이름도, 회사 소개도 그다음이다. 그래서 머리글 메뉴 없이 첫 화면부터 상담 신청 폼까지 한 줄로 내려가는 한 쪽을 샘플로 만들었다. 데모 주소: gompartner. co. kr/demo/land",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fci7LSW%2FdJMcafhsIS8%2FAAAAAAAAAAAAAAAAAAAAAIJPAey19x3vqkUcHtAX4gsetlcIaiHR_8tWpE_pHaO1%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DobBNnnl85UpkZC9qiu0FHn3qgeg%253D"
  },
  {
    "source": "naver",
    "id": "224444432029",
    "title": "도메인 만료 하나로 홈페이지가 도박 사이트가 되는 이유, 만료일 확인법",
    "date": "2026-10-19",
    "url": "https://blog.naver.com/gompartner/224444432029",
    "desc": "1년 유지비 2만 원. 연장을 놓친 주소가 바카라 사이트로 연결됐어요. 10월 12일 국정감사에서 나온 지적이에요. 세종학당재단이 쓰던 공공 도메인이 관리가 끊긴 뒤 그렇게 됐다는 내용. 재단은 예전 서비스에서 쓰던 도메인이라고 설명했고, 문체부는 분쟁조정으로 되찾겠다고 했어요. 드문 ",
    "tags": [
      "도메인만료",
      "도메인연장",
      "도메인자동연장",
      "홈페이지주소",
      "도메인소유자",
      "만료도메인",
      "홈페이지관리",
      "도메인명의"
    ]
  },
  {
    "source": "naver",
    "id": "224439103668",
    "title": "홈페이지에 개인정보처리방침 꼭 있어야 할까",
    "date": "2026-10-19",
    "url": "https://blog.naver.com/gompartner/224439103668",
    "desc": "기준은 사이트 크기가 아니에요. 개인정보를 받느냐입니다. 홈페이지 맨 아래 개인정보처리방침 링크. 소개만 하는 작은 사이트에도 필요한지 묻는 분이 많아요. 문의 폼 하나만 있어도 해당되나요? 개인정보 보호법 제30조는 개인정보처리자에게 처리방침을 정하게 해요. 개인정보처리자는 제2조에 ",
    "tags": [
      "개인정보처리방침",
      "개인정보처리방침의무",
      "개인정보보호법제30조",
      "홈페이지개인정보처리방침",
      "문의폼개인정보",
      "개인정보처리방침과태료",
      "개인정보처리방침작성",
      "소상공인홈페이지"
    ]
  },
  {
    "source": "youtube",
    "id": "pAttDbDuKTg",
    "title": "오후 3시 10분, 국밥집 문이 닫혀 있던 이유",
    "date": "2026-10-18",
    "url": "https://www.youtube.com/shorts/pAttDbDuKTg",
    "desc": "브레이크타임을 모르고 온 손님은 문 앞에서 돌아가요. 첫 화면에 쉬는 시간과 메뉴, 원산지까지 적어 두면 헛걸음이 줄어요.",
    "tags": [
      "홈페이지제작",
      "소상공인홈페이지",
      "식당홈페이지",
      "국밥집",
      "브레이크타임"
    ],
    "thumb": "https://i.ytimg.com/vi/pAttDbDuKTg/hqdefault.jpg"
  },
  {
    "source": "naver",
    "id": "224438948641",
    "title": "홈페이지 만든 업체가 연락이 안 될 때 먼저 확인할 것",
    "date": "2026-10-18",
    "url": "https://blog.naver.com/gompartner/224438948641",
    "desc": "메뉴 가격 하나 고치려고 업체에 전화를 겁니다. 신호만 가고 받지 않아요. 폐업했을 수도, 담당자가 그만뒀을 수도 있죠. 이럴 땐 수정 요청보다 명의와 계정부터 봐요. 그걸 보면 사이트를 계속 쓸 수 있는지 알 수 있어요. 도메인 등록인 확인 한국인터넷진흥원 후이즈(whois.kr)에서",
    "tags": [
      "홈페이지업체연락두절",
      "홈페이지업체폐업",
      "도메인소유자확인",
      "후이즈조회",
      "도메인만료일",
      "호스팅명의",
      "홈페이지백업",
      "홈페이지관리자계정"
    ]
  },
  {
    "source": "naver",
    "id": "224439099669",
    "title": "홈페이지 유지비 1년에 얼마나 들까, 도메인, 호스팅, 구독형 빌더 비교",
    "date": "2026-10-17",
    "url": "https://blog.naver.com/gompartner/224439099669",
    "desc": "첫해 44,500원, 다음 해 28,500원. 웹호스팅과 .co.kr 도메인을 묶어 계산해 본 1년 유지비예요. 홈페이지는 만든 뒤에도 해마다 돈이 나가요. 주소인 도메인, 파일을 올려 두는 호스팅. 아임웹이나 식스샵 같은 구독형 빌더는 구독료에 호스팅이 들어 있어요. 아래 금액은 20",
    "tags": [
      "홈페이지유지비",
      "홈페이지유지비용",
      "도메인비용",
      "웹호스팅비용",
      "호스팅비교",
      "아임웹요금",
      "도메인연장",
      "홈페이지운영비"
    ]
  },
  {
    "source": "tistory",
    "id": "17",
    "title": "주문 엑셀 취합 프로그램 제작기, 거래처마다 다른 양식을 한 장으로",
    "date": "2026-10-17",
    "url": "https://gompartner.tistory.com/17",
    "desc": "아침 9시, 메일함에 주문 엑셀 다섯 통. 9시 반, 다섯 파일을 열어 한 장에 붙여 넣는다. 열 순서가 다 달라 한 열씩 옮긴다. 10시, 합계가 안 맞는다. \"15개\"라고 글자가 붙은 칸 하나가 숫자로 안 읽힌 거였다. 이 한 시간을 없애는 화면을 만들었다. 거래처 다섯 곳에서 양식",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FWV7qu%2FdJMcahGac6w%2FAAAAAAAAAAAAAAAAAAAAAKQx0ytvrJV0n3drroXxM9g0Wj-bKkOP5SDY39_kUVhW%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3D05u0P3i2NOcllUcD3fN6LRvEF4c%253D"
  },
  {
    "source": "tistory",
    "id": "29",
    "title": "곰파트너 홈페이지 샘플 27개, 업종별로 직접 눌러 보는 곳",
    "date": "2026-10-16",
    "url": "https://gompartner.tistory.com/29",
    "desc": "곰파트너는 혼자 일하는 웹 개발자다. 홈페이지를 만들고, 업무 프로그램을 짜고, 다 만든 뒤 유지보수까지 맡는다. 이 블로그에는 샘플을 하나씩 만들면서 남긴 제작 일지를 올린다. 사이트: gompartner. co. kr샘플 모음: gompartner. co. kr/works샘플은 전부",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbqUYqK%2FdJMcajc6hZN%2FAAAAAAAAAAAAAAAAAAAAAFr1pacTKfOYLFx1u5cJ7GvkXv4U9XTEBN0HmR9Y1kjU%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3D0GRenn7xiJkjXKbVmkQ9cBW9kDs%253D"
  },
  {
    "source": "naver",
    "id": "224438946956",
    "title": "인테리어 업체 시공사례, 손님은 무엇을 보고 고를까",
    "date": "2026-10-16",
    "url": "https://blog.naver.com/gompartner/224438946956",
    "desc": "사진이 예쁜 업체와 믿고 맡길 업체는 같을까요? 인테리어 홈페이지의 중심은 대개 시공사례예요. 그런데 사진만으로는 고르기 어렵죠. 우리 집과 비슷한 공사였는지 알 수 있어야 합니다. 손님이 실제로 보는 건 이 네 가지예요. 사례마다 있어야 할 네 가지 평형과 단지 먼저 보는 건 평형이에",
    "tags": [
      "인테리어시공사례",
      "인테리어업체고르기",
      "아파트리모델링",
      "실내건축공사업면허",
      "건설업등록",
      "인테리어홈페이지",
      "공사전후사진",
      "공사기간"
    ]
  },
  {
    "source": "tistory",
    "id": "16",
    "title": "쇼핑몰 관리자 프로그램 제작기, 옵션 5단 조합표를 자동으로 만든다",
    "date": "2026-10-16",
    "url": "https://gompartner.tistory.com/16",
    "desc": "옵션이 색상, 크기, 소재 3단일 때는 조합표를 엑셀로 채웠다. 12줄이면 끝났다. 자수와 포장을 더해 5단이 되자 48줄이 됐다. 색 하나 더하면 64줄. 줄마다 판매가와 재고를 손으로 넣다 보면 어느 줄을 빠뜨렸는지 모른다. 옵션만 넣으면 조합표가 저절로 나오게, 타월 쇼핑몰 관리자",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FXLu7q%2FdJMcahTAAxx%2FAAAAAAAAAAAAAAAAAAAAAAM7MgvFsQDAgPumjvp9rzGzAMN-_4h3pDUJ50DU_udA%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3D09wDvQMDIyZhzukkLsUYBgvt2Og%253D"
  },
  {
    "source": "tistory",
    "id": "15",
    "title": "베이커리 홈페이지 제작기, 빵 나오는 시간을 메뉴판보다 위에",
    "date": "2026-10-16",
    "url": "https://gompartner.tistory.com/15",
    "desc": "하루에 열일곱 번 빵이 나온다. 첫 소금빵은 08:00, 마지막 소금빵은 17:00. 손님은 그 사이 어디쯤 가야 하는지 모른다. 전화로 묻거나, 와서 보거나, 와서 기다린다. 그 열일곱 번을 첫 화면에 올려 두기로 하고 동네 베이커리 카페로 샘플을 만들었다. 데모 주소: gompart",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbrX0ax%2FdJMcac5Xq4D%2FAAAAAAAAAAAAAAAAAAAAAKzSqRfeYKPUs-k4aMhFan3WjSpvRdpaZuLOPuDRm-nZ%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DgEoZR559vpDO%252FENvvYADqCO5wWQ%253D"
  },
  {
    "source": "naver",
    "id": "224438946100",
    "title": "펜션 예약, 네이버 예약만 쓸까 홈페이지로 직접 받을까",
    "date": "2026-10-15",
    "url": "https://blog.naver.com/gompartner/224438946100",
    "desc": "주말 바다 여행을 계획하는 손님. 지도에서 펜션을 찾고, 앱도 보고, 전화도 걸어 봅니다. 예약을 받는 방법은 여러 가지예요. 그중 두 가지를 비교해 볼게요. 네이버 예약, 그리고 홈페이지 직접 예약. 네이버 예약으로 받을 때 지도에서 펜션을 찾은 손님이 바로 예약까지 할 수 있어요. ",
    "tags": [
      "펜션예약",
      "네이버예약",
      "펜션홈페이지",
      "펜션직접예약",
      "숙박환불규정",
      "소비자분쟁해결기준",
      "펜션개인정보처리방침",
      "실시간예약"
    ]
  },
  {
    "source": "tistory",
    "id": "14",
    "title": "한옥 카페 홈페이지 제작기, 평면도에서 방을 골라 예약하는 찻집",
    "date": "2026-10-15",
    "url": "https://gompartner.tistory.com/14",
    "desc": "토요일 두 시, 손님 넷이 골목 입구에서 전화를 건다.\" 세탁소 지나서 어디로 가요?\" 그리고 \"마당 보이는 자리 남았어요?\" 들어와서도 메뉴판 앞에서 한참 선다. 작설차와 우엉차 중 뭐가 덜 쓴지 모른다. 길, 자리, 메뉴 세 가지가 화면에서 풀리게 1962년 ㄱ자 한옥 찻집으로 샘플",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FXEpn5%2FdJMcab0qBRO%2FAAAAAAAAAAAAAAAAAAAAAJirXBjsmk3Al0GstmyceFTeyFbwLYKp7JH4eGm6tfEz%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DZkrY3ddLqMNfvpO7dm0EiSrfeSA%253D"
  },
  {
    "source": "tistory",
    "id": "13",
    "title": "필라테스 홈페이지 제작기, 그룹 시간표에 남은 자리까지 적었다",
    "date": "2026-10-15",
    "url": "https://gompartner.tistory.com/13",
    "desc": "\"내일 아침 7시 매트 자리 있어요?\"\"리포머 입문반은 무슨 요일에 해요?\" 인스타 DM으로 오는 질문은 대개 이 둘이다. 답하는 사이 그 자리는 또 찬다. 이 질문이 사이트 안에서 끝나게, 동네 스튜디오 하나를 잡고 샘플을 만들었다. 데모 주소: gompartner. co. kr/de",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FceiDqe%2FdJMcahGabgq%2FAAAAAAAAAAAAAAAAAAAAAGV34stidHsyAEXG-MaTcZynLZ_QGQsIOE9Q7VLKwdFS%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3D%252F%252BS0C%252BPWfPp%252BfjF0Zn5C%252FYlSXj4%253D"
  },
  {
    "source": "naver",
    "id": "224438945248",
    "title": "병원 비급여 진료비, 홈페이지에 어떻게 알려야 하나",
    "date": "2026-10-14",
    "url": "https://blog.naver.com/gompartner/224438945248",
    "desc": "홈페이지가 있는 병원이라면 비급여 진료비는 홈페이지에도 따로 올려야 합니다. 위치도 모양도 병원마다 다르지만 올리는 방법은 보건복지부 고시에 정해져 있어요. 볼 것은 네 가지예요. 원내 책자만으로 되나요 홈페이지에도 따로 표시 의료법 제45조는 비급여 진료비용을 환자가 쉽게 알게 하라고",
    "tags": [
      "비급여진료비고지",
      "비급여진료비용",
      "병원홈페이지",
      "의료법제45조",
      "비급여고지지침",
      "제증명수수료",
      "치과비급여",
      "의원홈페이지"
    ]
  },
  {
    "source": "tistory",
    "id": "12",
    "title": "프라이빗짐 예약 홈페이지 제작기, 지점 고르고 1시간 단위로 결제까지",
    "date": "2026-10-14",
    "url": "https://gompartner.tistory.com/12",
    "desc": "예전 헬스장은 데스크에서 회원권을 끊고 들어갔다. 프라이빗짐은 직원이 없다. 한 시간 동안 공간을 통째로 빌려 쓰고 문은 비밀번호로 연다. 예약과 결제, 출입까지 사이트에서 끝나야 손님이 문 앞에서 전화하지 않는다. 서울 10개 지점을 가진 가상의 곰파트너 프라이빗 짐으로 샘플을 만들었",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FehfOQ9%2FdJMcacLOwdf%2FAAAAAAAAAAAAAAAAAAAAAExdv1QAa9XWc5qazZbJC666tj1-euAfFRb5ikkeZWOr%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DRkq5lsy%252Fx9bhQYEy6N1LmyJC%252BMU%253D"
  },
  {
    "source": "tistory",
    "id": "11",
    "title": "부동산 홈페이지 제작기, 검색 줄부터 두고 중개보수까지 보여 주는 중개사무소",
    "date": "2026-10-14",
    "url": "https://gompartner.tistory.com/11",
    "desc": "매물 137건. 중개사무소 사이트에 들어온 사람이 보고 싶은 건 이 숫자 안에서 내 조건에 맞는 몇 건이다. 사무소 소개는 읽지 않고 바로 찾는다. 그래서 첫 화면에 사진과 인사말 대신 검색 조건을 깔고 공인중개사사무소 샘플을 만들었다. 데모 주소: gompartner. co. kr/d",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fc7WqVk%2FdJMcafPvQn4%2FAAAAAAAAAAAAAAAAAAAAABKd386wsEefyMQBjGVHgGBpnVyMr3cHNLcpeNqZt3ND%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DZRcIVjTXHmNDS6g5B60e5B5EBxo%253D"
  },
  {
    "source": "tistory",
    "id": "7",
    "title": "법률사무소 홈페이지 제작기, 변호사 약력보다 사건 절차를 먼저",
    "date": "2026-10-13",
    "url": "https://gompartner.tistory.com/7",
    "desc": "밤 11시에 \"전세보증금 못 받으면\"으로 검색한다. 집주인은 전화를 안 받고 이사 날짜는 보름 남았다. 이때 궁금한 건 변호사 약력이 아니라 내 일이 앞으로 어떻게 되느냐다. 변호사 2명짜리 사무소로 잡고 이 질문에 맞춰 샘플을 만들었다. 데모 주소: gompartner. co. kr/",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcqdwWn%2FdJMcafuPKcb%2FAAAAAAAAAAAAAAAAAAAAAM6Db_CPTkVMPNd7IUdH7LXSaWZcT32tLJcdfgPX2y6a%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DBiWX11vPk%252B5sC8L8ZpDLEdP7%252BEs%253D"
  },
  {
    "source": "naver",
    "id": "224438944372",
    "title": "학원 홈페이지에 교습비 꼭 올려야 할까",
    "date": "2026-10-13",
    "url": "https://blog.naver.com/gompartner/224438944372",
    "desc": "교습비, 홈페이지에도 적어야 할까요? 학원 홈페이지를 만들 때 꼭 나오는 질문이에요. 법에는 두 가지가 따로 있어요. 학원 안에 붙이는 게시, 광고에 적는 표시. 홈페이지와 관련 있는 건 주로 표시 쪽입니다. 학원 안 게시는 어떻게 하나요? 학원법 제15조제3항 앞부분이 게시에 관한 내",
    "tags": [
      "학원교습비게시",
      "교습비표시의무",
      "학원홈페이지",
      "학원광고교습비",
      "교습비게시표",
      "교습비반환기준",
      "학원법",
      "학원과태료"
    ]
  },
  {
    "source": "tistory",
    "id": "10",
    "title": "세무사 홈페이지 제작기, 첫 화면에 이달 신고일정을 둔 세무회계 사무소",
    "date": "2026-10-13",
    "url": "https://gompartner.tistory.com/10",
    "desc": "\"부가세 언제까지예요?\"\"원천세 이번 달도 내요?\" 세무사무소로 오는 전화는 대부분 이런 기한 질문이라고 봤다. 사무소 소개보다 이달 신고일정이 먼저 보이게 세무회계 사무소 샘플을 만들었다. 데모 주소: gompartner. co. kr/demo/tax-office구성: 첫 화면과 하위",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FXX0EA%2FdJMcajjNNDK%2FAAAAAAAAAAAAAAAAAAAAADFsFKMEBCoyxYH_jNVaiexbX-DZB6lkNX2izIDf0Cjc%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DEmtQanD7V1%252Fe9AfB07oM%252BG5LoIA%253D"
  },
  {
    "source": "tistory",
    "id": "5",
    "title": "피부 진단 결과지 프로그램 제작기, 연령대 평균과 비교해 A4 한 장으로",
    "date": "2026-10-12",
    "url": "https://gompartner.tistory.com/5",
    "desc": "상담실에서 진단기 화면을 고객과 같이 본다.\" 수분 58이면 괜찮은 건가요?\" 숫자 하나로는 답이 안 된다. 같은 나이대 평균이 옆에 있어야 한다. 그 비교를 종이 한 장에 담는 원내 프로그램을 샘플로 만들었다. 홈페이지가 아니라 피부과 PC에서 쓰는 화면이다. 데모 주소: gompar",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2F7ktSQ%2FdJMcaiysaRU%2FAAAAAAAAAAAAAAAAAAAAAH9CiXfnuItbY39xptmr_Sp5nV9QtaNpXJ-7raAPQArz%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DxsyDR4XnhT5kG0McHgzKjIMHdSw%253D"
  },
  {
    "source": "tistory",
    "id": "4",
    "title": "약국 홈페이지 제작기, 처방전 미리 보내고 복약 달력까지 뽑는 동네 약국",
    "date": "2026-10-12",
    "url": "https://gompartner.tistory.com/4",
    "desc": "약국 문 앞에서 휴대폰을 꺼낸다. \"지금 열었나?\" 검색하면 영업시간 한 줄은 나오는데 오늘이 휴무인지는 안 나온다. 들어가서는 약이 나올 때까지 서서 기다린다. 동네 약국 손님은 어르신이 많다. 이 둘을 놓고 약국 샘플을 만들었다. 데모 주소: gompartner. co. kr/dem",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FehZ8iA%2FdJMcahffyyf%2FAAAAAAAAAAAAAAAAAAAAAOYrd9fK7vEocHrocP8Vb8QQu9cyfaV12ZkcT2Xyqxf7%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DB3DFoYqm5OQuy3lcoO5jDy4du0g%253D"
  },
  {
    "source": "naver",
    "id": "224438912795",
    "title": "식당은 네이버 플레이스만으로 충분할까, 홈페이지가 따로 필요한 경우",
    "date": "2026-10-12",
    "url": "https://blog.naver.com/gompartner/224438912795",
    "desc": "점심 먹을 곳을 찾는 손님. 대개 네이버 지도부터 엽니다. 메뉴, 영업시간, 리뷰, 길찾기가 플레이스 한 화면에 다 있어요. 그래서 홈페이지 없이 장사하는 식당이 많죠. 가게에 따라서는 그걸로 충분합니다. 두 경우를 비교해 볼게요. 플레이스로 충분한 가게 손님이 확인하는 건 대개 네 가",
    "tags": [
      "식당홈페이지",
      "네이버플레이스",
      "스마트플레이스",
      "음식점홈페이지",
      "식당메뉴판",
      "브레이크타임",
      "단체석안내",
      "가게홈페이지"
    ]
  },
  {
    "source": "tistory",
    "id": "9",
    "title": "피부과 홈페이지 제작기, 진료와 시술을 첫 화면부터 나눈 구성",
    "date": "2026-10-11",
    "url": "https://gompartner.tistory.com/9",
    "desc": "전화가 울린다. \"아토피 진료 되나요?\" 다음 전화는 \"리프팅 상담은 예약해야 하나요?\" 같은 번호로 받으면 접수대가 매번 되묻는다. 진료세요, 시술이세요. 그래서 대표번호부터 둘로 나눈 피부과 샘플을 만들었다. 데모 주소: gompartner. co. kr/demo/clinic-hom",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2F28rkn%2FdJMcafBDE0b%2FAAAAAAAAAAAAAAAAAAAAAGjqWSAD43lZDcwbdwc-XahVnidcRTGHSH5eaZEDRwRe%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3D3dA1WOdjHsFHjgP%252FPJdiNdZMYCg%253D"
  },
  {
    "source": "tistory",
    "id": "8",
    "title": "치과 홈페이지 제작기, 아픈 이를 눌러 보는 치아 지도",
    "date": "2026-10-11",
    "url": "https://gompartner.tistory.com/8",
    "desc": "\"어디가 아프세요?\" 접수대에서 제일 먼저 듣는 말이다. 환자는 손가락으로 볼을 짚는다. 왼쪽 아래 어금니쯤. 말로는 그 이가 몇 번 이인지 잘 안 잡힌다. 눌러서 고르게 하면 어떨까 싶어 치과 샘플을 만들었다. 데모 주소: gompartner. co. kr/demo/dental-hom",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FIId5o%2FdJMcacZdbI4%2FAAAAAAAAAAAAAAAAAAAAAJG2GN1NNupR7FWDe9ow0pCatrYRYKm-dYmSmHYTPJ60%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3Dstun4b6sPyspYunKmQGSQpRrX1g%253D"
  },
  {
    "source": "tistory",
    "id": "28",
    "title": "아임웹 기업 홈페이지 제작기, 제조업 설비현황과 도면 첨부 견적문의",
    "date": "2026-10-11",
    "url": "https://gompartner.tistory.com/28",
    "desc": "가공 업체 홈페이지는 발주 담당자가 도면을 들고 연다. 우리 부품을 깎을 수 있는지, 도면은 어디로 보내는지 둘만 본다. 전화로 묻고 팩스로 보내던 때와 달리 지금은 홈페이지 폼에 파일을 붙인다. 이 둘이 첫 화면에서 끝나게, 정밀가공 업체 데모를 아임웹으로 옮겼다. 사이트 주소: go",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FTBe3R%2FdJMcadjOOyf%2FAAAAAAAAAAAAAAAAAAAAAGl968EHiuPYpV1p7y_1iVm76um0xO-8srg78tbF1t9X%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3Dg6YTbyhA6N0Co%252F7wvt2Rrs3zDPs%253D"
  },
  {
    "source": "tistory",
    "id": "27",
    "title": "아임웹 펜션 홈페이지 제작기, 빈 템플릿에서 객실 안내와 예약 문의까지",
    "date": "2026-10-11",
    "url": "https://gompartner.tistory.com/27",
    "desc": "금요일 밤, 휴대폰으로 펜션 이름을 검색한다. 블로그 글 사이에서 홈페이지를 찾아 누른다. 바다 쪽 방이 몇 개인지, 주말 요금은 얼마인지, 문의는 어디로 하는지. 이 셋이 휴대폰에서 바로 나오게, 펜션 데모를 아임웹으로 다시 만들었다. 사이트 주소: gompartner-pension.",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2F0oHi1%2FdJMcagAHrc5%2FAAAAAAAAAAAAAAAAAAAAAJ51U1MHqfpJyI4zQp5f-kiH98A2l2zefUx8Sn3L5oCM%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3D37ahQf9uN4wdZYFvqeVRE2N7cmI%253D"
  },
  {
    "source": "tistory",
    "id": "6",
    "title": "시험인증기관 홈페이지 제작기, 전화 문의를 조회 화면으로 돌린 리뉴얼",
    "date": "2026-10-10",
    "url": "https://gompartner.tistory.com/6",
    "desc": "접수 후 45일째다. 성적서는 나왔고 인증 신청도 들어갔는데 끝났다는 연락은 없다. 제조사 개발 담당자는 결국 시험소에 전화를 건다. 그 전화가 조회 화면 하나로 끝나게, 전자파와 무선, 전기안전을 다루는 가상의 시험소로 리뉴얼 샘플을 만들었다. 데모 주소: gompartner. co.",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FefQoQO%2FdJMcab65GHg%2FAAAAAAAAAAAAAAAAAAAAAIER8DVyyOPR2N9qTI1LGD1EvOZyYVvUnHxWdbukkj4k%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3Dhm5vuyjLHJyiaEcptQGKd%252Fbnluc%253D"
  },
  {
    "source": "tistory",
    "id": "3",
    "title": "제조업 홈페이지 제작기, 정밀가공 회사는 설비 표가 먼저다",
    "date": "2026-10-10",
    "url": "https://gompartner.tistory.com/3",
    "desc": "도면 한 장을 들고 가공 업체 사이트를 연다. 연혁과 대표 인사말이 먼저 나온다. 구매 담당자가 알고 싶은 건 하나다. 이 부품, 여기서 깎을 수 있나. 그 답이 먼저 나오게, 정밀가공 회사로 샘플을 만들었다. 데모 주소: gompartner. co. kr/demo/company구성: ",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FEr489%2FdJMcacZc9g4%2FAAAAAAAAAAAAAAAAAAAAAMgliAKNdp_AFLALXkde_azHEL2TTXRO8ZKzmx8Mt4N9%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3Dsmchw8vKJAdHcEtR1ZuLS9Keu2M%253D"
  },
  {
    "source": "tistory",
    "id": "2",
    "title": "펜션 홈페이지 제작기, 객실 배치도와 예약현황표로 빈 방 찾기",
    "date": "2026-10-10",
    "url": "https://gompartner.tistory.com/2",
    "desc": "날짜는 정했다. 그런데 객실 사진 여섯 장 어디에도 그날 빈 방이 적혀 있지 않다. 반대로 바다 보이는 방을 찜해 두고 되는 날짜를 못 찾는 손님도 있다. 둘 다 결국 전화를 건다. 날짜 먼저 보는 손님과 방 먼저 보는 손님이 같은 화면에서 끝나게, 바닷가 펜션으로 샘플을 만들었다. 데",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbMlIKG%2FdJMb999bDn6%2FAAAAAAAAAAAAAAAAAAAAAMzR1w2xUcovY9fmIu5jC4pS6Sz1QPz1Y8l5d2ERRHAK%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DqhceTL6l%252FgLGjVlbQHrosQ1ovjM%253D"
  },
  {
    "source": "tistory",
    "id": "1",
    "title": "도자기 공방 쇼핑몰 제작기, 유약 색과 각인을 미리 보는 자사몰",
    "date": "2026-10-10",
    "url": "https://gompartner.tistory.com/1",
    "desc": "\"이 머그 청자로도 나와요?\" \"각인 넣으면 글자가 이렇게 들어가는 거 맞죠?\" 공방 쇼핑몰 문의함에 쌓이는 말은 대개 색과 글자 얘기다. 사진은 한 장인데 유약은 네 가지라 생기는 일이다. 같은 그릇이 유약 네 가지로 나오고 이름 각인도 받는 도자기 공방으로 샘플을 만들었다. 데모 주",
    "tags": [],
    "thumb": "https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FdmVIkG%2FdJMcabFTp8X%2FAAAAAAAAAAAAAAAAAAAAAJZy8QLQFEtaGysIkQOhiTstdS0sLqunkpu9289QZQO7%2Fimg.jpg%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1796050799%26allow_ip%3D%26allow_referer%3D%26signature%3DguNETTX0qINkiPA3%252F2QMcEBXfzA%253D"
  }
];
export const channelLabel: Record<ChannelSource, string> = { naver: "네이버 블로그", tistory: "티스토리", youtube: "유튜브" };
