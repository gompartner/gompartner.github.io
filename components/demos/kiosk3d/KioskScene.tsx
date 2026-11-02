"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, PerformanceMonitor, Preload, RoundedBox, useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Hand, Maximize2, Mouse, RotateCcw } from "lucide-react";
import { AcademyEntrance } from "./AcademyEntrance";
import { ClinicLobby } from "./ClinicLobby";
import { CAST, Person, SIT_BACK, SIT_THIGH, heightScale, type PersonLook } from "./People";
import { PLACES, type CameraShot, type Place, type PlaceConfig, type RoomProps, type Vec3 } from "./places";

/*
  키오스크 3D 장소.
  - 장소마다 방 부품(ROOMS)과 설정(places.ts)을 짝지어 그린다. 병원 로비(ClinicLobby)와 학원 입구(AcademyEntrance) 모두 위에서 내려다보는 잘라 낸 모형.
  - 이용 흐름 단계(steps)가 있으면 위에 단계 막대가 생기고, 사람 모형이 바닥 점선을 따라 걸어가며 단계마다 카메라가 그 자리로 옮긴다.
  - 키오스크 화면, 벽 TV, 원장 모니터는 그림이 아니라 실제 화면(children, tv, monitor)이다. 매 장면 화면 네 모서리를 투영해 원근 변환(matrix3d)으로 옮긴다.
  - 실제 화면 DOM은 캔버스 아래에 깔고, 3D에서는 화면 자리를 투명하게 뚫는다(HOLE 재질). 그래서 사람이나 물건이 화면 앞에 오면 그대로 화면을 가린다.
    키오스크 앞으로 다가간 동안에는 캔버스가 누르기를 받지 않아 아래 화면을 그대로 누를 수 있다.
  - 키오스크 단계(또는 키오스크를 누르면) 화면이 높이의 86%를 채우도록 다가가고, 그때부터 화면을 누를 수 있다.
  - 모션 줄이기면 카메라와 사람이 미끄러지지 않고 바로 옮기고, 자동 넘김을 켜지 않는다.
*/

export type { Place, PlaceConfig, RoomProps } from "./places";

const SCREEN_W = 0.54;
const SCREEN_H = 0.96;
/** 키오스크 받침 기준 화면 중심 높이와 앞면 거리 */
const SCREEN_CY = 1.26;
const SCREEN_CZ = 0.049;

const ROOMS: Record<Place, ComponentType<RoomProps>> = { clinic: ClinicLobby, academy: AcademyEntrance };

/** 원근 변환한 화면 DOM: 투명한 1px 테두리로 가장자리를 부드럽게, 뒷면은 숨긴다. will-change는 쓰지 않는다(크롬이 처음 배율로 굳혀 다가가면 글자가 흐려짐) */
const LAYER: React.CSSProperties = { outline: "1px solid transparent", backfaceVisibility: "hidden" };

/** 화면 자리 재질: 투명한 점을 써서(섞지 않음) 캔버스 아래 실제 화면 DOM이 보이게 한다. 앞에 있는 물건은 깊이 검사로 그대로 남는다 */
const HOLE = new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0, blending: THREE.NoBlending, depthWrite: true, toneMapped: false });

/** 판 하나(중심, 회전, 너비, 높이)에 화면 자리 구멍을 낸다. 판보다 2mm 앞에 둔다 */
function ScreenHole({ center, rotationY, w, h }: { center: Vec3; rotationY: number; w: number; h: number }) {
  const n = 0.002;
  return (
    <mesh position={[center[0] + Math.sin(rotationY) * n, center[1], center[2] + Math.cos(rotationY) * n]} rotation={[0, rotationY, 0]} material={HOLE}>
      <planeGeometry args={[w, h]} />
    </mesh>
  );
}

/* ---------------- 키오스크 ---------------- */

const METAL = { color: "#c4c8cc", metalness: 0.85, roughness: 0.32 } as const;

function KioskBody({ config, active, onOpen }: { config: PlaceConfig; active: boolean; onOpen: () => void }) {
  const { position, rotationY } = config.kiosk;
  const [hover, setHover] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hover && !active ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover, active]);
  const headH = 1.3;
  const headY = 0.56 + headH / 2;
  const below = SCREEN_CY - SCREEN_H / 2 - 0.1;
  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (!active) onOpen();
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* 바닥 받침판과 기둥(금속) */}
      <RoundedBox args={[0.56, 0.025, 0.44]} radius={0.01} smoothness={2} position={[0, 0.0125, -0.02]} castShadow receiveShadow>
        <meshStandardMaterial {...METAL} />
      </RoundedBox>
      <RoundedBox args={[0.16, 0.56, 0.1]} radius={0.04} smoothness={4} position={[0, 0.3, -0.02]} castShadow>
        <meshStandardMaterial {...METAL} />
      </RoundedBox>
      {/* 본체(둥근 흰 몸통, 뒤판은 회색) */}
      <RoundedBox args={[SCREEN_W + 0.1, headH, 0.09]} radius={0.035} smoothness={5} position={[0, headY, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f5f6f7" roughness={0.38} />
      </RoundedBox>
      <RoundedBox args={[SCREEN_W + 0.06, headH - 0.04, 0.02]} radius={0.008} smoothness={2} position={[0, headY, -0.05]}>
        <meshStandardMaterial color="#b8bdc2" roughness={0.5} metalness={0.3} />
      </RoundedBox>
      {/* 검은 유리 테두리 */}
      <RoundedBox args={[SCREEN_W + 0.035, SCREEN_H + 0.035, 0.004]} radius={0.0015} smoothness={2} position={[0, SCREEN_CY, 0.0455]}>
        <meshStandardMaterial color="#0e1013" roughness={0.12} metalness={0.2} />
      </RoundedBox>
      {/* 화면 자리. 투명하게 뚫어 캔버스 아래 실제 화면이 보이게 한다(ScreenProjector가 자리를 맞춘다) */}
      <mesh position={[0, SCREEN_CY, SCREEN_CZ - 0.0005]} material={HOLE}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
      </mesh>
      {/* 화면 아래: 카드 투입구, 번호표 출구, QR 읽는 창 */}
      <group position={[0, below, 0.046]}>
        <RoundedBox args={[0.17, 0.05, 0.02]} radius={0.006} smoothness={2} position={[-0.15, 0, 0.004]}>
          <meshStandardMaterial color="#2b3036" roughness={0.4} />
        </RoundedBox>
        <mesh position={[-0.15, 0, 0.0145]}>
          <boxGeometry args={[0.12, 0.006, 0.002]} />
          <meshStandardMaterial color="#050607" />
        </mesh>
        <RoundedBox args={[0.18, 0.035, 0.016]} radius={0.006} smoothness={2} position={[0.12, 0.005, 0.002]}>
          <meshStandardMaterial color="#d9dde1" roughness={0.4} />
        </RoundedBox>
        <mesh position={[0.12, 0.005, 0.0105]}>
          <boxGeometry args={[0.13, 0.004, 0.002]} />
          <meshStandardMaterial color="#1a1d21" />
        </mesh>
        <mesh position={[0.12, -0.07, 0.001]}>
          <boxGeometry args={[0.09, 0.05, 0.002]} />
          <meshStandardMaterial color="#141a1f" roughness={0.1} />
        </mesh>
      </group>
      {/* 위쪽 병원 색 띠 */}
      <mesh position={[0, SCREEN_CY + SCREEN_H / 2 + 0.07, 0.0455]}>
        <boxGeometry args={[SCREEN_W - 0.1, 0.012, 0.002]} />
        <meshStandardMaterial color={config.accent} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** 장소 설정에서 키오스크 화면 네 모서리(왼위, 오른위, 오른아래, 왼아래)와 화면 중심, 앞 방향을 구한다 */
function kioskScreen(config: PlaceConfig) {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...config.kiosk.position), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), config.kiosk.rotationY), new THREE.Vector3(1, 1, 1));
  const local = (x: number, y: number) => new THREE.Vector3(x, y, SCREEN_CZ + 0.001).applyMatrix4(m);
  const corners = [local(-SCREEN_W / 2, SCREEN_CY + SCREEN_H / 2), local(SCREEN_W / 2, SCREEN_CY + SCREEN_H / 2), local(SCREEN_W / 2, SCREEN_CY - SCREEN_H / 2), local(-SCREEN_W / 2, SCREEN_CY - SCREEN_H / 2)];
  const center = local(0, SCREEN_CY);
  const normal = new THREE.Vector3(Math.sin(config.kiosk.rotationY), 0, Math.cos(config.kiosk.rotationY));
  return { corners, center, normal };
}

function planeCorners(center: Vec3, rotationY: number, w: number, h: number) {
  const c = new THREE.Vector3(...center);
  const right = new THREE.Vector3(Math.cos(rotationY), 0, -Math.sin(rotationY));
  const up = new THREE.Vector3(0, 1, 0);
  const at = (sx: number, sy: number) => c.clone().addScaledVector(right, (sx * w) / 2).addScaledVector(up, (sy * h) / 2);
  return [at(-1, 1), at(1, 1), at(1, -1), at(-1, -1)];
}

// 네 점을 잇는 원근 변환(호모그래피)을 CSS matrix3d로 만든다. 사각형 w x h를 화면의 네 점 q0..q3(왼위, 오른위, 오른아래, 왼아래)에 맞춘다
type P2 = [number, number];

function solveH(src: P2[], q: P2[]) {
  const A: number[][] = [];
  const B: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    B.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    B.push(v);
  }
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [B[c], B[p]] = [B[p], B[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      B[r] -= f * B[c];
    }
  }
  return B.map((v, i) => v / A[i][i]);
}

function quadMatrix(w: number, h: number, q: P2[]) {
  const [a, b, c, d, e, f, g, hh] = solveH([[0, 0], [w, 0], [w, h], [0, h]], q);
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}

// 화면 네 모서리를 매 장면 투영해 실제 화면 DOM을 그 자리에 옮긴다. 뒤를 보거나 카메라 뒤로 가면 숨긴다
/* eslint-disable react-hooks/immutability -- useFrame 안에서 화면 DOM의 style을 매 장면 바꾸는 것이 이 부품의 목적이다(React 상태를 거치지 않음) */
function ScreenProjector({ target, corners, px }: { target: React.RefObject<HTMLDivElement | null>; corners: THREE.Vector3[]; px: [number, number] }) {
  const { camera, size } = useThree();
  const tmp = useRef({ v: new THREE.Vector3(), n: new THREE.Vector3(), d: new THREE.Vector3() });
  useFrame(() => {
    const el = target.current;
    if (!el) return;
    const { v, n, d } = tmp.current;
    // 둘러보기 조작과 카메라 이동(우선순위 -1, -2)이 이 장면에서 옮긴 카메라 자리를 행렬에 반영한 뒤 투영한다.
    // 이것을 빼면 행렬이 그리기 직전에야 바뀌어, 화면 DOM이 한 장면 늦게 따라오며 테두리와 어긋난다
    camera.updateMatrixWorld();
    n.subVectors(corners[1], corners[0]).cross(d.subVectors(corners[3], corners[0]));
    d.subVectors(camera.position, corners[0]);
    if (n.dot(d) > 0) {
      el.style.visibility = "hidden";
      return;
    }
    const q: [number, number][] = [];
    for (const p of corners) {
      v.copy(p).project(camera);
      if (v.z > 1) {
        el.style.visibility = "hidden";
        return;
      }
      q.push([((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height]);
    }
    el.style.visibility = "visible";
    el.style.transform = quadMatrix(px[0], px[1], q);
  });
  return null;
}
/* eslint-enable react-hooks/immutability */

/* ---------------- 카메라 ---------------- */

/* eslint-disable react-hooks/immutability -- useFrame 안에서 카메라와 둘러보기 조작(three 객체)을 매 장면 직접 옮기는 것이 이 부품의 목적이다 */
// shot이 바뀌면 둘러보기 조작을 잠시 끄고 카메라를 그 자리로 옮긴 뒤, 도착하면 그 자리를 중심으로 다시 끌어서 돌려 볼 수 있게 넘긴다
function CameraRig({ shot, locked, reduced, controls, resetKey = 0 }: { shot: CameraShot; locked: boolean; reduced: boolean; controls: React.RefObject<OrbitControlsImpl | null>; resetKey?: number }) {
  const camera = useThree((s) => s.camera);
  const state = useRef({ moving: true, look: new THREE.Vector3(...shot.target), pos: new THREE.Vector3(), tgt: new THREE.Vector3(), key: "" });
  // 우선순위 -2: 화면 투영(ScreenProjector, 이름표)보다 먼저 카메라를 옮겨 같은 장면 안에서 맞춘다(한 장면 늦게 따라오며 튀는 것 방지)
  useFrame((_, rawDt) => {
    // 한 장면이 늦게 그려져도(셰이더 준비 등) 카메라가 크게 건너뛰지 않게 한 장면 시간을 1/30초로 묶는다
    const dt = Math.min(rawDt, 1 / 30);
    const s = state.current;
    const c = controls.current;
    const key = `${shot.position.join(",")}|${shot.target.join(",")}|${locked}|${resetKey}`;
    if (key !== s.key) {
      s.key = key;
      s.moving = true;
      s.pos.set(...shot.position);
      s.tgt.set(...shot.target);
      if (c) s.look.copy(c.target);
    }
    if (!s.moving) return;
    if (c) c.enabled = false;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.2);
    camera.position.lerp(s.pos, k);
    s.look.lerp(s.tgt, k);
    camera.lookAt(s.look);
    if (camera.position.distanceTo(s.pos) < 0.004 && s.look.distanceTo(s.tgt) < 0.004) {
      camera.position.copy(s.pos);
      camera.lookAt(s.tgt);
      s.moving = false;
      if (c) {
        c.target.copy(s.tgt);
        c.enabled = !locked;
        // update()는 거리 제한을 적용하므로 화면 앞에 붙는 잠긴 자리에서는 부르지 않는다
        if (!locked) c.update();
      }
    }
  }, -2);
  return null;
}
/* eslint-enable react-hooks/immutability */

/* ---------------- 이용 흐름: 바닥 점선, 사람, 이름표 ---------------- */

function pathLengths(path: Vec3[]) {
  const acc = [0];
  for (let i = 1; i < path.length; i++) {
    const [ax, , az] = path[i - 1];
    const [bx, , bz] = path[i];
    acc.push(acc[i - 1] + Math.hypot(bx - ax, bz - az));
  }
  return acc;
}

function pointAt(path: Vec3[], acc: number[], s: number): [number, number, number] {
  for (let i = 1; i < path.length; i++) {
    if (s <= acc[i] || i === path.length - 1) {
      const seg = acc[i] - acc[i - 1] || 1;
      const t = Math.min(1, Math.max(0, (s - acc[i - 1]) / seg));
      const [ax, , az] = path[i - 1];
      const [bx, , bz] = path[i];
      return [ax + (bx - ax) * t, az + (bz - az) * t, Math.atan2(bx - ax, bz - az)];
    }
  }
  return [path[0][0], path[0][2], 0];
}

function PathDashes({ path, color }: { path: Vec3[]; color: string }) {
  const dashes = useMemo(() => {
    const out: { x: number; z: number; r: number }[] = [];
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      // 되돌아가는 구간(의자에서 일어나 나오는 길)은 한 번만 그린다
      const prev = path[i - 2];
      if (prev && prev[0] === b[0] && prev[2] === b[2]) continue;
      const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
      const r = Math.atan2(b[0] - a[0], b[2] - a[2]);
      for (let t = 0.12; t < len - 0.06; t += 0.3) {
        out.push({ x: a[0] + ((b[0] - a[0]) * t) / len, z: a[2] + ((b[2] - a[2]) * t) / len, r });
      }
    }
    return out;
  }, [path]);
  return (
    <group>
      {dashes.map((d, i) => (
        <mesh key={i} position={[d.x, 0.006, d.z]} rotation={[-Math.PI / 2, 0, d.r]}>
          <planeGeometry args={[0.06, 0.16]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

const FIGURE_SPEED = 1.2;
/** 장소마다 걷는 사람(병원은 환자, 학원은 가방 멘 학생) */
const WALKERS: Record<Place, PersonLook> = { clinic: CAST.patient, academy: CAST.student };

/* eslint-disable react-hooks/immutability -- useFrame 안에서 사람 모형(three 객체)의 자리와 방향을 매 장면 직접 옮긴다 */
// 걷는 사람. 길을 따라 걸을 때는 걷기 동작(속도에 맞춘 빠르기), 멈추면 서서 쉬기, sit이면 그 점(앉는 면 중심)에 앉는다
function Figure({ look, path, at, facing, sit, seat, seatBack, phone, hidden, reduced, accent, g }: { look: PersonLook; path: Vec3[]; at: number; facing: number; sit: boolean; seat: number; seatBack: number; phone: boolean; hidden: boolean; reduced: boolean; accent: string; g: React.RefObject<THREE.Group | null> }) {
  const hk = heightScale(look);
  const acc = useMemo(() => pathLengths(path), [path]);
  const body = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const st = useRef({ s: 0, yaw: Math.PI, k: 0 });
  const [mode, setMode] = useState<"walk" | "idle" | "sit">("idle");
  useFrame((_, dt) => {
    const grp = g.current;
    const b = body.current;
    if (!grp || !b) return;
    const s = st.current;
    const goal = acc[Math.min(at, acc.length - 1)] ?? 0;
    // 앞 단계로 돌아가면 걸어서 되돌아가지 않고 바로 옮긴다
    if (reduced || goal < s.s - 0.01) s.s = goal;
    else s.s = Math.min(goal, s.s + dt * FIGURE_SPEED);
    const walking = goal - s.s > 0.01;
    const seated = sit && !walking;
    const want = walking ? "walk" : seated ? "sit" : "idle";
    if (want !== mode) setMode(want);
    const [x, z, dir] = pointAt(path, acc, s.s);
    const wantYaw = walking ? dir : facing;
    let dy = wantYaw - s.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    s.yaw += reduced ? dy : dy * Math.min(1, dt * 7);
    // 앉을 때는 의자 앞에 선 자리에서 몸을 앉는 면 높이와 앉는 면 중심(seatBack만큼 뒤)으로 옮긴다(SeatedPerson과 같은 계산)
    const wantK = seated ? 1 : 0;
    s.k += reduced ? wantK - s.k : (wantK - s.k) * Math.min(1, dt * 5);
    grp.position.set(x, 0, z);
    grp.rotation.y = s.yaw;
    b.position.set(0, Math.max(0, seat - SIT_THIGH * hk) * s.k, (SIT_BACK * hk - seatBack) * s.k);
    if (ring.current) ring.current.visible = !seated;
    grp.visible = !hidden;
  }, -1);
  return (
    <group ref={g}>
      {/* 발밑 원 */}
      <mesh ref={ring} position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.29, 40]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} />
      </mesh>
      <group ref={body}>
        <Person look={look} action={mode} speed={FIGURE_SPEED} phone={phone} />
      </group>
    </group>
  );
}

/* eslint-enable react-hooks/immutability */

const CTRL_ICON = "flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#15171c] shadow-[0_6px_16px_rgba(0,0,0,.15)] hover:bg-white";
const CTRL = "flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-[13px] font-bold text-[#15171c] shadow-[0_6px_16px_rgba(0,0,0,.15)] hover:bg-white";

/** 끌어서 옮길 때 보는 점이 방 밖으로 나가지 않게 묶는다(카메라도 같은 만큼 옮겨 회전 각도는 그대로) */
const ROOM_BOUNDS = { x: [-4.6, 4.6], y: [0, 2.2], z: [-3.2, 3.2] } as const;
const clampTmp = new THREE.Vector3();
function clampToRoom(c: OrbitControlsImpl | null) {
  if (!c || !c.enabled) return;
  const t = c.target;
  clampTmp.set(THREE.MathUtils.clamp(t.x, ROOM_BOUNDS.x[0], ROOM_BOUNDS.x[1]), THREE.MathUtils.clamp(t.y, ROOM_BOUNDS.y[0], ROOM_BOUNDS.y[1]), THREE.MathUtils.clamp(t.z, ROOM_BOUNDS.z[0], ROOM_BOUNDS.z[1]));
  if (clampTmp.equals(t)) return;
  clampTmp.sub(t);
  t.add(clampTmp);
  c.object.position.add(clampTmp);
}

const PILL = "whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-bold leading-none text-[#1f2b33] shadow-[0_2px_8px_rgba(20,30,40,.18)]";
const PILL_ON = "whitespace-nowrap rounded-full bg-(--acc) px-2.5 py-1 text-[12px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(20,30,40,.25)]";

function DimensionLine({ from, to, color, show }: { from: Vec3; to: Vec3; color: string; show: boolean }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const r = Math.atan2(b.x - a.x, b.z - a.z);
  return (
    <group position={[mid.x, 0.01, mid.z]} rotation={[0, r, 0]} visible={show}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, len]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {[-len / 2, len / 2].map((zz) => (
        <mesh key={zz} position={[0, 0, zz]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 0.02]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

type Label = { key: string; at: Vec3; kind: "pin" | "callout" | "dim"; text: string; show: boolean; on?: boolean; onClick?: () => void };

// 이름표 DOM을 매 장면 세계 좌표에 맞춰 옮긴다(drei Html은 떼었다 붙일 때 React 루트 오류가 나서 직접 투영한다)
function Anchors({ labels, els }: { labels: Label[]; els: React.RefObject<(HTMLElement | null)[]> }) {
  const { camera, size } = useThree();
  const v = useRef(new THREE.Vector3());
  useFrame(() => {
    camera.updateMatrixWorld();
    labels.forEach((l, i) => {
      const el = els.current[i];
      if (!el) return;
      const p = v.current.set(...l.at).project(camera);
      if (p.z > 1 || Math.abs(p.x) > 1.2 || Math.abs(p.y) > 1.2) {
        el.style.visibility = "hidden";
        return;
      }
      el.style.visibility = "";
      el.style.transform = `translate3d(${(((p.x + 1) / 2) * size.width).toFixed(1)}px, ${(((1 - p.y) / 2) * size.height).toFixed(1)}px, 0)`;
    });
  });
  return null;
}

function LabelView({ l }: { l: Label }) {
  const fade = `transition-opacity duration-300 motion-reduce:transition-none ${l.show ? "opacity-100" : "pointer-events-none opacity-0"}`;
  if (l.kind === "pin")
    return (
      <button type="button" onClick={l.onClick} tabIndex={l.show ? 0 : -1} aria-hidden={!l.show} aria-label={`${l.text} 보기`} className={`${fade} ${l.show ? "pointer-events-auto" : ""} flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-(--acc) text-[13px] font-bold text-white shadow-[0_2px_8px_rgba(20,30,40,.3)]`}>
        {l.key.slice(4)}
      </button>
    );
  if (l.kind === "dim") return <span aria-hidden={!l.show} className={`${fade} block -translate-x-1/2 -translate-y-1/2 ${PILL_ON}`}>{l.text}</span>;
  return (
    <div aria-hidden={!l.show} className={`${fade} flex -translate-x-1/2 -translate-y-full flex-col items-center`}>
      <span className={l.on ? PILL_ON : PILL}>{l.text}</span>
      <span className="h-3 w-px bg-[#1f2b33]/40" />
    </div>
  );
}

/* ---------------- 휴대폰 단계 막대 채우기 ---------------- */

// from에서 to까지 ms 동안 막대 배경을 왼쪽부터 채운다(ms가 0이면 바로 to)
function ProgressFill({ from, to, ms }: { from: number; to: number; ms: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!ms || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.transform = `scaleX(${to})`;
      return;
    }
    const a = el.animate([{ transform: `scaleX(${from})` }, { transform: `scaleX(${to})` }], { duration: ms, easing: "linear", fill: "forwards" });
    return () => a.cancel();
  }, [from, to, ms]);
  return <span ref={ref} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-full origin-left bg-(--acc)/16" style={{ transform: `scaleX(${from})` }} />;
}

/* ---------------- 다음 장면까지 남은 시간 ---------------- */

// 자동 넘김이 켜져 있을 때 "3초"처럼 남은 초를 보여 준다. key로 장면마다 새로 센다
function Countdown({ timer, className = "" }: { timer: { at: number; ms: number }; className?: string }) {
  const left = () => Math.max(0, Math.ceil((timer.at + timer.ms - performance.now()) / 1000));
  const [sec, setSec] = useState(left);
  useEffect(() => {
    const id = window.setInterval(() => setSec(left()), 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timer는 key로 바뀌므로 처음 값만 쓴다
  }, []);
  return (
    <span className={`shrink-0 whitespace-nowrap tabular-nums ${className}`} aria-hidden>
      {sec}초
    </span>
  );
}

/* ---------------- 불러오는 동안 ---------------- */

// 곰파트너 곰이 위아래로 살짝 움직이고, 아래에 불러온 비율을 보여 준다. 다 불러오면 0.5초 동안 흐려지며 사라진다
function Loading({ ready, progress }: { ready: boolean; progress: number }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setGone(true), 600);
    return () => window.clearTimeout(t);
  }, [ready]);
  if (gone) return null;
  const pct = Math.round(ready ? 100 : Math.min(99, progress));
  return (
    <div className={`pointer-events-none absolute inset-0 z-[45] flex flex-col items-center justify-center gap-4 bg-(--bg) transition-opacity duration-500 motion-reduce:transition-none ${ready ? "opacity-0" : "opacity-100"}`} aria-live="polite">
      <style>{"@keyframes kiosk-bear-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@media (prefers-reduced-motion: reduce){.kiosk-bear{animation:none!important}}"}</style>
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 내보내기 사이트라 next/image 최적화를 쓰지 않는다 */}
      <img src="/images/bear-avatar.webp" alt="" width={96} height={96} className="kiosk-bear h-24 w-24 select-none rounded-full shadow-[0_6px_16px_rgba(20,30,40,.12)]" style={{ animation: "kiosk-bear-bob 1.6s ease-in-out infinite" }} draggable={false} />
      <div className="flex w-[200px] flex-col items-center gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-(--acc) transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[13px] font-bold text-[#3d4450]">
          3D 공간 준비 중 <span className="tabular-nums">{pct}%</span>
        </p>
      </div>
    </div>
  );
}

/* ---------------- 장면 ---------------- */

const DWELL: Record<string, number> = { kiosk: 6500 };

/**
 * 장소 안의 키오스크. children은 450x800 크기로 그린 실제 키오스크 화면.
 * tv: 병원 로비 벽 TV에 띄울 화면(640x352 px로 그림).
 * monitor: 학원 원장실 책상 모니터에 띄울 관리자 화면(1280x720 px로 그림).
 * phone: 휴대폰 알림 단계에서 옆에 띄울 실제 휴대폰 화면(없으면 3D 이름표만 보인다).
 * zoomSignal: 숫자가 바뀔 때마다 키오스크 앞으로 다가간다(바깥 버튼, 학생증 태그 등에서 쓰기).
 * paused: 장면이 가려져 있을 때 그리기와 자동 넘김을 멈춘다.
 */
export function KioskScene({ place, children, tv, phone, monitor, className = "", zoomSignal = 0, paused = false }: { place: Place; children: ReactNode; tv?: ReactNode; phone?: ReactNode; monitor?: ReactNode; className?: string; zoomSignal?: number; paused?: boolean }) {
  const config = PLACES[place];
  const Room = ROOMS[place];
  const steps = config.steps;
  const kioskIdx = steps.findIndex((s) => s.camera === "kiosk");
  const screenRef = useRef<HTMLDivElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const monRef = useRef<HTMLDivElement>(null);
  const controls = useRef<OrbitControlsImpl>(null);
  const figRef = useRef<THREE.Group>(null);
  const labelEls = useRef<(HTMLElement | null)[]>([]);
  const [step, setStep] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const [figAt, setFigAt] = useState(0);
  const [auto, setAuto] = useState(false);
  // 재생 버튼으로 멈췄는지(전체 보기로 돌아와도 다시 재생하지 않는다)
  const [held, setHeld] = useState(false);
  // 자동 넘김을 다시 시작할 때 이어 갈 단계
  const resume = useRef(0);
  const [hint, setHint] = useState(true);
  const [touch, setTouch] = useState(false);
  // 11-02 휴대폰 폭: 단계 막대는 번호만, 장면 설명표와 조작 안내는 숨기고 버튼은 아이콘만
  const [narrow, setNarrow] = useState(false);
  const [timer, setTimer] = useState<{ at: number; ms: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const { active: loadingNow, progress } = useProgress();
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [dprState, setDpr] = useState(() => (typeof window === "undefined" ? 1.5 : Math.min(2, Math.max(1.5, window.devicePixelRatio || 1))));
  const active = zoom;

  const ks = useMemo(() => kioskScreen(config), [config]);
  const tvCorners = useMemo(() => (config.tv ? planeCorners(config.tv.center, config.tv.rotationY, config.tv.w, config.tv.h) : null), [config]);
  const monCorners = useMemo(() => (config.monitor ? planeCorners(config.monitor.center, config.monitor.rotationY, config.monitor.w, config.monitor.h) : null), [config]);
  const kioskShot = useMemo<CameraShot>(() => {
    const fov = 38;
    const dist = SCREEN_H / 2 / Math.tan(((fov / 2) * Math.PI) / 180) / 0.86;
    const p = ks.center.clone().addScaledVector(ks.normal, dist);
    return { position: [p.x, p.y, p.z], target: [ks.center.x, ks.center.y, ks.center.z] };
  }, [ks]);

  const go = (i: number | null) => {
    setStep(i);
    if (i === null) {
      setZoom(false);
      return;
    }
    resume.current = (i + 1) % Math.max(1, steps.length);
    setZoom(steps[i].camera === "kiosk");
    setFigAt(steps[i].at);
  };
  // 사용자가 직접 고르거나 키오스크로 다가가면 자동 넘김을 멈춘다
  const pick = (i: number) => {
    setAuto(false);
    go(i);
  };
  const open = () => {
    setAuto(false);
    if (kioskIdx >= 0) go(kioskIdx);
    else setZoom(true);
  };
  // 전체 보기(Esc와 같음): 전체 장면으로 돌아와, 재생 버튼으로 멈춘 게 아니면 지금 단계 다음부터 다시 자동 넘김
  const leave = () => {
    go(null);
    if (!held && !reduced && steps.length) setAuto(true);
  };
  // 정면 보기: 지금 장면(전체 또는 단계)의 처음 카메라 자리로 되돌린다
  const resetView = () => setResetKey((k) => k + 1);

  useEffect(() => {
    if (!zoomSignal) return;
    const f = requestAnimationFrame(() => {
      setAuto(false);
      if (kioskIdx >= 0) {
        setStep(kioskIdx);
        setFigAt(steps[kioskIdx].at);
      }
      setZoom(true);
    });
    return () => cancelAnimationFrame(f);
  }, [zoomSignal, kioskIdx, steps]);
  useEffect(() => {
    const f = requestAnimationFrame(() => {
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      setTouch(window.matchMedia("(pointer: coarse)").matches);
    });
    const mq = window.matchMedia("(max-width: 639px)");
    const f2 = requestAnimationFrame(() => setNarrow(mq.matches));
    const on = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener("change", on);
    return () => {
      cancelAnimationFrame(f);
      cancelAnimationFrame(f2);
      mq.removeEventListener("change", on);
    };
  }, []);
  // 모델, 텍스처, HDRI를 다 불러오면 준비 완료. 그때부터 자동 넘김을 시작한다(모션 줄이기면 시작하지 않음)
  useEffect(() => {
    if (ready || loadingNow || progress < 100) return;
    // 다 불러온 뒤에도 첫 그리기(셰이더, 텍스처 올리기)와 화면 맞추기가 끝나도록 0.7초 더 덮어 둔다
    const t = window.setTimeout(() => {
      setReady(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && steps.length) setAuto(true);
    }, 700);
    return () => window.clearTimeout(t);
  }, [ready, loadingNow, progress, steps.length]);
  useEffect(() => {
    if (step === null && !zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  // 자동 넘김: 전체 장면에서 잠시 머문 뒤 이어 갈 단계부터 차례로, 마지막 단계 뒤에는 전체 장면으로 돌아간다.
  // 의존 값을 적어 둔다: 바깥 데모가 시계 때문에 1초마다 다시 그려도 타이머가 처음부터 다시 시작하지 않게(예전에는 이것 때문에 첫 단계로 넘어가지 못했다)
  const stepId = step === null ? null : steps[step]?.id;
  useEffect(() => {
    if (!auto || !ready || !steps.length) return;
    // 병원 데모는 접수 중(paused)에 장면을 멈춘다. 다가간 키오스크 화면을 쓰는 중일 때만 기다리고, 처음 자동 재생은 막지 않는다
    if (paused && zoom) return;
    const wait = step === null ? 2600 : (DWELL[stepId ?? ""] ?? 4800);
    // 11-02 다음 장면까지 남은 시간 표시용
    const at = performance.now();
    const f = requestAnimationFrame(() => setTimer({ at, ms: wait }));
    const t = window.setTimeout(() => {
      if (step === null) go(resume.current);
      else if (step + 1 < steps.length) go(step + 1);
      else {
        resume.current = 0;
        go(null);
      }
    }, wait);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(f);
      setTimer(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go는 매번 새로 만들어지지만 안에서 쓰는 값은 위 의존 값뿐이다
  }, [auto, ready, paused, zoom, step, stepId, steps.length]);

  const cur = step !== null ? steps[step] : null;
  const labels: Label[] = [
    ...steps.map((s, i): Label => ({ key: `pin-${i + 1}`, at: [config.path[s.at][0], 0.05, config.path[s.at][2]], kind: "pin", text: `${i + 1}단계 ${s.label}`, show: !zoom && step === null, onClick: () => pick(i) })),
    ...config.callouts.map((c): Label => ({ key: `c-${c.text}`, at: c.at, kind: "callout", text: c.text, on: !!c.step, show: !narrow && !zoom && (cur ? c.step === cur.id : !c.step) })),
    ...(config.dimensions ?? []).map((d): Label => ({ key: `d-${d.text}`, at: [(d.from[0] + d.to[0]) / 2, 0.05, (d.from[2] + d.to[2]) / 2], kind: "dim", text: d.text, show: !narrow && !zoom && (cur ? d.step === cur.id : !d.step) })),
  ];
  const shot: CameraShot = zoom ? kioskShot : cur && cur.camera !== "kiosk" ? cur.camera : config.view;
  // 끌기, 휠, 두 손가락으로 장면을 만지면 자동 넘김을 멈추고 조작 안내를 접는다
  const touched = () => {
    setAuto(false);
    setHint(false);
  };
  const lit = !!config.hdri;

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ background: config.background, ["--acc" as string]: config.accent, ["--bg" as string]: config.background } as React.CSSProperties}>
      <Canvas
        onWheel={() => setHint(false)}
        // 바깥 데모가 멈춰 달라고 해도(병원 접수 중) 키오스크 앞에 있을 때만 그리기를 멈춘다. 전체 장면으로 나오면 바로 다시 그린다
        frameloop={paused && zoom ? "never" : "always"}
        shadows="percentage"
        // 화면 배율 1인 모니터에서도 1.5배로 그려 계단 현상을 줄이고, 느려지면 PerformanceMonitor가 1로 내린다
        dpr={dprState}
        camera={{ position: config.view.position, fov: 38, near: 0.05, far: 60 }}
        gl={{ antialias: true, alpha: true }}
        // 키오스크 앞에서는 캔버스가 누르기를 받지 않아 아래 실제 화면을 누를 수 있다
        style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: zoom ? "none" : "auto" }}
      >
        <color attach="background" args={[config.background]} />
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        {lit ? (
          <>
            <hemisphereLight args={["#ffffff", "#e6dfd3", 0.35]} />
            <directionalLight
              position={[-5, 9, 6]}
              intensity={1.6}
              color="#fff6ea"
              castShadow
              // 그림자 범위를 방(10 x 7m)에 딱 맞춰 같은 2048 지도로도 그림자 가장자리가 덜 각지게 한다
              shadow-mapSize={[2048, 2048]}
              shadow-bias={-0.0002}
              shadow-normalBias={0.025}
              shadow-radius={3}
              shadow-camera-left={-6.6}
              shadow-camera-right={6.6}
              shadow-camera-top={6.6}
              shadow-camera-bottom={-6.6}
              shadow-camera-near={4}
              shadow-camera-far={22}
            />
          </>
        ) : (
          <>
            <hemisphereLight args={["#ffffff", "#d9d2c6", 1.1]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[-3, 5, 3]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
          </>
        )}
        <Suspense fallback={null}>
          {lit ? (
            <Environment files={config.hdri} environmentIntensity={0.85} />
          ) : (
            <Environment resolution={128}>
              <Lightformer form="rect" intensity={2} position={[-4, 2, 1]} scale={[3, 2, 1]} />
              <Lightformer form="rect" intensity={1} position={[3, 3, 4]} scale={[4, 2, 1]} />
            </Environment>
          )}
          <Room config={config} />
          {/* 처음 불러올 때 숨은 물건(휴대폰, 치수선 등)까지 셰이더를 미리 준비해, 단계를 바꿀 때 멈칫하지 않게 한다 */}
          <Preload all />
        </Suspense>
        <KioskBody config={config} active={active} onOpen={open} />
        <ScreenProjector target={screenRef} corners={ks.corners} px={[450, 800]} />
        {tv && config.tv && tvCorners ? (
          <>
            <ScreenHole {...config.tv} />
            <ScreenProjector target={tvRef} corners={tvCorners} px={[640, 352]} />
          </>
        ) : null}
        {monitor && config.monitor && monCorners ? (
          <>
            <ScreenHole {...config.monitor} />
            <ScreenProjector target={monRef} corners={monCorners} px={[1280, 720]} />
          </>
        ) : null}
        {lit ? null : <ContactShadows position={[0, 0.005, 0]} opacity={0.35} scale={10} blur={2.4} far={3} />}
        {steps.length ? (
          <>
            <PathDashes path={config.path} color={config.accent} />
            <Figure look={WALKERS[place]} path={config.path} at={figAt} facing={cur?.facing ?? Math.PI} sit={cur?.pose === "sit"} seat={cur?.seat ?? 0.45} seatBack={cur?.seatBack ?? 0} phone={cur?.card === "phone"} hidden={zoom} reduced={reduced} accent={config.accent} g={figRef} />
            {(config.dimensions ?? []).map((d) => (
              <DimensionLine key={d.text} from={d.from} to={d.to} color={config.accent} show={!zoom && (cur ? d.step === cur.id : !d.step)} />
            ))}
            <Anchors labels={labels} els={labelEls} />
          </>
        ) : null}
        {/* 보통 3D 보기 조작: 왼쪽 끌기 회전, 휠과 두 손가락 확대, 오른쪽 끌기와 두 손가락 끌기 이동(방 안으로 묶음) */}
        <OrbitControls
          ref={controls}
          enabled={false}
          enableDamping
          enablePan
          screenSpacePanning
          onStart={touched}
          onChange={() => clampToRoom(controls.current)}
          dampingFactor={0.08}
          rotateSpeed={0.55}
          zoomSpeed={0.6}
          minDistance={config.view.distance[0]}
          maxDistance={config.view.distance[1]}
          minPolarAngle={config.view.polar[0]}
          maxPolarAngle={config.view.polar[1]}
          minAzimuthAngle={config.view.azimuth[0]}
          maxAzimuthAngle={config.view.azimuth[1]}
        />
        <CameraRig shot={shot} locked={zoom} reduced={reduced} controls={controls} resetKey={resetKey} />
      </Canvas>
      {tv && tvCorners ? (
        <div ref={tvRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-[1] origin-top-left overflow-hidden" style={{ width: 640, height: 352, visibility: "hidden", ...LAYER }}>
          {tv}
        </div>
      ) : null}
      {monitor && monCorners ? (
        <div ref={monRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-[1] origin-top-left overflow-hidden bg-white" style={{ width: 1280, height: 720, visibility: "hidden", ...LAYER }}>
          {monitor}
        </div>
      ) : null}
      {/* 실제 키오스크 화면. 캔버스 아래에 깔고 3D 화면 자리(투명한 구멍)에 원근을 맞춘다. 다가가기 전에는 캔버스가 누르기를 받아 키오스크로 다가간다 */}
      <div
        ref={screenRef}
        className="absolute left-0 top-0 z-[1] origin-top-left overflow-hidden rounded-[3px] bg-white"
        style={{ width: 450, height: 800, visibility: "hidden", ...LAYER }}
        // 다가간 키오스크 화면을 누르기 시작하면 자동 넘김을 멈춘다(쓰는 중에 다음 단계로 넘어가지 않게)
        onPointerDownCapture={() => setAuto(false)}
        onClickCapture={(e) => {
          if (!active) {
            e.stopPropagation();
            e.preventDefault();
            open();
          }
        }}
        role={active ? undefined : "button"}
        aria-label={active ? undefined : "키오스크 사용해 보기"}
        tabIndex={active ? -1 : 0}
        onKeyDown={(e) => {
          if (!active && (e.key === "Enter" || e.key === " ")) open();
        }}
      >
        <div style={{ pointerEvents: active ? "auto" : "none" }} className="h-full w-full">
          {children}
        </div>
      </div>

      {labels.length ? (
        <div className="pointer-events-none absolute inset-0 z-[20] overflow-hidden">
          {labels.map((l, i) => (
            <div
              key={l.key}
              ref={(el) => {
                labelEls.current[i] = el;
              }}
              className="absolute left-0 top-0"
              style={{ visibility: "hidden" }}
            >
              <LabelView l={l} />
            </div>
          ))}
        </div>
      ) : null}

      {ready && steps.length && !zoom ? (
        <nav aria-label="이용 흐름" className="absolute left-1/2 top-3 z-[40] flex w-[calc(100%-24px)] max-w-[480px] -translate-x-1/2 items-stretch gap-1 overflow-hidden rounded-2xl bg-white/95 p-1 shadow-[0_6px_18px_rgba(20,30,40,.14)]">
          <style>{"@keyframes kiosk-next{from{transform:scaleX(0)}to{transform:scaleX(1)}}"}</style>
          <ol className={`relative z-[1] flex shrink-0 items-stretch ${narrow ? "gap-0" : "gap-1"}`}>
            {steps.map((s, i) => {
              const on = step === i;
              const done = step !== null && i < step;
              return (
                <li key={s.id} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    aria-current={on ? "step" : undefined}
                    aria-label={`${i + 1}단계 ${s.label}`}
                    className={`flex h-full w-full items-center rounded-xl py-1.5 ${narrow ? "px-1" : "px-1.5"}`}
                  >
                    {/* 지난 단계와 지금 단계는 색을 채운 번호, 남은 단계는 테두리만. 지금 단계 이름은 번호 옆 한 곳에만 */}
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${on || done ? "bg-(--acc) text-white" : "border border-[#c9d1d6] bg-white/70 text-[#7a858d]"}`}>{i + 1}</span>
                    
                  </button>
                </li>
              );
            })}
          </ol>
          <p aria-hidden className={`relative z-[1] flex min-w-0 flex-1 items-center font-extrabold leading-tight tracking-[-0.02em] text-[#0f1d24] ${narrow ? "px-1.5 text-[13px]" : "px-3 text-[15px]"}`}>
            <span className="line-clamp-2 break-keep">{cur ? cur.label : "이용 흐름"}</span>
          </p>
          {auto && timer ? <Countdown key={timer.at} timer={timer} className="relative z-[1] self-center px-1 text-[12px] font-bold text-[#5b6670]" /> : null}
          {/* 막대 전체가 진행만큼 색으로 차오른다(지난 단계까지 + 지금 단계는 다음 장면까지 이어서) */}
          <ProgressFill key={`p-${step}-${timer?.at ?? "x"}`} from={step === null ? 0 : step / steps.length} to={step === null ? 0 : (step + (auto && timer ? 1 : 0.5)) / steps.length} ms={auto && timer ? timer.ms : 0} />
          <button
            type="button"
            data-autoplay
            onClick={() => {
              if (auto) {
                setAuto(false);
                setHeld(true);
              } else {
                setHeld(false);
                if (step === steps.length - 1) go(null);
                setAuto(true);
              }
            }}
            aria-label={auto ? "자동 넘김 멈춤" : "자동 넘김 시작"}
            className={`relative z-[1] flex shrink-0 items-center justify-center rounded-xl text-[#33414a] hover:bg-[#eef3f3] ${narrow ? "w-8" : "w-10"}`}
          >
            {auto ? (
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <rect x="3" y="2.5" width="3.4" height="11" rx="1" fill="currentColor" />
                <rect x="9.6" y="2.5" width="3.4" height="11" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path d="M4 2.6v10.8c0 .6.6.9 1.1.6l8.4-5.4a.7.7 0 0 0 0-1.2L5.1 2c-.5-.3-1.1 0-1.1.6Z" fill="currentColor" />
              </svg>
            )}
          </button>
        </nav>
      ) : null}

      {cur?.card === "phone" && phone && !zoom && !narrow ? <div className="absolute bottom-16 right-4 z-[35] w-[236px]">{phone}</div> : null}

      {ready && !active && (
        <button type="button" onClick={open} className="absolute bottom-4 right-4 z-[40] rounded-full bg-[#15171c] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,.25)]">
          키오스크 사용해 보기
        </button>
      )}
      {/* 키오스크 앞에서는 단계 막대를 접어 화면 위쪽을 가리지 않는다. 다음 단계로 바로 넘어갈 수 있다 */}
      {zoom && step !== null && step + 1 < steps.length ? (
        <button type="button" onClick={() => pick(step + 1)} className="absolute bottom-4 right-4 z-[40] rounded-full bg-(--acc) px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,.25)]">
          다음 단계
          {auto && timer ? <Countdown key={timer.at} timer={timer} className="ml-1.5 font-semibold text-white/80" /> : null}
        </button>
      ) : null}
      {/* 아래 왼쪽 보기 조작 막대: 정면 보기, 전체 보기(단계 화면이나 키오스크 앞에서만), 조작 안내(처음 만지면 접힘) */}
      <div className={`absolute bottom-4 left-4 z-[40] flex items-center gap-2 ${ready ? "" : "hidden"}`}>
        {!zoom ? (
          <button type="button" onClick={resetView} className={narrow ? CTRL_ICON : CTRL} aria-label="정면 보기">
            <RotateCcw size={narrow ? 18 : 15} aria-hidden />
            {narrow ? null : "정면 보기"}
          </button>
        ) : null}
        {zoom || step !== null ? (
          <button type="button" onClick={leave} className={narrow ? CTRL_ICON : CTRL} aria-label="전체 보기" aria-keyshortcuts="Escape">
            <Maximize2 size={narrow ? 18 : 15} aria-hidden />
            {narrow ? null : "전체 보기"}
          </button>
        ) : null}
        {hint && !zoom && !narrow ? (
          <p className="pointer-events-none flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-[12px] font-bold text-[#3d4450]">
            {touch ? (
              <>
                <Hand size={15} aria-hidden />
                한 손가락 회전, 두 손가락 확대
              </>
            ) : (
              <>
                <Mouse size={15} aria-hidden />
                끌어서 회전, 휠로 확대
              </>
            )}
          </p>
        ) : null}
      </div>
      <Loading ready={ready} progress={progress} />
    </div>
  );
}
