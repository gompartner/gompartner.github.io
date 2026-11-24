"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";

// 치과 2027형(11-25) 공간 3D. 모델 파일 없이 상자와 원기둥으로 치과 안을 짓고, 스크롤 진행값(progress)으로 카메라가 걸어 들어간다.
// 입구(z 0) > 대기실(z -4 ~ -12) > 진료실(-12 ~ -20) > 상담실(-20 ~ -28) > 끝 창(-28).

const W = 8; // 실내 폭
const C = {
  wall: "#f2eee7",
  floor: "#c8a57a",
  ceil: "#faf8f4",
  green: "#1f4d3a",
  oak: "#b88a5a",
  white: "#ffffff",
  metal: "#c9ced4",
  fabric: "#d9cfc0",
};

// 진행값 구간마다 카메라 z와 옆 시선(x). 방마다 잠깐 머문다
const KEYS: [number, number, number][] = [
  [0, 8.5, 0],
  [0.12, 1.5, 0],
  [0.24, -6.2, -0.6],
  [0.36, -7.2, 0.6],
  [0.48, -12.9, -0.9],
  [0.6, -13.6, -0.3],
  [0.72, -22.2, 0.3],
  [0.84, -23.2, -0.2],
  [1, -26.5, 0],
];
const ease = (t: number) => t * t * (3 - 2 * t);
function along(p: number) {
  for (let i = 1; i < KEYS.length; i++) {
    const [p1, z1, x1] = KEYS[i];
    const [p0, z0, x0] = KEYS[i - 1];
    if (p <= p1) {
      const t = ease((p - p0) / (p1 - p0));
      return [z0 + (z1 - z0) * t, x0 + (x1 - x0) * t];
    }
  }
  return [KEYS[KEYS.length - 1][1], 0];
}

function Rig({ progress }: { progress: React.RefObject<number> }) {
  const look = useRef(new THREE.Vector3());
  useFrame(({ camera, pointer }) => {
    const p = progress.current ?? 0;
    const [z, x] = along(p);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, z, 0.12);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x * 0.6, 0.08);
    camera.position.y = 1.62 + Math.sin(p * 40) * 0.015;
    // 마우스를 따라 고개를 살짝 돌린다
    look.current.set(x + pointer.x * 0.8, 1.45 + pointer.y * 0.3, camera.position.z - 6);
    camera.lookAt(look.current);
  });
  return null;
}

function Doors({ progress }: { progress: React.RefObject<number> }) {
  const l = useRef<THREE.Mesh>(null);
  const r = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const p = progress.current ?? 0;
    const o = ease(Math.min(1, Math.max(0, (p - 0.02) / 0.08)));
    if (l.current) l.current.position.x = -0.6 - o * 1.15;
    if (r.current) r.current.position.x = 0.6 + o * 1.15;
  });
  const glass = <meshPhysicalMaterial color="#dfeee9" transmission={0.85} roughness={0.08} thickness={0.1} transparent opacity={0.55} />;
  return (
    <group position={[0, 0, 0]}>
      <mesh ref={l} position={[-0.6, 1.25, 0.02]}>
        <boxGeometry args={[1.2, 2.5, 0.05]} />
        {glass}
      </mesh>
      <mesh ref={r} position={[0.6, 1.25, 0.02]}>
        <boxGeometry args={[1.2, 2.5, 0.05]} />
        {glass}
      </mesh>
    </group>
  );
}

/** 문 구멍이 있는 칸막이 벽(가운데 폭 gap) */
function Partition({ z, gap = 2.6, color = C.wall }: { z: number; gap?: number; color?: string }) {
  const side = (W - gap) / 2;
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-(gap / 2 + side / 2), 1.6, 0]}>
        <boxGeometry args={[side, 3.2, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[gap / 2 + side / 2, 1.6, 0]}>
        <boxGeometry args={[side, 3.2, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 2.95, 0]}>
        <boxGeometry args={[gap, 0.5, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Pendant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.85, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.7]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 2.45, 0]}>
        <sphereGeometry args={[0.16, 24, 16]} />
        <meshStandardMaterial color="#fff6e6" emissive="#ffe2b0" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0, 2.3, 0]} intensity={4} distance={5} color="#ffe6c4" />
    </group>
  );
}

function Plant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 0.6, 24]} />
        <meshStandardMaterial color="#e8e2d8" />
      </mesh>
      {[
        [0, 1.05, 0, 0.42],
        [0.2, 1.35, 0.1, 0.32],
        [-0.18, 1.3, -0.08, 0.3],
        [0.05, 1.6, -0.05, 0.24],
      ].map(([a, b, c, r], i) => (
        <mesh key={i} position={[a, b, c]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={i % 2 ? "#3e6b46" : "#4f7d52"} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Waiting() {
  return (
    <group>
      {/* 안내 데스크 */}
      <RoundedBox args={[2.6, 1.05, 0.7]} radius={0.08} position={[-2.2, 0.52, -6.2]}>
        <meshStandardMaterial color={C.oak} roughness={0.6} />
      </RoundedBox>
      <mesh position={[-2.2, 1.07, -6.2]}>
        <boxGeometry args={[2.7, 0.05, 0.8]} />
        <meshStandardMaterial color={C.white} roughness={0.3} />
      </mesh>
      {/* 소파 */}
      <group position={[2.6, 0, -8.6]} rotation-y={-Math.PI / 2}>
        <RoundedBox args={[2.4, 0.42, 0.9]} radius={0.1} position={[0, 0.3, 0]}>
          <meshStandardMaterial color={C.green} roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[2.4, 0.6, 0.25]} radius={0.1} position={[0, 0.7, -0.35]}>
          <meshStandardMaterial color={C.green} roughness={0.9} />
        </RoundedBox>
      </group>
      <Plant x={3.1} z={-5.4} />
      <Plant x={-3.2} z={-10.8} />
      <Pendant x={-2.2} z={-6.2} />
      <Pendant x={1.6} z={-8.6} />
      {/* 벽 액자 */}
      <mesh position={[-3.89, 1.7, -9]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.6, 1]} />
        <meshStandardMaterial color="#d7e3dd" />
      </mesh>
    </group>
  );
}

function Treatment() {
  return (
    <group position={[1.2, 0, -17.4]} rotation-y={-0.6}>
      {/* 유닛 체어 */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.5, 32]} />
        <meshStandardMaterial color={C.white} />
      </mesh>
      <RoundedBox args={[0.75, 0.18, 1.2]} radius={0.08} position={[0, 0.62, 0.1]}>
        <meshStandardMaterial color={C.green} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.7, 0.16, 0.95]} radius={0.08} position={[0, 0.95, -0.75]} rotation-x={0.75}>
        <meshStandardMaterial color={C.green} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.14, 0.7]} radius={0.06} position={[0, 0.48, 0.95]} rotation-x={-0.35}>
        <meshStandardMaterial color={C.green} roughness={0.7} />
      </RoundedBox>
      {/* 라이트 암 */}
      <mesh position={[0.9, 1.3, -0.2]}>
        <cylinderGeometry args={[0.04, 0.04, 2.6]} />
        <meshStandardMaterial color={C.metal} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.45, 2.5, -0.4]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.03, 0.03, 0.95]} />
        <meshStandardMaterial color={C.metal} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.3, -0.4]} rotation-x={0.4}>
        <cylinderGeometry args={[0.32, 0.26, 0.12, 32]} />
        <meshStandardMaterial color={C.white} emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      <spotLight position={[0, 2.3, -0.4]} target-position={[0, 0.7, 0]} angle={0.5} penumbra={0.6} intensity={18} distance={5} />
      {/* 모니터 */}
      <mesh position={[-0.9, 1.6, -0.6]} rotation-y={0.5}>
        <boxGeometry args={[0.8, 0.5, 0.04]} />
        <meshStandardMaterial color="#1b1f22" emissive="#9fc7bb" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-0.9, 0.9, -0.6]}>
        <cylinderGeometry args={[0.03, 0.03, 1.3]} />
        <meshStandardMaterial color={C.metal} />
      </mesh>
      {/* 수납장 */}
      <RoundedBox args={[1.8, 0.9, 0.55]} radius={0.04} position={[-1.6, 0.45, -1.8]}>
        <meshStandardMaterial color={C.white} />
      </RoundedBox>
    </group>
  );
}

function Consult() {
  return (
    <group position={[0, 0, -24.4]}>
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.05, 48]} />
        <meshStandardMaterial color={C.oak} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.06, 0.25, 0.74, 24]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.15, 0, 0.2]} rotation-y={-s * 1.2}>
          <RoundedBox args={[0.55, 0.1, 0.55]} radius={0.04} position={[0, 0.47, 0]}>
            <meshStandardMaterial color={C.fabric} />
          </RoundedBox>
          <RoundedBox args={[0.55, 0.5, 0.08]} radius={0.04} position={[0, 0.75, -0.25]}>
            <meshStandardMaterial color={C.fabric} />
          </RoundedBox>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.44]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        </group>
      ))}
      {/* 벽 모니터: CT 화면 */}
      <mesh position={[0, 1.75, -2.2]}>
        <boxGeometry args={[2.2, 1.25, 0.05]} />
        <meshStandardMaterial color="#111517" />
      </mesh>
      <mesh position={[0, 1.75, -2.17]}>
        <planeGeometry args={[2.05, 1.1]} />
        <meshStandardMaterial color="#20302c" emissive="#7fb3a4" emissiveIntensity={0.5} />
      </mesh>
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[-0.72 + i * 0.11, 1.62 + Math.sin(i * 0.45) * 0.12, -2.16]}>
          <boxGeometry args={[0.07, 0.22 + Math.cos(i * 0.6) * 0.06, 0.01]} />
          <meshStandardMaterial color="#f4f1e8" emissive="#f4f1e8" emissiveIntensity={0.7} />
        </mesh>
      ))}
      <Pendant x={0} z={0} />
    </group>
  );
}

function Building({ progress }: { progress: React.RefObject<number> }) {
  return (
    <group>
      {/* 바닥, 천장, 옆벽 */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -14]}>
        <planeGeometry args={[W, 30]} />
        <meshStandardMaterial color={C.floor} roughness={0.75} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, 3.2, -14]}>
        <planeGeometry args={[W, 30]} />
        <meshStandardMaterial color={C.ceil} emissive="#f4efe6" emissiveIntensity={0.55} />
      </mesh>
      <mesh rotation-y={Math.PI / 2} position={[-W / 2, 1.6, -14]}>
        <planeGeometry args={[30, 3.2]} />
        <meshStandardMaterial color={C.wall} />
      </mesh>
      <mesh rotation-y={-Math.PI / 2} position={[W / 2, 1.6, -14]}>
        <planeGeometry args={[30, 3.2]} />
        <meshStandardMaterial color={C.wall} />
      </mesh>
      {/* 바깥 보도와 입구 */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 6]}>
        <planeGeometry args={[30, 14]} />
        <meshStandardMaterial color="#d9d6d0" />
      </mesh>
      <Partition z={0} gap={2.4} color={C.green} />
      <mesh position={[0, 3.6, 0.05]}>
        <boxGeometry args={[W, 0.9, 0.3]} />
        <meshStandardMaterial color={C.green} />
      </mesh>
      <mesh position={[-2.4, 3.6, 0.22]}>
        <boxGeometry args={[1.6, 0.18, 0.02]} />
        <meshStandardMaterial color="#f6efe2" emissive="#f6efe2" emissiveIntensity={0.8} />
      </mesh>
      <Doors progress={progress} />
      <Partition z={-12} />
      <Partition z={-20} />
      {/* 끝 창: 밝은 바깥 */}
      <mesh position={[0, 1.6, -28.9]}>
        <planeGeometry args={[W, 3.2]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} />
      </mesh>
      <Waiting />
      <Treatment />
      <Consult />
    </group>
  );
}

export default function Clinic3D({ progress }: { progress: React.RefObject<number> }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.62, 8.5], fov: 55, near: 0.05, far: 60 }} gl={{ antialias: true }} style={{ touchAction: "pan-y" }}>
      <color attach="background" args={["#e9e4dc"]} />
      <fog attach="fog" args={["#e9e4dc", 10, 30]} />
      <hemisphereLight args={["#fffaf2", "#c9b79c", 1.1]} />
      <directionalLight position={[4, 8, 6]} intensity={0.9} />
      <Rig progress={progress} />
      <Building progress={progress} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1} position={[0, 2, 8]} scale={[10, 4, 1]} />
      </Environment>
    </Canvas>
  );
}
