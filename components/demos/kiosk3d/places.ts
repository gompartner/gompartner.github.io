/*
  키오스크 3D 장소 설정. 장소마다 방(Room) 부품과 이 설정 하나를 짝지어 KioskScene에 꽂는다.
  - 단위는 미터. 바닥이 y=0, 화면 쪽(카메라 기본 방향)이 +z.
  - kiosk: 키오스크 받침 중심과 회전(rotationY=0이면 화면이 +z를 본다). 화면 투영과 다가가기 카메라는 여기서 계산한다.
  - view: 처음 보이는 전체 장면 카메라와 끌어서 돌려 볼 수 있는 범위(라디안, 미터).
  - tv: 벽 TV 화면 판(640x352 px 화면을 겹친다). rotationY=0이면 +z를 본다.
  - monitor: 책상 모니터 화면 판(1280x720 px 화면을 겹친다). 학원 원장실 관리자 화면.
  - steps: 이용 흐름 단계. camera가 "kiosk"면 키오스크 화면 앞으로 다가가 화면을 누를 수 있다. path의 몇 번째 점에 사람이 서는지(at) 적는다.
  - path: 바닥 점선과 사람이 걷는 길(점 순서대로).
  - callouts: 설치 안내 이름표. step을 적으면 그 단계에서만, 비우면 전체 장면에서만 보인다.
*/

export type Vec3 = [number, number, number];
export type Place = "clinic" | "academy";

export type CameraShot = { position: Vec3; target: Vec3 };

export type JourneyStep = {
  id: string;
  label: string;
  camera: CameraShot | "kiosk";
  /** path 배열의 몇 번째 점에 사람이 서는지 */
  at: number;
  /** 서 있을 때 바라보는 방향(라디안, 0이면 +z) */
  facing?: number;
  pose?: "stand" | "sit";
  /** 앉을 때 앉는 면 높이(m) */
  seat?: number;
  /** 앉을 때: path의 at 점(의자 앞에 선 자리)에서 앉는 면 중심까지 뒤로 떨어진 거리(m) */
  seatBack?: number;
  /** 단계 화면 옆에 띄울 카드 */
  card?: "phone" | "done";
};

export type Callout = { at: Vec3; text: string; step?: string };

export type PlaceConfig = {
  kiosk: { position: Vec3; rotationY: number };
  view: CameraShot & { azimuth: [number, number]; polar: [number, number]; distance: [number, number] };
  tv?: { center: Vec3; rotationY: number; w: number; h: number };
  /** 책상 모니터 화면 판(1280x720 px 화면을 겹친다). rotationY=0이면 +z를 본다 */
  monitor?: { center: Vec3; rotationY: number; w: number; h: number };
  hdri?: string;
  background: string;
  accent: string;
  steps: JourneyStep[];
  path: Vec3[];
  callouts: Callout[];
  /** 바닥 치수선: 두 점과 글자 */
  dimensions?: { from: Vec3; to: Vec3; text: string; step?: string }[];
};

export const CLINIC: PlaceConfig = {
  kiosk: { position: [2.15, 0, 1.45], rotationY: 0 },
  view: {
    position: [6.0, 8.4, 11.6],
    target: [0, 0.55, 0.6],
    azimuth: [-0.75, 0.9],
    polar: [0.45, 1.3],
    distance: [2.2, 15],
  },
  tv: { center: [-1.55, 2.0, -3.33], rotationY: 0, w: 1.64, h: 0.902 },
  hdri: "/hdri/hospital_room_1k.hdr",
  background: "#e9e6e0",
  accent: "#0f5560",
  path: [
    [3.4, 0, 4.4], // 0 바깥
    [3.4, 0, 3.05], // 1 입구 안
    [2.75, 0, 2.35],
    [2.15, 0, 2.05], // 3 키오스크 앞
    [1.3, 0, 1.35],
    [0.75, 0, 0.75], // 5 휴대폰 확인
    [0.75, 0, -1.95],
    [-0.3, 0, -1.95],
    [-0.3, 0, -1.62], // 8 대기석 앞(앉으면 0.67m 뒤 앉는 면 중심으로)
    [-0.3, 0, -1.95],
    [-4.05, 0, -1.95],
    [-4.45, 0, -2.25], // 11 진료실 문 앞
  ],
  steps: [
    { id: "enter", label: "입구", at: 1, facing: Math.PI, camera: { position: [6.6, 5.0, 8.0], target: [2.6, 0.6, 2.2] } },
    { id: "kiosk", label: "키오스크 접수", at: 3, facing: Math.PI, camera: "kiosk" },
    { id: "phone", label: "번호표와 휴대폰 알림", at: 5, facing: -0.45, card: "phone", camera: { position: [-1.2, 3.6, 4.8], target: [0.9, 0.7, 0.5] } },
    { id: "tv", label: "대기실 TV 호출", at: 8, facing: Math.PI, pose: "sit", seat: 0.44, seatBack: 0.67, camera: { position: [-0.9, 2.45, 2.3], target: [-1.5, 1.45, -3.0] } },
    { id: "exam", label: "진료실 입장", at: 11, facing: -Math.PI / 2, card: "done", camera: { position: [0.2, 4.8, 4.2], target: [-3.4, 0.8, -1.9] } },
  ],
  callouts: [
    { at: [3.4, 0.7, 3.5], text: "출입문" },
    { at: [2.15, 2.05, 1.45], text: "키오스크" },
    { at: [-1.55, 2.6, -3.38], text: "대기실 TV" },
    { at: [3.3, 1.4, -2.3], text: "접수 데스크" },
    { at: [-4.9, 2.45, -2.25], text: "진료실" },
    { at: [3.4, 0.25, 3.6], text: "자동문 안쪽", step: "enter" },
    { at: [1.35, 0.15, 1.65], text: "통로 1.2m 확보", step: "enter" },
    { at: [2.15, 2.05, 1.45], text: "접수대에서 보이는 자리", step: "phone" },
    { at: [0.75, 1.75, 0.75], text: "번호표 QR로 대기 순서 확인", step: "phone" },
    { at: [-1.55, 2.6, -3.38], text: "바닥에서 2m 높이", step: "tv" },
    { at: [-4.9, 2.45, -2.25], text: "호출 번호 확인 뒤 입장", step: "exam" },
  ],
  dimensions: [{ from: [3.4, 0, 3.45], to: [2.15, 0, 1.62], text: "입구에서 2m", step: "enter" }],
};

// 학원 입구(AcademyEntrance): 뒤벽 유리문으로 들어와 문 옆 1m 키오스크에 학생증을 대고, 복도 교실로 들어간다. 원장실 모니터에 관리자 화면
export const ACADEMY: PlaceConfig = {
  kiosk: { position: [-1.9, 0, -3.2], rotationY: 0 },
  view: {
    position: [1.0, 13.6, 14.6],
    target: [0, 0, -0.2],
    azimuth: [-0.75, 0.9],
    polar: [0.35, 1.25],
    distance: [2.2, 20],
  },
  monitor: { center: [-2.75, 1.035, 2.03], rotationY: 0, w: 0.52, h: 0.29 },
  hdri: "/hdri/academy-white_studio_03_1k.hdr",
  background: "#e8ecf1",
  accent: "#16285a",
  path: [
    [-3.4, 0, -4.3], // 0 문 밖 복도
    [-3.4, 0, -2.85], // 1 문 안
    [-2.6, 0, -2.45],
    [-1.9, 0, -2.45], // 3 키오스크 앞
    [-0.9, 0, -1.6],
    [0.2, 0, -0.6],
    [0.2, 0, -0.2],
    [1.4, 0, -0.2], // 7 교실 문
    [1.4, 0, -1.75], // 8 자리
  ],
  steps: [
    { id: "enter", label: "입구", at: 1, facing: Math.PI / 2, camera: { position: [1.6, 4.6, 3.0], target: [-2.5, 0.8, -2.9] } },
    { id: "tag", label: "학생증 태그", at: 3, facing: Math.PI, camera: "kiosk" },
    { id: "notify", label: "학부모 휴대폰 알림", at: 3, facing: Math.PI, card: "phone", camera: { position: [0.4, 4.6, 3.6], target: [-3.2, 0.8, -1.4] } },
    { id: "class", label: "교실 입실", at: 8, facing: Math.PI / 2, camera: { position: [1.3, 8.6, 3.4], target: [2.6, 0.2, -1.4] } },
    { id: "admin", label: "원장 관리자 화면", at: 8, facing: Math.PI / 2, camera: { position: [-1.85, 2.35, 3.7], target: [-2.75, 1.0, 2.03] } },
  ],
  callouts: [
    { at: [-3.4, 2.35, -3.5], text: "출입문" },
    { at: [-1.9, 2.15, -3.2], text: "키오스크" },
    { at: [-4.75, 1.25, -2.55], text: "신발장" },
    { at: [1.0, 2.5, -0.2], text: "교실" },
    { at: [-2.75, 1.5, 2.0], text: "원장실" },
    { at: [-1.38, 0.38, -3.42], text: "벽 콘센트", step: "enter" },
    { at: [-1.35, 1.3, -3.2], text: "학생 눈높이 화면", step: "enter" },
    { at: [-4.25, 1.55, -0.2], text: "학부모 휴대폰 알림", step: "notify" },
    { at: [1.0, 2.35, -0.2], text: "입실 시간 자동 기록", step: "class" },
    { at: [-2.75, 1.3, 2.0], text: "원장실 PC", step: "admin" },
  ],
  dimensions: [{ from: [-2.9, 0, -3.0], to: [-1.9, 0, -3.0], text: "출입문 옆 1m", step: "enter" }],
};

export const PLACES: Record<Place, PlaceConfig> = { clinic: CLINIC, academy: ACADEMY };

/** 장소 방 부품이 받는 값 */
export type RoomProps = { config: PlaceConfig };
