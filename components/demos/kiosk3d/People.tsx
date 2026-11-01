"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

/*
  사람 모형(Quaternius Ultimate Animated Character Pack 계열, CC0, public/models/people/LICENSE.txt).
  - 다섯 벌(남자 평상복, 남자 정장, 여자 평상복, 여자 재킷, 여자 원피스)이 같은 뼈대(HumanArmature)와 같은 동작(걷기, 서기, 앉기)을 쓴다.
    옷, 머리, 피부 색과 키를 바꿔 역할마다 다른 사람으로 쓴다(CAST). 한국 장면이라 검은색, 짙은 갈색 머리와 동아시아 피부색.
  - action: walk(걷기), idle(서서 쉬기), sit(앉아 있기). 바뀔 때 0.3초 겹쳐 넘긴다.
  - 모형은 원래 약 4.6 단위 키라 MODEL_SCALE로 줄여 약 1.65m로 맞춘다. look.height로 키를 바꾸면 걷기 보폭과 앉은 높이도 같은 비율로 바뀐다.
  - 걷기: 동작 속도 1일 때 딛는 발이 WALK_SPEED(m/s, 키 1.65m 기준)로 뒤로 간다. 걷는 속도 / (WALK_SPEED x 키 비율)을 동작 빠르기로 주면 발이 미끄러지지 않는다.
  - 앉기: *_Sitting 동작의 앉은 구간(1초 뒤)만 되풀이한다. 앉은 자세에서 허벅지 아래는 원점보다 SIT_THIGH 위, 엉덩이는 SIT_BACK 뒤에 있다.
*/

export type PersonModel = "man_casual" | "man_suit" | "woman_casual" | "woman_jacket" | "woman_dress";

export type PersonLook = {
  model: PersonModel;
  /** 윗옷(정장이면 웃옷) */
  shirt?: string;
  pants?: string;
  /** 여자 재킷 겉옷 */
  jacket?: string;
  /** 원피스 */
  dress?: string;
  hair?: string;
  skin?: string;
  shoes?: string;
  /** 정장 안의 셔츠와 넥타이 */
  inner?: string;
  tie?: string;
  /** 키(m). 기본 1.65 */
  height?: number;
  /** 메는 가방 색(학생) */
  backpack?: string;
};

export type PersonAction = "walk" | "idle" | "sit";

const URL: Record<PersonModel, string> = {
  man_casual: "/models/people/man_casual.glb",
  man_suit: "/models/people/man_suit.glb",
  woman_casual: "/models/people/woman_casual.glb",
  woman_jacket: "/models/people/woman_jacket.glb",
  woman_dress: "/models/people/woman_dress.glb",
};

const BASE_H = 1.65;
export const MODEL_SCALE = 0.36;
export const WALK_SPEED = 3.96 * MODEL_SCALE;
export const SIT_THIGH = 0.33;
export const SIT_BACK = 0.21;
const SIT_FROM = 1.0;

const CLIP = { walk: "_Walk", idle: "_Idle", sit: "_Sitting" } as const;

const SKIN = ["#eac7a8", "#e2bb98", "#f0d2b8", "#d9b08d"];
const HAIR_BLACK = "#191512";
const HAIR_BROWN = "#2e221b";
const HAIR_GRAY = "#8f8b86";

/** 역할별 사람. 장소마다 이 이름으로 골라 쓴다 */
export const CAST = {
  /** 학원: 가방 멘 중학생 */
  student: { model: "man_casual", shirt: "#2f3f5f", pants: "#2a2e36", hair: HAIR_BLACK, skin: SKIN[2], shoes: "#e8e8e8", height: 1.58, backpack: "#3a6f8f" },
  /** 학원: 대기 의자 학부모(40대 여성) */
  parent: { model: "woman_dress", dress: "#8c7a68", hair: HAIR_BROWN, skin: SKIN[1], shoes: "#3a3430", height: 1.6 },
  /** 학원: 원장(정장 남성) */
  director: { model: "man_suit", shirt: "#2c3242", pants: "#2c3242", inner: "#f2f2f0", tie: "#16285a", hair: HAIR_BLACK, skin: SKIN[3], height: 1.72 },
  /** 학원: 교실 A 화이트보드 앞 선생님 */
  teacher: { model: "woman_jacket", jacket: "#e9e4da", shirt: "#3b4a63", pants: "#3a3f4a", hair: HAIR_BLACK, skin: SKIN[0], shoes: "#2a2a2a", height: 1.63 },
  /** 병원: 접수하러 걸어오는 환자(30대 남성) */
  patient: { model: "man_casual", shirt: "#7d8a96", pants: "#3a3f48", hair: HAIR_BLACK, skin: SKIN[1], shoes: "#2b2b2b", height: 1.73 },
  /** 병원: 대기석 노년 여성 */
  elder: { model: "woman_dress", dress: "#5f6b78", hair: HAIR_GRAY, skin: SKIN[3], shoes: "#2f2a26", height: 1.55 },
  /** 병원: 대기석 직장인 남성 */
  worker: { model: "man_suit", shirt: "#4a5058", pants: "#3a3f46", inner: "#dfe6ee", tie: "#7a2f3a", hair: HAIR_BLACK, skin: SKIN[0], height: 1.75 },
  /** 병원: 대기석 20대 여성(휴대폰) */
  young: { model: "woman_casual", shirt: "#c9b8a2", pants: "#4b5566", hair: HAIR_BROWN, skin: SKIN[2], shoes: "#e8e8e8", height: 1.62 },
  /** 병원: 접수대 직원 */
  receptionist: { model: "woman_jacket", jacket: "#f4f4f2", shirt: "#0f5560", pants: "#2f3a40", hair: HAIR_BLACK, skin: SKIN[0], shoes: "#e8e8e8", height: 1.62 },
} satisfies Record<string, PersonLook>;

/** 손에 든 휴대폰(오른손 뼈에 붙인다). 크기는 m, 뼈대 배율(100 x MODEL_SCALE)만큼 나눈다 */
function makePhone() {
  const k = 1 / (100 * MODEL_SCALE);
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.075 * k, 0.15 * k, 0.01 * k), new THREE.MeshStandardMaterial({ color: "#1b2329", roughness: 0.35 }));
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.066 * k, 0.136 * k), new THREE.MeshBasicMaterial({ color: "#d7e6ff", toneMapped: false }));
  glow.position.z = 0.0052 * k;
  g.add(body, glow);
  g.position.set(0, 0.06 * k, 0.02 * k);
  g.rotation.set(-1.2, 0, 0);
  g.name = "phone";
  return g;
}

export function Person({ look, action = "idle", speed = 0, phone = false }: { look: PersonLook; action?: PersonAction; /** 걷는 속도(m/s). 걷기 동작 빠르기를 여기에 맞춘다 */ speed?: number; phone?: boolean }) {
  const { scene, animations } = useGLTF(URL[look.model]);
  const k = (look.height ?? BASE_H) / BASE_H;
  const key = JSON.stringify(look);
  const root = useMemo(() => {
    const l = JSON.parse(key) as PersonLook;
    const s = cloneSkinned(scene) as THREE.Object3D;
    const paint: Record<string, string | undefined> = {
      Shirt: l.shirt,
      Pants: l.pants,
      Jacket: l.jacket,
      LightJacket: l.jacket,
      Dress: l.dress,
      Hair: l.hair,
      HairBase: l.hair,
      Eyebrows: l.hair,
      Skin: l.skin,
      Shoes: l.shoes,
      Socks: l.pants,
      Details: l.inner,
      TieTexture: l.tie,
    };
    s.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      // 뼈대로 움직이는 모형은 경계 상자가 원래 자세 기준이라, 화면 끝에서 잘려 사라지지 않게 한다
      m.frustumCulled = false;
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      const c = paint[mat.name];
      if (c) mat.color = new THREE.Color(c);
      mat.roughness = Math.max(mat.roughness ?? 0.8, 0.75);
      mat.metalness = 0;
      m.material = mat;
    });
    const hand = s.getObjectByName("PalmR");
    if (hand) hand.add(makePhone());
    return s;
  }, [scene, key]);

  useEffect(() => {
    const p = root.getObjectByName("phone");
    if (p) p.visible = phone;
  }, [root, phone]);

  // 동작 섞개는 이 사람 모형에 하나씩 둔다(drei useAnimations는 개발 모드 이중 실행 뒤 동작이 풀려 직접 만든다)
  const mixer = useMemo(() => new THREE.AnimationMixer(root), [root]);
  const cur = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    const src = animations.find((c) => c.name.endsWith(CLIP[action]));
    if (!src) return;
    const next = mixer.clipAction(src);
    if (cur.current === next) return;
    next.reset();
    next.setLoop(THREE.LoopRepeat, Infinity);
    if (action === "sit") next.time = SIT_FROM;
    next.play();
    if (cur.current) cur.current.crossFadeTo(next, 0.3, false);
    cur.current = next;
  }, [action, animations, mixer]);

  useEffect(
    () => () => {
      mixer.stopAllAction();
      cur.current = null;
    },
    [mixer],
  );

  useFrame((_, dt) => {
    const a = cur.current;
    if (a) a.setEffectiveTimeScale(action === "walk" && speed > 0 ? speed / (WALK_SPEED * k) : 1);
    mixer.update(Math.min(dt, 0.1));
    // 앉기 동작이 끝에서 처음(선 자세)으로 돌아가면, 그리기 전에 같은 장면 안에서 앉은 구간으로 되돌린다(선 자세가 한 장면 끼어 깜빡이던 것)
    if (a && action === "sit" && a.time < SIT_FROM) {
      a.time += SIT_FROM;
      mixer.update(0);
    }
  });

  return (
    <group>
      <group scale={MODEL_SCALE * k} dispose={null}>
        <primitive object={root} />
      </group>
      {look.backpack && action !== "sit" ? (
        <group position={[0, 1.02 * k, -0.17 * k]}>
          <mesh castShadow>
            <boxGeometry args={[0.3 * k, 0.38 * k, 0.14 * k]} />
            <meshStandardMaterial color={look.backpack} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.08 * k, -0.075 * k]} castShadow>
            <boxGeometry args={[0.24 * k, 0.16 * k, 0.03 * k]} />
            <meshStandardMaterial color={look.backpack} roughness={0.85} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

/** 키 비율(앉은 높이, 보폭 계산용) */
export function heightScale(look: PersonLook) {
  return (look.height ?? BASE_H) / BASE_H;
}

/** 의자에 앉은 사람. seat는 앉는 면 중심(y는 앉는 면 높이), rotationY는 앉은 사람이 보는 방향(0이면 +z) */
export function SeatedPerson({ seat, rotationY = 0, look, phone = false }: { seat: [number, number, number]; rotationY?: number; look: PersonLook; phone?: boolean }) {
  const [x, y, z] = seat;
  const k = heightScale(look);
  return (
    <group position={[x, Math.max(0, y - SIT_THIGH * k), z]} rotation={[0, rotationY, 0]}>
      <group position={[0, 0, SIT_BACK * k]}>
        <Person look={look} action="sit" phone={phone} />
      </group>
    </group>
  );
}

/** 서 있는 사람(접수 직원, 선생님) */
export function StandingPerson({ at, rotationY = 0, look }: { at: [number, number, number]; rotationY?: number; look: PersonLook }) {
  return (
    <group position={at} rotation={[0, rotationY, 0]}>
      <Person look={look} action="idle" />
    </group>
  );
}

for (const u of Object.values(URL)) useGLTF.preload(u);
