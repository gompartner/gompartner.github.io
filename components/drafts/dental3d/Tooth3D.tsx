"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

// 치과 2027형(11-25) 유리 치아와 단면. 모델 파일 없이 회전체 반쪽 둘로 만들고, 스크롤에 따라 책처럼 열어 층(법랑질, 상아질, 신경, 잇몸과 뼈)을 보여 준다.
// progress는 0~1 스크롤 진행값(ref). 구간은 Dental2027의 글과 맞춘다.

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const BG = "#f2f3f4";

// 치아 윤곽(반지름, 높이). 잇몸선 CEJ, 씹는 면 TOP, 뿌리 끝 APEX
const CEJ = -0.05;
const TOP = 1.0;
const APEX = -1.6;
function enamelR(y: number) {
  const t = (y - CEJ) / (TOP - CEJ);
  let r = 0.38 + 0.17 * Math.sin(Math.min(1, t * 1.4) * Math.PI * 0.55);
  // 씹는 면은 평평하게, 모서리만 둥글게
  if (t > 0.82) r *= Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.82) / 0.18, 2)));
  return Math.max(0.001, r);
}
function rootR(y: number) {
  return 0.06 + 0.32 * Math.pow(clamp01((y - APEX) / (CEJ - APEX)), 0.7);
}
function dentinR(y: number) {
  if (y < CEJ) return rootR(y);
  // 법랑질은 잇몸선에서 0, 씹는 면 쪽으로 두꺼워진다
  return Math.max(0.001, enamelR(y) - 0.13 * smooth(CEJ, 0.25, y));
}
function pulpR(y: number) {
  if (y < -0.1) return 0.02 + 0.09 * Math.pow(clamp01((y + 1.5) / 1.4), 1.2);
  return 0.11 + 0.06 * Math.sin(Math.PI * clamp01((y + 0.1) / 0.62));
}
// 씹는 면의 교두: 바깥쪽(x축)이 솟고 자른 면(x=0) 쪽이 들어가며 가운데에 홈이 있다
const cuspTop = (y: number) => clamp01((y - 0.8) / 0.2);
const occlusal = (y: number, a: number, r: number) => (0.06 * Math.cos(2 * a) - 0.07 * Math.exp(-Math.pow(r / 0.16, 2))) * cuspTop(y);

function samples(y0: number, y1: number, n = 56) {
  return Array.from({ length: n + 1 }, (_, i) => y0 + ((y1 - y0) * i) / n);
}

/** 반쪽 회전체. side 1은 x>=0 쪽, -1은 x<=0 쪽 */
function halfLathe(f: (y: number) => number, y0: number, y1: number, side: 1 | -1, cusp = false) {
  const pts = [new THREE.Vector2(0.001, y0), ...samples(y0, y1).map((y) => new THREE.Vector2(f(y), y)), new THREE.Vector2(0.001, y1)];
  const g = new THREE.LatheGeometry(pts, 48, side === 1 ? 0 : Math.PI, Math.PI);
  if (cusp) {
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      p.setY(i, y + occlusal(y, Math.atan2(z, x), Math.hypot(x, z)));
    }
    g.computeVertexNormals();
  }
  return g;
}

/** 자른 면: (z, y) 평면에 윤곽 안쪽을 채운 판. x=0 자리에 놓인다 */
function cap(f: (y: number) => number, y0: number, y1: number, cusp = false) {
  const ys = samples(y0, y1);
  const dy = (y: number) => (cusp ? occlusal(y, Math.PI / 2, f(y)) : 0);
  const s = new THREE.Shape();
  s.moveTo(0, y0);
  ys.forEach((y) => s.lineTo(f(y), y + dy(y)));
  [...ys].reverse().forEach((y) => s.lineTo(-f(y), y + dy(y)));
  return toCutPlane(new THREE.ShapeGeometry(s));
}
function rectCap(z: number, y0: number, y1: number) {
  const s = new THREE.Shape();
  s.moveTo(-z, y0);
  s.lineTo(z, y0);
  s.lineTo(z, y1);
  s.lineTo(-z, y1);
  return toCutPlane(new THREE.ShapeGeometry(s));
}
function toCutPlane(g: THREE.BufferGeometry) {
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, 0, p.getY(i), p.getX(i));
  g.computeVertexNormals();
  return g;
}

const CAP_COLORS = { enamel: "#ffffff", dentin: "#f0d293", pulp: "#d0405a", gum: "#ec8f9a", bone: "#e9e0cf" };
const GREY = new THREE.Color("#d9dadb");
const FOCUS = [0.25, 0.05, -0.2, -0.45]; // 층마다 화면 가운데에 둘 높이

function makeMaterials() {
  {
    const capMat = (c: string, transparent = false) =>
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, side: THREE.DoubleSide, transparent, opacity: transparent ? 0 : 1 });
    return {
      enamel: new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transmission: 1,
        thickness: 0.9,
        roughness: 0.06,
        ior: 1.45,
        iridescence: 0.55,
        iridescenceIOR: 1.3,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.3,
      }),
      // 첫 화면은 속까지 비치도록 상아질도 반투명, 신경만 붉게 보인다
      dentin: new THREE.MeshPhysicalMaterial({ color: "#f8f1e4", roughness: 0.25, transmission: 0.85, thickness: 0.6, ior: 1.4 }),
      pulp: new THREE.MeshStandardMaterial({ color: "#efb3bd", roughness: 0.45 }),
      caps: {
        enamel: capMat(CAP_COLORS.enamel),
        dentin: capMat(CAP_COLORS.dentin),
        pulp: capMat(CAP_COLORS.pulp),
        gum: capMat(CAP_COLORS.gum, true),
        bone: capMat(CAP_COLORS.bone, true),
      },
    };
  }
}
type Mats = ReturnType<typeof makeMaterials>;
// 프레임마다 색과 투명도를 바꾸므로 재질은 화면에 하나뿐인 이 모듈에 한 번 만들어 둔다
let STORE: { mats: Mats; tmp: THREE.Color } | null = null;
const getStore = () => (STORE ??= { mats: makeMaterials(), tmp: new THREE.Color() });

function useGeometry(side: 1 | -1) {
  return useMemo(
    () => ({
      enamel: halfLathe(enamelR, CEJ, TOP, side, true),
      dentin: halfLathe(dentinR, APEX, 0.92, side),
      pulp: halfLathe(pulpR, -1.5, 0.53, side),
      capEnamel: cap(enamelR, CEJ, TOP, true),
      capDentin: cap(dentinR, APEX, 0.92),
      capPulp: cap(pulpR, -1.5, 0.53),
      capGum: rectCap(0.62, -0.3, 0.04),
      capBone: rectCap(0.62, -1.8, -0.3),
    }),
    [side],
  );
}

function Half({ side, mats, groupRef, capsRef }: { side: 1 | -1; mats: Mats; groupRef: React.RefObject<THREE.Group | null>; capsRef: React.RefObject<THREE.Group | null> }) {
  const g = useGeometry(side);
  // 자른 면은 몸통 바깥쪽으로 조금씩 띄워 겹쳐 그린다(뒤 판이 앞 판을 가리지 않게)
  const o = -side * 0.0015;
  return (
    <group ref={groupRef}>
      <mesh geometry={g.enamel} material={mats.enamel} />
      <mesh geometry={g.dentin} material={mats.dentin} />
      <mesh geometry={g.pulp} material={mats.pulp} />
      <group ref={capsRef} visible={false}>
        <mesh geometry={g.capBone} material={mats.caps.bone} position-x={o * 0.5} />
        <mesh geometry={g.capGum} material={mats.caps.gum} position-x={o} />
        <mesh geometry={g.capEnamel} material={mats.caps.enamel} position-x={o * 2} />
        <mesh geometry={g.capDentin} material={mats.caps.dentin} position-x={o * 3} />
        <mesh geometry={g.capPulp} material={mats.caps.pulp} position-x={o * 4} />
      </group>
    </group>
  );
}

function Tooth({ progress, still }: { progress: React.RefObject<number>; still: boolean }) {
  const mats = getStore().mats;
  const root = useRef<THREE.Group>(null);
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  const capsA = useRef<THREE.Group>(null);
  const capsB = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((state, dt) => {
    const { mats, tmp } = getStore();
    const p = progress.current ?? 0;
    const wide = state.size.width > 700;
    const open = smooth(0.13, 0.22, p) * (1 - smooth(0.72, 0.8, p));
    const real = smooth(0.76, 0.86, p);
    const L = p < 0.24 ? -1 : p < 0.36 ? 0 : p < 0.48 ? 1 : p < 0.6 ? 2 : p < 0.72 ? 3 : -1;

    // 닫혀 있을 때만 돈다. 열릴 때는 정면 각도로 돌아와 자른 면이 카메라를 향하게 한다
    if (!still) spin.current += dt * 0.45 * (1 - open);
    const home = Math.round(spin.current / (Math.PI * 2)) * Math.PI * 2;
    spin.current = THREE.MathUtils.lerp(spin.current, home, Math.min(1, open * 0.12));

    const ang = open * 1.15;
    const gap = open * (wide ? 0.78 : 0.62);
    if (a.current && b.current) {
      a.current.rotation.y = ang;
      a.current.position.x = gap;
      b.current.rotation.y = -ang;
      b.current.position.x = -gap;
    }
    const showCaps = open > 0.02;
    if (capsA.current) capsA.current.visible = showCaps;
    if (capsB.current) capsB.current.visible = showCaps;

    // 지금 층만 제 색, 나머지는 회색으로 가라앉힌다
    const c = mats.caps;
    const order = [c.enamel, c.dentin, c.pulp] as THREE.MeshStandardMaterial[];
    const base = [CAP_COLORS.enamel, CAP_COLORS.dentin, CAP_COLORS.pulp];
    order.forEach((m, i) => {
      tmp.set(base[i]);
      if (L >= 0 && L !== i && L !== 3) tmp.lerp(GREY, 0.35);
      if (L === 3) tmp.lerp(GREY, 0.2);
      m.color.lerp(tmp, 0.12);
    });
    const jaw = L === 3 ? 1 : 0;
    c.gum.opacity = THREE.MathUtils.lerp(c.gum.opacity, jaw, 0.1);
    c.bone.opacity = THREE.MathUtils.lerp(c.bone.opacity, jaw, 0.1);

    // 유리에서 실제 치아 질감으로
    const e = mats.enamel;
    // 열린 동안은 유리를 흐리게 해 단면 가장자리에 속 색이 번져 보이지 않게 한다
    e.transmission = (1 - real) * (1 - open * 0.75);
    const d = mats.dentin as THREE.MeshPhysicalMaterial;
    d.transmission = 0.85 * (1 - real) * (1 - open);
    // 첫 화면 속은 옅게, 열리면 해부도처럼 진하게
    d.color.lerp(tmp.set(open > 0.5 ? "#ead6a6" : "#f8f1e4"), 0.1);
    mats.pulp.color.lerp(tmp.set(open > 0.5 ? CAP_COLORS.pulp : "#efb3bd"), 0.1);
    e.roughness = 0.06 + real * 0.22;
    e.iridescence = 0.55 * (1 - real);
    e.color.set(real > 0.5 ? "#f6f3ec" : "#ffffff");

    if (root.current) {
      const s = (L >= 0 ? 1.12 : 1) * (wide ? 1 : 1.2);
      const fy = L >= 0 ? FOCUS[L] : -0.3;
      const k = 0.08;
      root.current.scale.setScalar(THREE.MathUtils.lerp(root.current.scale.x, s, k));
      root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, -fy * s, k);
      root.current.rotation.y = spin.current;
      root.current.rotation.z = THREE.MathUtils.lerp(root.current.rotation.z, 0.14 * (1 - open), k);
      root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, state.pointer.y * -0.12, 0.05);
    }
  });

  return (
    <group ref={root}>
      <group scale={[1, 1, 0.86]}>
        <Half side={1} mats={mats} groupRef={a} capsRef={capsA} />
        <Half side={-1} mats={mats} groupRef={b} capsRef={capsB} />
      </group>
    </group>
  );
}

export default function Tooth3D({ progress, still, low }: { progress: React.RefObject<number>; still: boolean; low: boolean }) {
  return (
    <Canvas dpr={low ? [1, 1.25] : [1, 1.75]} camera={{ position: [0, 0, 8.2], fov: 32 }} gl={{ antialias: true }} style={{ touchAction: "pan-y" }}>
      {/* 투과 재질이 뒤를 비춰 그리므로 배경을 캔버스 안에 둔다(페이지 바탕과 같은 색) */}
      <color attach="background" args={[BG]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#dfe9ff" />
      <Tooth progress={progress} still={still} />
      <ContactShadows position={[0, -2.15, 0]} opacity={0.2} scale={7} blur={2.8} far={4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 0, 6]} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffe9d6" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#d6e8ff" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1} position={[0, -3, -4]} scale={6} />
      </Environment>
    </Canvas>
  );
}
