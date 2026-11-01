"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

/*
  사람 모형(Quaternius CC0, public/models/people/LICENSE.txt). 뼈대와 동작이 든 glb 두 벌을 옷 색만 바꿔 여러 사람으로 쓴다.
  - action: walk(걷기), idle(서서 쉬기), sit(앉아 있기). 바뀔 때 0.3초 겹쳐 넘긴다.
  - 모형은 원래 약 4.6 단위 키라 MODEL_SCALE로 줄여 약 1.6m로 맞춘다.
  - 걷기: 동작 속도 1일 때 땅을 딛는 발이 WALK_SPEED(m/s)로 뒤로 간다. 걷는 속도 / WALK_SPEED를 timeScale로 주면 발이 미끄러지지 않는다.
  - 앉기: Female_Sitting의 앉은 자세 구간(1초 뒤)만 되풀이한다. 앉은 자세에서 엉덩이(허벅지 아래)는 원점보다 SIT_THIGH 위, SIT_BACK 뒤에 있다.
    SeatedPerson은 앉는 면 중심과 높이를 받아 원점을 맞춰 준다.
*/

export type PersonLook = {
  model?: "a" | "b";
  shirt?: string;
  pants?: string;
  jacket?: string;
  hair?: string;
  shoes?: string;
};

export type PersonAction = "walk" | "idle" | "sit";

const URL = { a: "/models/people/person_a.glb", b: "/models/people/person_b.glb" } as const;

export const MODEL_SCALE = 0.36;
export const WALK_SPEED = 3.96 * MODEL_SCALE;
export const SIT_THIGH = 0.33;
export const SIT_BACK = 0.21;
const SIT_FROM = 1.0;

const CLIP = { walk: "Female_Walk", idle: "Female_Idle", sit: "Female_Sitting" } as const;

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

export function Person({ look = {}, action = "idle", timeScale = 1, phone = false }: { look?: PersonLook; action?: PersonAction; timeScale?: number; phone?: boolean }) {
  const model = look.model ?? "a";
  const { scene, animations } = useGLTF(URL[model]);
  const { shirt, pants, jacket, hair, shoes } = look;
  const root = useMemo(() => {
    const s = cloneSkinned(scene) as THREE.Object3D;
    const paint: Record<string, string | undefined> = { Shirt: shirt, Pants: pants, Jacket: jacket, LightJacket: jacket, Hair: hair, HairBase: hair, Shoes: shoes };
    s.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      // 뼈대로 움직이는 모형은 경계 상자가 원래 자세 기준이라, 화면 끝에서 잘려 사라지지 않게 한다
      m.frustumCulled = false;
      const src = m.material as THREE.MeshStandardMaterial;
      const mat = src.clone();
      const c = paint[mat.name];
      if (c) mat.color = new THREE.Color(c);
      mat.roughness = Math.max(mat.roughness ?? 0.8, 0.75);
      mat.metalness = 0;
      m.material = mat;
    });
    const hand = s.getObjectByName("PalmR");
    if (hand) {
      const p = makePhone();
      hand.add(p);
    }
    return s;
  }, [scene, shirt, pants, jacket, hair, shoes]);

  useEffect(() => {
    const p = root.getObjectByName("phone");
    if (p) p.visible = phone;
  }, [root, phone]);

  // 동작 섞개는 이 사람 모형에 하나씩 둔다(drei useAnimations는 개발 모드 이중 실행 뒤 동작이 풀려 직접 만든다)
  const mixer = useMemo(() => new THREE.AnimationMixer(root), [root]);
  const cur = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    const clip = animations.find((c) => c.name.endsWith(CLIP[action]));
    if (!clip) return;
    const next = mixer.clipAction(clip);
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
    if (a) {
      a.setEffectiveTimeScale(action === "walk" ? timeScale : 1);
      // 앉기 동작 앞부분(선 자세에서 앉는 중)은 다시 보이지 않게 건너뛴다
      if (action === "sit" && a.time < SIT_FROM) a.time = SIT_FROM;
    }
    mixer.update(Math.min(dt, 0.1));
  });

  return (
    <group scale={MODEL_SCALE} dispose={null}>
      <primitive object={root} />
    </group>
  );
}

/** 의자에 앉은 사람. seat는 앉는 면 중심(y는 앉는 면 높이), rotationY는 앉은 사람이 보는 방향(0이면 +z) */
export function SeatedPerson({ seat, rotationY = 0, look, phone = false }: { seat: [number, number, number]; rotationY?: number; look?: PersonLook; phone?: boolean }) {
  const [x, y, z] = seat;
  return (
    <group position={[x, Math.max(0, y - SIT_THIGH), z]} rotation={[0, rotationY, 0]}>
      <group position={[0, 0, SIT_BACK]}>
        <Person look={look} action="sit" phone={phone} />
      </group>
    </group>
  );
}

useGLTF.preload(URL.a);
useGLTF.preload(URL.b);
