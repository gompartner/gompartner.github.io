"use client";

import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { RoundedBox, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ACADEMY, type RoomProps } from "./places";
import { CAST, SeatedPerson, StandingPerson } from "./People";

/*
  학원 입구 디오라마(11-01 방향 바뀜: "물건 디테일보다 우리 기능이 부각되게").
  - 위에서 비스듬히 내려다보는 단면 모형. 뒤쪽, 왼쪽 바깥벽만 높게 두고 카메라 쪽 앞벽은 낮게 자른다.
  - 한 장면에 출입문, 문 옆 키오스크 자리, 신발장, 대기 의자, 복도와 교실 문 두 개(하나는 열림), 원장실 책상과 모니터가 다 보인다.
  - 키오스크, 걷는 학생, 경로 점선, 이름표, 치수선은 공용 장면(KioskScene)이 places.ts의 ACADEMY 설정으로 그린다. 이 방은 키오스크 자리만 비워 둔다.
  - 대기 의자 학부모와 원장실 원장은 앉은 인형으로 방 안에 둔다. 원장 모니터 화면 자리는 ACADEMY.monitor(관리자 화면을 겹친다).
  - 조명은 공용 장면 몫(ACADEMY.hdri).
  - 모델은 Poly Haven CC0(public/models/academy/LICENSE.txt).
  단위는 m. 바닥 y=0. 앞(카메라 쪽)은 +z, 출입문은 뒤벽(z=-3.5)에 있다.
*/

type V3 = [number, number, number];

const ACCENT = "#16285a";

const WALL_H = 2.4;
const WALL_T = 0.12;
const CUT_H = 0.28;

const MONITOR = ACADEMY.monitor!;

const M = "/models/academy";
const MODELS = {
  chair: `${M}/schoolchair_01.glb`,
  desk: `${M}/schooldesk_01.glb`,
  plant: `${M}/potted_plant_02.glb`,
  clock: `${M}/wall_clock.glb`,
  shelf: `${M}/wooden_display_shelves_01.glb`,
  extinguisher: `${M}/korean_fire_extinguisher_01.glb`,
};

const C = {
  wall: "#f6f6f4",
  wallTop: "#d9dce2",
  base: "#d5d9e0",
  wood: "#d2b48c",
  woodDark: "#b48d62",
  navy: ACCENT,
  metal: "#9aa1ab",
  frame: "#3b414b",
  glass: "#bcd3e2",
  white: "#ffffff",
  tileOut: "#c9ccd1",
};

function Model({ url, position, rotationY = 0, scale = 1 }: { url: string; position: V3; rotationY?: number; scale?: number }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => scene.clone(true), [scene]);
  useLayoutEffect(() => {
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }, [obj]);
  return <primitive object={obj} position={position} rotation={[0, rotationY, 0]} scale={scale} />;
}

function Box({ p, s, c, r = 0, rough = 0.75, metal = 0, cast = true }: { p: V3; s: V3; c: string; r?: number; rough?: number; metal?: number; cast?: boolean }) {
  const mat = <meshStandardMaterial color={c} roughness={rough} metalness={metal} />;
  if (r > 0)
    return (
      <RoundedBox args={s} radius={r} smoothness={3} position={p} castShadow={cast} receiveShadow>
        {mat}
      </RoundedBox>
    );
  return (
    <mesh position={p} castShadow={cast} receiveShadow>
      <boxGeometry args={s} />
      {mat}
    </mesh>
  );
}

type Opening = { at: number; w: number; h: number; sill?: number };

/** 한 줄 벽. along="x"면 z=fixed 위에서 x from..to, along="z"면 x=fixed 위에서 z from..to. 문, 창 자리는 비운다 */
function Wall({ along, fixed, from, to, h = WALL_H, t = WALL_T, openings = [] }: { along: "x" | "z"; fixed: number; from: number; to: number; h?: number; t?: number; openings?: Opening[] }) {
  const parts: { a: number; b: number; y0: number; y1: number }[] = [];
  const sorted = [...openings].sort((p, q) => p.at - q.at);
  let cur = from;
  for (const o of sorted) {
    const a = o.at - o.w / 2;
    const b = o.at + o.w / 2;
    if (a > cur) parts.push({ a: cur, b: a, y0: 0, y1: h });
    if (o.h < h) parts.push({ a, b, y0: o.h, y1: h });
    if (o.sill) parts.push({ a, b, y0: 0, y1: o.sill });
    cur = b;
  }
  if (cur < to) parts.push({ a: cur, b: to, y0: 0, y1: h });
  return (
    <group>
      {parts.map((s, i) => {
        const len = s.b - s.a;
        const mid = (s.a + s.b) / 2;
        const y = (s.y0 + s.y1) / 2;
        const hh = s.y1 - s.y0;
        const pos: V3 = along === "x" ? [mid, y, fixed] : [fixed, y, mid];
        const size: V3 = along === "x" ? [len, hh, t] : [t, hh, len];
        const top: V3 = along === "x" ? [mid, s.y1 + 0.004, fixed] : [fixed, s.y1 + 0.004, mid];
        const topSize: V3 = along === "x" ? [len, 0.008, t + 0.002] : [t + 0.002, 0.008, len];
        return (
          <group key={i}>
            <mesh position={pos} castShadow receiveShadow>
              <boxGeometry args={size} />
              <meshStandardMaterial color={C.wall} roughness={0.92} />
            </mesh>
            {s.y1 >= h - 0.001 ? (
              <mesh position={top}>
                <boxGeometry args={topSize} />
                <meshStandardMaterial color={C.wallTop} roughness={0.9} />
              </mesh>
            ) : null}
            {s.y0 === 0 ? (
              <mesh position={along === "x" ? [mid, 0.04, fixed] : [fixed, 0.04, mid]}>
                <boxGeometry args={along === "x" ? [len, 0.08, t + 0.024] : [t + 0.024, 0.08, len]} />
                <meshStandardMaterial color="#c9ced6" roughness={0.6} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function Floor({ x0, x1, z0, z1, tex, tint = "#ffffff", y = 0 }: { x0: number; x1: number; z0: number; z1: number; tex?: THREE.Texture; tint?: string; y?: number }) {
  const w = x1 - x0;
  const d = z1 - z0;
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const map = useMemo(() => {
    if (!tex) return undefined;
    const t = tex.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    // 마루 한 장 크기를 키워(2.2m마다 되풀이) 멀리서 결이 자글거리지 않게, 이방성 필터는 최대로
    t.repeat.set(w / 2.2, d / 2.2);
    t.anisotropy = maxAniso;
    t.needsUpdate = true;
    return t;
  }, [tex, w, d, maxAniso]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, y, (z0 + z1) / 2]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial map={map} color={tint} roughness={0.62} />
    </mesh>
  );
}

/** 유리 출입문(알루미늄 틀, 손잡이) */
function GlassDoor({ x, z }: { x: number; z: number }) {
  const w = 1.0;
  const h = 2.1;
  const f = 0.05;
  return (
    <group position={[x, 0, z]}>
      {/* 문틀 */}
      <Box p={[-w / 2 - f / 2, h / 2, 0]} s={[f, h, 0.14]} c={C.frame} rough={0.4} metal={0.6} />
      <Box p={[w / 2 + f / 2, h / 2, 0]} s={[f, h, 0.14]} c={C.frame} rough={0.4} metal={0.6} />
      <Box p={[0, h + f / 2, 0]} s={[w + 2 * f, f, 0.14]} c={C.frame} rough={0.4} metal={0.6} />
      {/* 문짝 틀과 유리 */}
      <Box p={[0, 0.06, 0]} s={[w, 0.12, 0.05]} c={C.frame} rough={0.4} metal={0.6} />
      <Box p={[-w / 2 + 0.03, h / 2, 0]} s={[0.06, h, 0.05]} c={C.frame} rough={0.4} metal={0.6} />
      <Box p={[w / 2 - 0.03, h / 2, 0]} s={[0.06, h, 0.05]} c={C.frame} rough={0.4} metal={0.6} />
      <Box p={[0, h - 0.03, 0]} s={[w, 0.06, 0.05]} c={C.frame} rough={0.4} metal={0.6} />
      <mesh position={[0, h / 2 + 0.03, 0]}>
        <boxGeometry args={[w - 0.12, h - 0.18, 0.012]} />
        <meshStandardMaterial color={C.glass} roughness={0.05} metalness={0.1} transparent opacity={0.32} depthWrite={false} />
      </mesh>
      {/* 세로 손잡이 */}
      <Box p={[w / 2 - 0.14, 1.05, 0.07]} s={[0.025, 0.7, 0.025]} c="#c7ccd3" rough={0.25} metal={0.9} />
      {/* 출입 시간 안내 자리(글자 없는 띠) */}
      <mesh position={[0, 1.45, 0.012]}>
        <planeGeometry args={[w - 0.14, 0.05]} />
        <meshStandardMaterial color={C.navy} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** 교실 문(밝은 나무, 위쪽 작은 유리창). open이면 안쪽으로 열려 있다 */
function ClassDoor({ x, z, open = false }: { x: number; z: number; open?: boolean }) {
  const w = 0.9;
  const h = 2.05;
  return (
    <group position={[x, 0, z]}>
      {/* 문틀(벽이 z축을 따라가므로 문은 z 방향으로 넓다) */}
      <Box p={[0, h + 0.025, 0]} s={[0.16, 0.05, w + 0.1]} c={C.white} rough={0.6} />
      <Box p={[0, h / 2, -w / 2 - 0.025]} s={[0.16, h, 0.05]} c={C.white} rough={0.6} />
      <Box p={[0, h / 2, w / 2 + 0.025]} s={[0.16, h, 0.05]} c={C.white} rough={0.6} />
      {/* 문짝: 경첩은 +z 쪽, 교실 안(+x)으로 열린다 */}
      <group position={[0.04, 0, w / 2]} rotation={[0, open ? -Math.PI / 2.2 : 0, 0]}>
        <group position={[0, 0, -w / 2]}>
          <Box p={[0, h / 2, 0]} s={[0.04, h - 0.02, w - 0.02]} c={C.wood} rough={0.55} />
          <mesh position={[-0.021, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.3, 0.5]} />
            <meshStandardMaterial color={C.glass} roughness={0.1} metalness={0.2} />
          </mesh>
          <Box p={[-0.04, 1.0, w / 2 - 0.1]} s={[0.04, 0.03, 0.12]} c="#c7ccd3" rough={0.25} metal={0.9} />
        </group>
      </group>
    </group>
  );
}

/** 학생 신발장(흰 칸막이 장, 칸마다 실내화) */
function ShoeCabinet({ x, z }: { x: number; z: number }) {
  const cols = 5;
  const rows = 4;
  const w = 1.5;
  const h = 1.05;
  const d = 0.34;
  const cw = w / cols;
  const ch = (h - 0.08) / rows;
  const shoes = ["#ffffff", "#2f4f8f", "#e7a9a0", "#9fb4cf", "#f0c869"];
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI / 2, 0]}>
      <Box p={[0, 0.04, 0]} s={[w, 0.08, d - 0.04]} c="#c9ced6" rough={0.7} />
      {/* 뒤판, 옆판, 칸막이 */}
      <Box p={[0, h / 2 + 0.04, -d / 2 + 0.01]} s={[w, h, 0.02]} c={C.white} rough={0.6} />
      {Array.from({ length: cols + 1 }, (_, i) => (
        <Box key={`v${i}`} p={[-w / 2 + i * cw, h / 2 + 0.04, 0]} s={[0.02, h, d]} c={C.white} rough={0.6} />
      ))}
      {Array.from({ length: rows + 1 }, (_, j) => (
        <Box key={`h${j}`} p={[0, 0.08 + j * ch, 0]} s={[w, 0.02, d]} c={C.white} rough={0.6} />
      ))}
      {/* 칸 위 이름표 자리(글자 없는 색 띠) */}
      {Array.from({ length: cols * rows }, (_, k) => {
        const i = k % cols;
        const j = Math.floor(k / cols);
        return (
          <mesh key={`t${k}`} position={[-w / 2 + (i + 0.5) * cw, 0.08 + (j + 1) * ch - 0.025, d / 2 + 0.002]}>
            <planeGeometry args={[cw * 0.5, 0.022]} />
            <meshStandardMaterial color={j % 2 ? "#dfe5ef" : "#c8d2e4"} roughness={0.8} />
          </mesh>
        );
      })}
      {/* 실내화 몇 켤레 */}
      {[0, 2, 3, 6, 8, 11, 12, 14, 17].map((k) => {
        const i = k % cols;
        const j = Math.floor(k / cols);
        const cx = -w / 2 + (i + 0.5) * cw;
        const cy = 0.09 + j * ch + 0.03;
        const col = shoes[k % shoes.length];
        return (
          <group key={`s${k}`}>
            <Box p={[cx - 0.04, cy, 0.02]} s={[0.07, 0.05, 0.22]} c={col} r={0.02} rough={0.8} />
            <Box p={[cx + 0.04, cy, 0.02]} s={[0.07, 0.05, 0.22]} c={col} r={0.02} rough={0.8} />
          </group>
        );
      })}
    </group>
  );
}

/** 대기 의자(나무 다리, 남색 쿠션 벤치) */
function Bench({ x, z, len = 1.4, rotationY = 0 }: { x: number; z: number; len?: number; rotationY?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <Box p={[0, 0.42, 0]} s={[len, 0.07, 0.44]} c={C.navy} r={0.03} rough={0.9} />
      <Box p={[0, 0.37, 0]} s={[len - 0.04, 0.04, 0.42]} c={C.wood} rough={0.6} />
      <Box p={[0, 0.72, -0.2]} s={[len, 0.4, 0.06]} c={C.navy} r={0.03} rough={0.9} />
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <Box p={[sx * (len / 2 - 0.08), 0.18, 0.16]} s={[0.04, 0.36, 0.04]} c={C.woodDark} rough={0.6} />
          <Box p={[sx * (len / 2 - 0.08), 0.18, -0.16]} s={[0.04, 0.36, 0.04]} c={C.woodDark} rough={0.6} />
          <Box p={[sx * (len / 2 - 0.08), 0.52, -0.2]} s={[0.04, 0.36, 0.04]} c={C.woodDark} rough={0.6} />
        </group>
      ))}
    </group>
  );
}

/** 게시판(코르크 판에 글자 없는 색 종이) */
function NoticeBoard({ x, y, z, rotationY = 0 }: { x: number; y: number; z: number; rotationY?: number }) {
  const papers: [number, number, number, number, string][] = [
    [-0.45, 0.12, 0.26, 0.34, "#ffffff"],
    [-0.12, 0.18, 0.24, 0.3, "#fdf3d0"],
    [0.18, 0.1, 0.28, 0.36, "#ffffff"],
    [0.47, 0.16, 0.22, 0.28, "#dfe8f6"],
    [-0.3, -0.2, 0.3, 0.22, "#e8f2e6"],
    [0.1, -0.22, 0.26, 0.2, "#ffffff"],
  ];
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      <Box p={[0, 0, 0]} s={[1.4, 0.8, 0.03]} c="#a9b0ba" rough={0.5} metal={0.4} />
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[1.34, 0.74]} />
        <meshStandardMaterial color="#c9a57a" roughness={0.95} />
      </mesh>
      {papers.map(([px, py, w, h, col], i) => (
        <mesh key={i} position={[px, py, 0.019 + i * 0.0005]} rotation={[0, 0, ((i % 3) - 1) * 0.03]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color={col} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** 화이트보드 */
function Whiteboard({ x, y, z, rotationY = 0, w = 2.2 }: { x: number; y: number; z: number; rotationY?: number; w?: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      <Box p={[0, 0, 0]} s={[w, 1.0, 0.03]} c="#b9bfc8" rough={0.4} metal={0.5} />
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[w - 0.06, 0.94]} />
        <meshStandardMaterial color="#fbfbfb" roughness={0.25} />
      </mesh>
      <Box p={[0, -0.52, 0.04]} s={[w * 0.6, 0.025, 0.07]} c="#b9bfc8" rough={0.4} metal={0.5} />
    </group>
  );
}

/** 원장 책상(밝은 나무 상판, 흰 몸통), 모니터, 키보드, 사무 의자 */
function DirectorDesk({ x, z }: { x: number; z: number }) {
  return (
    <group>
      <group position={[x, 0, z]}>
        <Box p={[0, 0.735, 0]} s={[1.5, 0.03, 0.72]} c={C.wood} rough={0.55} />
        <Box p={[-0.72, 0.36, 0]} s={[0.03, 0.72, 0.7]} c={C.white} rough={0.6} />
        <Box p={[0.72, 0.36, 0]} s={[0.03, 0.72, 0.7]} c={C.white} rough={0.6} />
        <Box p={[0, 0.45, -0.33]} s={[1.42, 0.5, 0.02]} c={C.white} rough={0.6} />
        {/* 서랍장 */}
        <Box p={[0.5, 0.32, 0.02]} s={[0.4, 0.62, 0.6]} c={C.white} rough={0.6} />
        {[0.15, 0.35, 0.53].map((y) => (
          <Box key={y} p={[0.5, y, 0.325]} s={[0.12, 0.015, 0.01]} c={C.metal} rough={0.3} metal={0.8} />
        ))}
        {/* 키보드, 마우스, 서류 */}
        <Box p={[0, 0.758, 0.12]} s={[0.42, 0.015, 0.13]} c="#2b2f36" r={0.005} rough={0.5} />
        <Box p={[0.32, 0.758, 0.14]} s={[0.06, 0.02, 0.1]} c="#2b2f36" r={0.008} rough={0.5} />
        <Box p={[-0.5, 0.755, 0.05]} s={[0.23, 0.01, 0.31]} c="#ffffff" rough={0.9} />
        <Box p={[-0.52, 0.762, 0.06]} s={[0.21, 0.004, 0.29]} c="#eef1f6" rough={0.9} />
      </group>
      {/* 모니터(화면은 +z) */}
      <group position={[MONITOR.center[0], 0, MONITOR.center[2] + 0.0055]}>
        <Box p={[0, 0.758, -0.06]} s={[0.24, 0.016, 0.18]} c="#2b2f36" r={0.006} rough={0.4} />
        <Box p={[0, 0.88, -0.07]} s={[0.05, 0.24, 0.03]} c="#2b2f36" rough={0.4} />
        <Box p={[0, MONITOR.center[1], -0.02]} s={[MONITOR.w + 0.024, MONITOR.h + 0.024, 0.025]} c="#1d2026" r={0.006} rough={0.35} />
        <mesh position={[0, MONITOR.center[1], -0.0065]}>
          <planeGeometry args={[MONITOR.w, MONITOR.h]} />
          <meshStandardMaterial color="#e9eef6" emissive="#e9eef6" emissiveIntensity={0.35} roughness={0.3} />
        </mesh>
      </group>
      {/* 사무 의자 */}
      <group position={[x, 0, z + 0.62]}>
        <Box p={[0, 0.47, 0]} s={[0.5, 0.08, 0.48]} c="#2b2f36" r={0.03} rough={0.85} />
        <Box p={[0, 0.82, 0.22]} s={[0.46, 0.55, 0.06]} c="#2b2f36" r={0.03} rough={0.85} />
        <Box p={[0, 0.25, 0]} s={[0.05, 0.4, 0.05]} c={C.metal} rough={0.3} metal={0.8} />
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return <Box key={i} p={[Math.sin(a) * 0.17, 0.04, Math.cos(a) * 0.17]} s={[0.05, 0.03, 0.05]} c="#2b2f36" r={0.01} rough={0.6} />;
        })}
      </group>
    </group>
  );
}

/** 상담 탁자와 의자 두 개(원장실 안) */
function ConsultTable({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.03, 40]} />
        <meshStandardMaterial color={C.wood} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 12]} />
        <meshStandardMaterial color={C.metal} roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[0.24, 0.26, 0.02, 32]} />
        <meshStandardMaterial color={C.metal} roughness={0.3} metalness={0.8} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * 0.62]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <Box p={[0, 0.45, 0]} s={[0.44, 0.06, 0.44]} c={C.navy} r={0.025} rough={0.9} />
          <Box p={[0, 0.72, 0.2]} s={[0.42, 0.44, 0.05]} c={C.navy} r={0.025} rough={0.9} />
          <Box p={[0, 0.22, 0]} s={[0.04, 0.42, 0.04]} c={C.metal} rough={0.3} metal={0.8} />
        </group>
      ))}
    </group>
  );
}

/** 우산꽂이 */
function UmbrellaStand({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.27, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.11, 0.54, 28, 1, true]} />
        <meshStandardMaterial color="#aeb5bf" roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 28]} />
        <meshStandardMaterial color="#8a919b" roughness={0.4} metalness={0.7} />
      </mesh>
      {[
        [0.03, 0.02, C.navy],
        [-0.04, -0.01, "#6c7787"],
      ].map(([dx, dz, col], i) => (
        <group key={i} position={[dx as number, 0, dz as number]} rotation={[0.06 * (i ? -1 : 1), 0, 0.08 * (i ? 1 : -1)]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <coneGeometry args={[0.04, 0.6, 12]} />
            <meshStandardMaterial color={col as string} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
            <meshStandardMaterial color="#2b2f36" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 벽 콘센트(키오스크 뒤 오른쪽) */
function Outlet({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <Box p={[0, 0, 0]} s={[0.08, 0.12, 0.012]} c="#ffffff" r={0.004} rough={0.4} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, s * 0.025, 0.007]}>
          <circleGeometry args={[0.016, 20]} />
          <meshStandardMaterial color="#d5d9df" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** 학생 인형(얼굴 없는 캡슐과 머리). seated면 앉은 높이 */
/**
 * 학원 입구 디오라마. 카메라, 조명은 넣지 않는다(공용 장면 몫).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 방 부품 공통 모양(RoomProps)을 맞춘다
export function AcademyEntrance(_props: RoomProps) {
  const floorTex = useTexture("/textures/academy/laminate_floor_02_diff_1k.jpg", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  const X0 = -5;
  const X1 = 5;
  const Z0 = -3.5;
  const Z1 = 3.5;
  const CLASS_X = 1.0;
  const DIR_Z = 1.4;
  const DIR_X = -0.6;

  return (
    <group>
      {/* 받침판 */}
      <Box p={[0, -0.09, -0.4]} s={[X1 - X0 + 0.5, 0.18, Z1 - Z0 + 2.4]} c={C.base} rough={0.9} cast={false} />
      {/* 바깥 건물 복도(출입문 밖) */}
      <Floor x0={X0} x1={-1.2} z0={-5.0} z1={Z0} tint={C.tileOut} y={0.002} />
      {/* 실내 바닥 */}
      <Floor x0={X0} x1={X1} z0={Z0} z1={Z1} tex={floorTex} y={0.004} />
      {/* 출입문 앞 매트 */}
      <Box p={[-3.4, 0.01, -3.05]} s={[1.0, 0.012, 0.6]} c="#5a6170" rough={1} cast={false} />

      {/* 바깥벽: 뒤, 왼쪽은 높게, 오른쪽은 높게, 앞(카메라 쪽)은 낮게 자른다 */}
      <Wall along="x" fixed={Z0} from={X0 - WALL_T / 2} to={X1 + WALL_T / 2} openings={[{ at: -3.4, w: 1.1, h: 2.15 }]} />
      <Wall along="z" fixed={X0} from={Z0} to={Z1} openings={[{ at: 2.45, w: 1.4, h: 2.1, sill: 0.9 }]} />
      <Wall along="z" fixed={X1} from={Z0} to={Z1} openings={[{ at: -1.2, w: 2.2, h: 2.1, sill: 0.9 }, { at: 2.45, w: 1.4, h: 2.1, sill: 0.9 }]} />
      <Wall along="x" fixed={Z1} from={X0 - WALL_T / 2} to={X1 + WALL_T / 2} h={CUT_H} />
      {/* 바깥 복도 옆벽(낮게) */}
      <Wall along="z" fixed={X0} from={-5.0} to={Z0} h={CUT_H} />
      {/* 창 유리 */}
      {[
        [X0, 2.45, 1.4],
        [X1, -1.2, 2.2],
        [X1, 2.45, 1.4],
      ].map(([wx, wz, ww], i) => (
        <mesh key={i} position={[wx, 1.5, wz]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[ww, 1.2]} />
          <meshStandardMaterial color="#dfeaf2" emissive="#f4f8fb" emissiveIntensity={0.5} roughness={0.1} />
        </mesh>
      ))}

      {/* 교실 벽(복도 쪽). 교실 A 문은 열림, 교실 B 문은 닫힘 */}
      <Wall along="z" fixed={CLASS_X} from={Z0} to={Z1} openings={[{ at: -0.2, w: 1.0, h: 2.1 }, { at: 2.45, w: 1.0, h: 2.1 }]} />
      {/* 교실 사이 벽 */}
      <Wall along="x" fixed={1.2} from={CLASS_X} to={X1} />
      <ClassDoor x={CLASS_X} z={-0.2} open />
      <ClassDoor x={CLASS_X} z={2.45} />
      {/* 교실 문 옆 반 표시(글자 없는 남색 판) */}
      <Box p={[CLASS_X - 0.07, 2.25, 0.55]} s={[0.02, 0.14, 0.34]} c={C.navy} rough={0.6} />
      <Box p={[CLASS_X - 0.07, 2.25, 1.8]} s={[0.02, 0.14, 0.34]} c={C.navy} rough={0.6} />

      {/* 원장실 벽: 아래는 벽, 위는 유리 */}
      <Wall along="x" fixed={DIR_Z} from={X0} to={DIR_X} h={1.0} />
      <Wall along="z" fixed={DIR_X} from={DIR_Z} to={Z1} h={1.0} openings={[{ at: 2.0, w: 0.9, h: 2.1 }]} />
      {/* 유리 칸막이 */}
      <mesh position={[(X0 + DIR_X) / 2, 1.7, DIR_Z]}>
        <boxGeometry args={[DIR_X - X0, 1.4, 0.012]} />
        <meshStandardMaterial color={C.glass} roughness={0.05} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <Box p={[(X0 + DIR_X) / 2, WALL_H - 0.025, DIR_Z]} s={[DIR_X - X0, 0.05, 0.06]} c="#c3c8cf" rough={0.5} metal={0.3} />
      <Box p={[DIR_X, 1.0, DIR_Z]} s={[0.06, 0.02, 0.06]} c={C.frame} rough={0.4} metal={0.6} />
      <Box p={[DIR_X, 1.7, DIR_Z]} s={[0.06, 1.4, 0.06]} c="#c3c8cf" rough={0.5} metal={0.3} />

      {/* 입구: 유리문, 신발장, 우산꽂이, 매트 */}
      <GlassDoor x={-3.4} z={Z0} />
      <ShoeCabinet x={X0 + 0.23} z={-2.55} />
      <UmbrellaStand x={-4.25} z={-3.2} />
      {/* 키오스크 뒤 콘센트와 바닥 표시 */}
      <Outlet x={-1.38} y={0.3} z={Z0 + WALL_T / 2 + 0.006} />
      {/* 키오스크 위 벽시계, 뒤벽 학원 색 띠 */}
      <Model url={MODELS.clock} position={[-0.4, 2.0, Z0 + WALL_T / 2]} />
      <mesh position={[0.25, 1.15, Z0 + WALL_T / 2 + 0.002]}>
        <planeGeometry args={[1.3, 0.06]} />
        <meshStandardMaterial color={C.navy} roughness={0.7} />
      </mesh>

      {/* 대기 의자와 게시판(왼쪽 벽) */}
      <Bench x={X0 + 0.3} z={-0.2} len={1.6} rotationY={Math.PI / 2} />
      {/* 기다리는 학부모(휴대폰으로 입실 알림을 받는다) */}
      <SeatedPerson seat={[-4.74, 0.455, -0.2]} rotationY={Math.PI / 2} phone look={CAST.parent} />
      <NoticeBoard x={X0 + WALL_T / 2 + 0.02} y={1.55} z={-0.2} rotationY={Math.PI / 2} />
      <Model url={MODELS.plant} position={[X0 + 0.45, 0, 0.95]} />
      <Model url={MODELS.extinguisher} position={[0.75, 0, -3.3]} />
      <Model url={MODELS.plant} position={[0.6, 0, 1.0]} scale={0.85} rotationY={1.4} />

      {/* 원장실: 책상, 모니터, 상담 탁자, 책장 */}
      <DirectorDesk x={-2.75} z={2.2} />
      <SeatedPerson seat={[-2.75, 0.51, 2.9]} rotationY={Math.PI} look={CAST.director} />
      <ConsultTable x={-4.3} z={2.45} />
      <Model url={MODELS.shelf} position={[-0.86, 0, 2.95]} />

      {/* 교실 A(열린 문): 책상 6개가 화이트보드(오른쪽 벽)를 본다 */}
      <Whiteboard x={X1 - WALL_T / 2 - 0.02} y={1.35} z={-1.15} rotationY={-Math.PI / 2} w={1.8} />
      {[-2.75, -1.75, -0.8].flatMap((dz) =>
        [2.4, 3.6].map((dx) => (
          <group key={`a${dx}${dz}`}>
            <Model url={MODELS.desk} position={[dx + 0.1, 0, dz]} rotationY={-Math.PI / 2} />
            <Model url={MODELS.chair} position={[dx - 0.42, 0, dz]} rotationY={-Math.PI / 2} />
          </group>
        )),
      )}
      {/* 화이트보드 앞 선생님(학생 쪽을 본다) */}
      <StandingPerson at={[4.5, 0, -1.5]} rotationY={-Math.PI / 2} look={CAST.teacher} />
      {/* 교실 B(닫힌 문) */}
      <Whiteboard x={X1 - WALL_T / 2 - 0.02} y={1.35} z={2.35} rotationY={-Math.PI / 2} w={1.6} />
      {[1.95, 2.95].flatMap((dz) =>
        [2.4, 3.6].map((dx) => (
          <group key={`b${dx}${dz}`}>
            <Model url={MODELS.desk} position={[dx + 0.1, 0, dz]} rotationY={-Math.PI / 2} />
            <Model url={MODELS.chair} position={[dx - 0.42, 0, dz]} rotationY={-Math.PI / 2} />
          </group>
        )),
      )}
    </group>
  );
}

for (const u of Object.values(MODELS)) useGLTF.preload(u);
