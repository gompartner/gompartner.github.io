"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

// 치과 2026형(11-25) 첫 화면과 분해 장면의 임플란트 3D. 모델 파일 없이 코드로 만든다(크라운, 지대주, 픽스처).
// progress는 0~1 스크롤 진행값(ref), drag는 손으로 돌린 각도(ref). 화면 글자는 바깥(Dental2026)이 맡는다.

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 어금니 크라운: 회전체로 몸통을 만들고 윗면에 교두 네 개와 가운데 홈을 눌러 준다 */
function crownGeometry() {
  const pts: THREE.Vector2[] = [];
  const H = 1.05;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const y = t * H;
    // 아래는 잇몸 쪽으로 좁고, 가운데가 가장 볼록하고, 위는 둥글게 닫힌다
    const r = 0.46 + 0.3 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62) - (t > 0.82 ? Math.pow((t - 0.82) / 0.18, 2) * 0.74 : 0);
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const g = new THREE.LatheGeometry(pts, 96);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const rr = Math.hypot(v.x, v.z);
    // 어금니는 앞뒤보다 좌우가 조금 넓다
    v.x *= 1.08;
    v.z *= 0.94;
    if (v.y > H * 0.7) {
      const top = (v.y - H * 0.7) / (H * 0.3);
      const cusp = 0.07 * Math.cos(a * 4) * top; // 교두 네 개
      const groove = -0.12 * Math.exp(-Math.pow(rr / 0.2, 2)) * top; // 가운데 홈
      v.y += cusp + groove;
    }
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** 지대주: 아래 육각 연결부, 잇몸 칼라, 위로 좁아지는 기둥 */
function abutmentGeometry() {
  const pts = [
    [0.001, 0], [0.17, 0], [0.17, 0.12], [0.24, 0.16], [0.36, 0.3], [0.37, 0.36], [0.3, 0.4],
    [0.27, 0.44], [0.23, 0.82], [0.2, 0.88], [0.001, 0.9],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 64);
}

/** 픽스처 몸통: 위가 넓고 아래로 좁아지는 원뿔형 */
function fixtureCore() {
  const pts: THREE.Vector2[] = [];
  const L = 1.7;
  pts.push(new THREE.Vector2(0.001, 0));
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    pts.push(new THREE.Vector2(0.12 + 0.18 * Math.pow(t, 0.55), t * L));
  }
  pts.push(new THREE.Vector2(0.36, L));
  pts.push(new THREE.Vector2(0.36, L + 0.08));
  pts.push(new THREE.Vector2(0.001, L + 0.08));
  return new THREE.LatheGeometry(pts, 64);
}

/** 픽스처 나사산: 몸통을 감는 나선 관 */
function fixtureThread() {
  const L = 1.62;
  const turns = 11;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 900; i++) {
    const t = i / 900;
    const y = 0.08 + t * L;
    const r = 0.12 + 0.18 * Math.pow(y / 1.7, 0.55) + 0.005;
    const a = t * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 1100, 0.034, 8, false);
}

function Implant({ progress, drag, still }: { progress: React.RefObject<number>; drag: React.RefObject<number>; still: boolean }) {
  const root = useRef<THREE.Group>(null);
  const crown = useRef<THREE.Group>(null);
  const abut = useRef<THREE.Group>(null);
  const fix = useRef<THREE.Group>(null);
  const geo = useMemo(() => ({ crown: crownGeometry(), abut: abutmentGeometry(), core: fixtureCore(), thread: fixtureThread() }), []);
  const spin = useRef(0);

  useFrame((state, dt) => {
    const p = progress.current ?? 0;
    if (!still) spin.current += dt * 0.35;
    // 분해: 0.18~0.4에서 벌어지고 0.62~0.78에서 다시 붙는다
    const open = smooth(0.16, 0.36, p) * (1 - smooth(0.6, 0.76, p));
    if (crown.current) crown.current.position.y = 0.52 + open * 1.1;
    if (abut.current) abut.current.position.y = 0.0 + open * 0.15;
    if (fix.current) fix.current.position.y = -1.78 - open * 0.75;
    const aside = smooth(0.62, 0.82, p);
    if (root.current) {
      // 마지막 장면에서는 오른쪽으로 비켜나며 기운다
      // 좁은 화면은 옆으로 비킬 자리가 없어 제자리에서 기울기만 한다
      const wide = state.size.width > 700;
      root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, wide ? aside * 1.5 : 0, 0.12);
      root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, wide ? 0.2 : 0.2 + aside * 0.6, 0.12);
      root.current.rotation.z = THREE.MathUtils.lerp(root.current.rotation.z, -aside * 0.35, 0.12);
      root.current.rotation.y = spin.current + (drag.current ?? 0) + p * Math.PI * 1.2;
      const s = 0.92 - open * 0.08 - aside * 0.12;
      root.current.scale.setScalar(THREE.MathUtils.lerp(root.current.scale.x, s, 0.1));
    }
  });

  return (
    <group ref={root} position={[0, 0.2, 0]}>
      <group ref={crown}>
        <mesh geometry={geo.crown} castShadow>
          <meshPhysicalMaterial color="#fbf8f0" roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.3} sheen={0.5} sheenColor="#ffffff" envMapIntensity={1.4} />
        </mesh>
      </group>
      <group ref={abut}>
        <mesh geometry={geo.abut} castShadow>
          <meshStandardMaterial color="#d7dbe0" metalness={0.85} roughness={0.28} envMapIntensity={1.6} />
        </mesh>
      </group>
      <group ref={fix}>
        <mesh geometry={geo.core} castShadow>
          <meshStandardMaterial color="#b9c0c8" metalness={0.85} roughness={0.38} envMapIntensity={1.5} />
        </mesh>
        <mesh geometry={geo.thread} castShadow>
          <meshStandardMaterial color="#c6ccd3" metalness={0.85} roughness={0.32} envMapIntensity={1.5} />
        </mesh>
      </group>
    </group>
  );
}

/** 손으로 돌리는 각도는 바깥 ref에 쌓는다. 세로 스크롤은 막지 않는다(touch-action: pan-y) */
export default function Implant3D({ progress, drag, still }: { progress: React.RefObject<number>; drag: React.RefObject<number>; still: boolean }) {
  const last = useRef<number | null>(null);
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.1, 9.4], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y", cursor: "grab" }}
      onPointerDown={(e) => {
        last.current = e.clientX;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (last.current == null) return;
        drag.current = (drag.current ?? 0) + (e.clientX - last.current) * 0.01;
        last.current = e.clientX;
      }}
      onPointerUp={() => (last.current = null)}
      onPointerCancel={() => (last.current = null)}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <Implant progress={progress} drag={drag} still={still} />
      <ContactShadows position={[0, -2.1, 0]} opacity={0.28} scale={8} blur={2.6} far={4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 0, 6]} scale={[10, 6, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#ffffff" position={[0, -3, -4]} scale={6} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#bfe8e2" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>
    </Canvas>
  );
}
