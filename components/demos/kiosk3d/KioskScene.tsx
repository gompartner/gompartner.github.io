"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/*
  키오스크 3D 장소(11-01 사용자 요청: "장소에 키오스크가 있고, 누르면 볼 수 있게").
  - 병원 로비(clinic), 학원 입구(academy) 두 장소. 가구는 상자, 원기둥으로 간단히 만든다(외부 모델, HDR 파일을 받지 않음).
  - 처음엔 공간 전체가 보이고 끌어서 둘러볼 수 있다. 키오스크를 누르면 카메라가 화면 앞으로 다가가고, 그때부터 화면을 누를 수 있다.
  - 키오스크 화면은 그림이 아니라 실제 화면(children)이다. 매 장면 화면 네 모서리를 투영해 원근 변환(matrix3d)으로 캔버스 위에 겹친다(글자가 선명하고 그대로 동작).
  - 모션 줄이기면 카메라가 미끄러지지 않고 바로 옮긴다.
  screen: 화면 설계 크기(px). 9:16이어야 키오스크 화면 칸에 맞는다.
*/

type Place = "clinic" | "academy";

const SCREEN_W = 0.54;
const SCREEN_H = 0.96;
const SCREEN_Y = 1.22;
const KIOSK_X = 0;
const KIOSK_Z = 0.4;

const PALETTE: Record<Place, { floor: string; wall: string; accent: string; wood: string; seat: string }> = {
  clinic: { floor: "#d8cfc2", wall: "#f4f3ef", accent: "#0f5560", wood: "#c9a27a", seat: "#7fa7ad" },
  academy: { floor: "#cfd3d8", wall: "#f1f2f4", accent: "#16285a", wood: "#b68b62", seat: "#2f4f8f" },
};

function Box({ p, s, c, r = 0.02 }: { p: [number, number, number]; s: [number, number, number]; c: string; r?: number }) {
  return (
    <RoundedBox args={s} radius={r} smoothness={3} position={p} castShadow receiveShadow>
      <meshStandardMaterial color={c} roughness={0.7} />
    </RoundedBox>
  );
}

function Chair({ x, z, color }: { x: number; z: number; color: string }) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.44, 0]} s={[0.46, 0.08, 0.46]} c={color} r={0.03} />
      <Box p={[0, 0.72, -0.2]} s={[0.46, 0.5, 0.07]} c={color} r={0.03} />
      <Box p={[0, 0.2, 0]} s={[0.06, 0.4, 0.06]} c="#9aa0a6" r={0.01} />
    </group>
  );
}

function Plant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.44, 24]} />
        <meshStandardMaterial color="#e9e4dc" roughness={0.6} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.sin(i * 1.3) * 0.12, 0.75 + (i % 3) * 0.14, Math.cos(i * 1.3) * 0.12]} castShadow>
          <sphereGeometry args={[0.2 - (i % 2) * 0.04, 20, 16]} />
          <meshStandardMaterial color={i % 2 ? "#4f7d4a" : "#5f9157"} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Room({ place }: { place: Place }) {
  const c = PALETTE[place];
  return (
    <group>
      {/* 바닥과 벽 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial color={c.floor} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.6, -2.2]} receiveShadow>
        <planeGeometry args={[12, 3.2]} />
        <meshStandardMaterial color={c.wall} roughness={0.9} />
      </mesh>
      <mesh position={[-4.2, 1.6, 0.8]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 3.2]} />
        <meshStandardMaterial color={c.wall} roughness={0.9} />
      </mesh>
      {/* 벽 띠 */}
      <mesh position={[0, 0.5, -2.19]}>
        <planeGeometry args={[12, 1]} />
        <meshStandardMaterial color={place === "clinic" ? "#e3ecea" : c.accent} roughness={0.9} />
      </mesh>
      {/* 창(빛이 들어오는 면) */}
      <mesh position={[-4.19, 1.7, 0.6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 1.5]} />
        <meshStandardMaterial color="#ffffff" emissive="#fdfaf2" emissiveIntensity={0.9} />
      </mesh>

      {place === "clinic" ? (
        <>
          {/* 접수 데스크 */}
          <Box p={[2.1, 0.55, -1.4]} s={[2.4, 1.1, 0.7]} c="#ffffff" r={0.04} />
          <Box p={[2.1, 1.12, -1.4]} s={[2.5, 0.05, 0.78]} c={c.wood} r={0.02} />
          <Box p={[2.1, 0.55, -1.04]} s={[2.4, 0.18, 0.02]} c={c.accent} r={0.005} />
          {/* 대기 의자 두 줄 */}
          {[-2.6, -2.0, -1.4].map((x) => (
            <Chair key={`a${x}`} x={x} z={-0.9} color={c.seat} />
          ))}
          {[-2.6, -2.0, -1.4].map((x) => (
            <Chair key={`b${x}`} x={x} z={0.4} color={c.seat} />
          ))}
          {/* 벽 TV */}
          <Box p={[-1.9, 2.0, -2.15]} s={[1.5, 0.86, 0.06]} c="#1b1f24" r={0.02} />
          <mesh position={[-1.9, 2.0, -2.11]}>
            <planeGeometry args={[1.42, 0.78]} />
            <meshStandardMaterial color={c.accent} emissive={c.accent} emissiveIntensity={0.6} />
          </mesh>
          <Plant x={3.6} z={-1.7} />
          <Plant x={-3.6} z={-1.6} />
        </>
      ) : (
        <>
          {/* 입구 문 */}
          <Box p={[2.4, 1.1, -2.15]} s={[1.2, 2.2, 0.06]} c="#e6e8eb" r={0.02} />
          <mesh position={[2.4, 1.15, -2.11]}>
            <planeGeometry args={[0.9, 1.6]} />
            <meshStandardMaterial color="#cfe0ee" emissive="#e8f1f8" emissiveIntensity={0.5} />
          </mesh>
          {/* 신발장, 게시판, 벤치 */}
          <Box p={[-2.4, 0.5, -1.9]} s={[1.6, 1.0, 0.4]} c={c.wood} r={0.03} />
          <Box p={[-0.9, 1.75, -2.16]} s={[1.6, 0.9, 0.04]} c="#ffffff" r={0.02} />
          <Box p={[-0.9, 1.75, -2.13]} s={[1.5, 0.8, 0.01]} c="#e8ecf4" r={0.01} />
          <Box p={[-2.6, 0.42, 0.6]} s={[1.6, 0.1, 0.45]} c={c.wood} r={0.03} />
          <Box p={[-2.6, 0.2, 0.6]} s={[1.5, 0.36, 0.06]} c="#9aa0a6" r={0.01} />
          <Plant x={3.5} z={-1.6} />
        </>
      )}
    </group>
  );
}

function KioskBody({ place, active, onOpen }: { place: Place; active: boolean; onOpen: () => void }) {
  const c = PALETTE[place];
  const [hover, setHover] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hover && !active ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover, active]);
  return (
    <group
      position={[KIOSK_X, 0, KIOSK_Z]}
      onClick={(e) => {
        e.stopPropagation();
        if (!active) onOpen();
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* 받침과 기둥 */}
      <Box p={[0, 0.03, 0]} s={[0.62, 0.06, 0.46]} c="#e9ebee" r={0.02} />
      <Box p={[0, 0.4, 0]} s={[0.16, 0.72, 0.12]} c="#f3f4f6" r={0.03} />
      {/* 본체 */}
      <Box p={[0, SCREEN_Y, -0.04]} s={[SCREEN_W + 0.12, SCREEN_H + 0.3, 0.12]} c="#f7f8fa" r={0.05} />
      {/* 화면 테두리 */}
      <Box p={[0, SCREEN_Y + 0.04, 0.02]} s={[SCREEN_W + 0.04, SCREEN_H + 0.04, 0.01]} c="#15171c" r={0.012} />
      {/* 카드 투입구, 번호표 출구 */}
      <Box p={[-0.12, SCREEN_Y - SCREEN_H / 2 - 0.08, 0.03]} s={[0.16, 0.025, 0.01]} c="#2a2e35" r={0.004} />
      <Box p={[0.14, SCREEN_Y - SCREEN_H / 2 - 0.08, 0.03]} s={[0.12, 0.012, 0.01]} c="#2a2e35" r={0.004} />
      {/* 색 띠 */}
      <Box p={[0, SCREEN_Y + SCREEN_H / 2 + 0.11, 0.025]} s={[SCREEN_W, 0.03, 0.005]} c={c.accent} r={0.004} />
      {/* 화면 자리. 실제 화면은 캔버스 위에 원근을 맞춰 겹친다(ScreenProjector) */}
      <mesh position={[0, SCREEN_Y + 0.04, 0.026]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

const HOME = new THREE.Vector3(3.2, 2.1, 5.0);

// 네 점을 잇는 원근 변환(호모그래피)을 CSS matrix3d로 만든다. 사각형 w x h를 화면의 네 점 q0..q3(왼위, 오른위, 오른아래, 왼아래)에 맞춘다
function quadMatrix(w: number, h: number, q: [number, number][]) {
  const src: [number, number][] = [[0, 0], [w, 0], [w, h], [0, h]];
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
  // 가우스 소거
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
  const h8 = B.map((b, i) => b / A[i][i]);
  const [a, b, c, d, e, f, g, hh] = h8;
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}

// 키오스크 화면 네 모서리를 매 장면 투영해 실제 화면 DOM을 그 자리에 겹친다
/* eslint-disable react-hooks/immutability -- useFrame 안에서 겹친 화면의 style을 매 장면 바꾸는 것이 이 부품의 목적이다(React 상태를 거치지 않음) */
function ScreenProjector({ target, center = [KIOSK_X, SCREEN_Y + 0.04, KIOSK_Z + 0.027], w = SCREEN_W, h = SCREEN_H, px = [450, 800] }: { target: React.RefObject<HTMLDivElement | null>; center?: [number, number, number]; w?: number; h?: number; px?: [number, number] }) {
  const { camera, size } = useThree();
  const [cx, cy, cz] = center;
  const pts = useMemo(
    () => [
      new THREE.Vector3(cx - w / 2, cy + h / 2, cz),
      new THREE.Vector3(cx + w / 2, cy + h / 2, cz),
      new THREE.Vector3(cx + w / 2, cy - h / 2, cz),
      new THREE.Vector3(cx - w / 2, cy - h / 2, cz),
    ],
    [cx, cy, cz, w, h],
  );
  const vr = useRef(new THREE.Vector3());
  useFrame(() => {
    const el = target.current;
    if (!el) return;
    const v = vr.current;
    const q: [number, number][] = [];
    for (const p of pts) {
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

// 카메라 이동: zoom이면 키오스크 화면 앞으로, back이면 처음 자리로 돌아간 뒤 둘러보기 조작에 넘긴다
function CameraRig({ phase, reduced, onHome }: { phase: "look" | "zoom" | "back"; reduced: boolean; onHome: () => void }) {
  const { camera } = useThree();
  const tr = useRef(new THREE.Vector3());
  const lr = useRef(new THREE.Vector3());
  const lookNow = useRef(new THREE.Vector3(0, 1.1, 0));
  useFrame((_, dt) => {
    if (phase === "look") return;
    const target = tr.current;
    const look = lr.current;
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 38;
    if (phase === "zoom") {
      const dist = SCREEN_H / 2 / Math.tan(((fov / 2) * Math.PI) / 180) / 0.86;
      target.set(KIOSK_X, SCREEN_Y + 0.04, KIOSK_Z + 0.03 + dist);
      look.set(KIOSK_X, SCREEN_Y + 0.04, KIOSK_Z);
    } else {
      target.copy(HOME);
      look.set(0, 1.1, 0);
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4);
    camera.position.lerp(target, k);
    lookNow.current.lerp(look, k);
    camera.lookAt(lookNow.current);
    if (phase === "back" && camera.position.distanceTo(target) < 0.01) onHome();
  });
  return null;
}

/**
 * 장소 안의 키오스크. children은 450x800 크기로 그린 실제 키오스크 화면.
 * zoomSignal: 숫자가 바뀔 때마다 키오스크 앞으로 다가간다(바깥 버튼, 학생증 태그 등에서 쓰기).
 * paused: 장면이 가려져 있을 때 그리기를 멈춘다.
 */
export function KioskScene({ place, children, tv, className = "", zoomSignal = 0, paused = false }: { place: Place; children: ReactNode; /** 병원 로비 벽 TV에 띄울 화면(640x352 px로 그림) */ tv?: ReactNode; className?: string; zoomSignal?: number; paused?: boolean }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"look" | "zoom" | "back">("look");
  const active = phase === "zoom";
  const setActive = (v: boolean) => setPhase(v ? "zoom" : "back");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!zoomSignal) return;
    const f = requestAnimationFrame(() => setPhase("zoom"));
    return () => cancelAnimationFrame(f);
  }, [zoomSignal]);
  useEffect(() => {
    const f = requestAnimationFrame(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches));
    return () => cancelAnimationFrame(f);
  }, []);
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhase("back");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
  const leave = () => setActive(false);
  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#e9e6e0] ${className}`}>
      <Canvas frameloop={paused ? "never" : "always"} shadows dpr={[1, 2]} camera={{ position: [3.2, 2.1, 5.0], fov: 38 }} gl={{ antialias: true }}>
        <color attach="background" args={[place === "clinic" ? "#ece8e1" : "#e6e9ee"]} />
        <hemisphereLight args={["#ffffff", "#d9d2c6", 1.1]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[-3, 5, 3]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
        <Suspense fallback={null}>
          <Environment resolution={128}>
            <Lightformer form="rect" intensity={2} position={[-4, 2, 1]} scale={[3, 2, 1]} />
            <Lightformer form="rect" intensity={1} position={[3, 3, 4]} scale={[4, 2, 1]} />
          </Environment>
        </Suspense>
        <Room place={place} />
        <KioskBody place={place} active={active} onOpen={() => setActive(true)} />
        <ScreenProjector target={screenRef} />
        {tv && place === "clinic" ? <ScreenProjector target={tvRef} center={[-1.9, 2.0, -2.105]} w={1.42} h={0.78} px={[640, 352]} /> : null}
        <ContactShadows position={[0, 0.005, 0]} opacity={0.35} scale={10} blur={2.4} far={3} />
        <OrbitControls
          enabled={phase === "look"}
          target={[0, 1.1, 0]}
          enablePan={false}
          minDistance={3.2}
          maxDistance={8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 2.5}
        />
        <CameraRig phase={phase} reduced={reduced} onHome={() => setPhase("look")} />
      </Canvas>
      {tv && place === "clinic" ? (
        <div ref={tvRef} aria-hidden className="pointer-events-none absolute left-0 top-0 z-[5] origin-top-left overflow-hidden" style={{ width: 640, height: 352, visibility: "hidden" }}>
          {tv}
        </div>
      ) : null}
      {/* 실제 키오스크 화면. 3D 화면 자리에 원근을 맞춰 겹친다. 다가가기 전에는 누르면 다가간다 */}
      <div
        ref={screenRef}
        className="absolute left-0 top-0 z-[10] origin-top-left overflow-hidden rounded-[4px] bg-white"
        style={{ width: 450, height: 800, visibility: "hidden" }}
        onClickCapture={(e) => {
          if (!active) {
            e.stopPropagation();
            e.preventDefault();
            setActive(true);
          }
        }}
        role={active ? undefined : "button"}
        aria-label={active ? undefined : "키오스크 사용해 보기"}
        tabIndex={active ? -1 : 0}
        onKeyDown={(e) => {
          if (!active && (e.key === "Enter" || e.key === " ")) setActive(true);
        }}
      >
        <div style={{ pointerEvents: active ? "auto" : "none" }} className="h-full w-full">
          {children}
        </div>
      </div>
      {!active && phase === "look" && (
        <button type="button" onClick={() => setActive(true)} className="absolute bottom-4 right-4 z-[40] rounded-full bg-[#15171c] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,.25)]">
          키오스크 사용해 보기
        </button>
      )}
      {active ? (
        <button type="button" onClick={leave} className="absolute left-4 top-4 z-[40] rounded-full bg-white/95 px-4 py-2 text-[14px] font-bold text-[#15171c] shadow-[0_6px_16px_rgba(0,0,0,.15)]">
          공간 보기
        </button>
      ) : (
        <p className="pointer-events-none absolute bottom-4 left-4 z-[40] rounded-full bg-white/90 px-4 py-2 text-[13px] font-bold text-[#3d4450]">끌어서 둘러보기</p>
      )}
    </div>
  );
}
