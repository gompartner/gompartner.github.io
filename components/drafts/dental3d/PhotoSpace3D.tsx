"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";

// 치과 2027형(11-25) 실사 공간. 실제 치과 사진과 그 사진에서 뽑은 깊이 지도(Depth Anything V2)로 사진을 입체로 세우고,
// 스크롤하면 카메라가 사진 속으로 걸어 들어간다. 사진은 Unsplash 라이선스(상업 사용 가능, 출처 표기 의무 없음).
// 대기실 Benyamin Bohlouli(B_sK_xgzwVA), 진료실 aFqSRokmw2E, 진료 의자 Ozkan Guner(AQG6C_xYEpA).

const IMG = "/images/drafts/dent27";
export type Scene = { k: string; from: number; to: number; focus: number; push: number };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => x * x * (3 - 2 * x);

const VERT = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;
    vec3 p = position;
    p.z += d * uStrength; // 가까운 것(밝은 값)이 앞으로 나온다
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uBright;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    gl_FragColor = vec4(mix(c.rgb, vec3(1.0), uBright), uOpacity);
    #include <colorspace_fragment>
  }
`;

type Opt = { still: boolean; small: boolean };

function Layer({ scene, progress, index, opt }: { scene: Scene; progress: React.RefObject<number>; index: number; opt: Opt }) {
  const { still, small } = opt;
  // 휴대폰은 작은 사진(1000px)과 작은 깊이 지도, 적은 격자로 그린다
  const sfx = small ? "-sm" : "";
  const [map, depth] = useLoader(THREE.TextureLoader, [`${IMG}/${scene.k}${sfx}.jpg`, `${IMG}/${scene.k}-depth${sfx}.png`]);
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, camera } = useThree();
  const aspect = map.image ? map.image.width / map.image.height : 1.5;
  const mat = useMemo(() => {
    const tex = map.clone();
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: { uMap: { value: tex }, uDepth: { value: depth }, uStrength: { value: 0 }, uOpacity: { value: 0 }, uBright: { value: 0 } },
    });
  }, [map, depth]);
  const geo = useMemo(() => small ? new THREE.PlaneGeometry(1, 1, 110, 74) : new THREE.PlaneGeometry(1, 1, 200, 134), [small]);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const p = progress.current ?? 0;
    const local = clamp01((p - scene.from) / (scene.to - scene.from));
    // 앞뒤 장면과 겹치며 바뀐다
    const fadeIn = index === 0 ? 1 : clamp01((p - scene.from) / 0.05);
    const fadeOut = 1 - clamp01((p - (scene.to - 0.02)) / 0.05);
    const op = Math.min(fadeIn, fadeOut);
    m.visible = op > 0.001;
    if (!m.visible) return;

    // 화면을 꽉 채우도록(cover) 크기를 맞추고, 사진 속으로 들어갈 여유를 둔다
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)) * 6;
    const vw = vh * viewport.aspect;
    const cover = Math.max(vw / aspect, vh) * 1.12;
    m.scale.set(cover * aspect, cover, 1);
    // 좁은 화면은 사진의 중요한 부분(focus, 0~1)을 가운데로
    const extra = Math.max(0, cover * aspect - vw) / 2;
    m.position.x = THREE.MathUtils.clamp((0.5 - scene.focus) * cover * aspect, -extra, extra);
    // 걸어 들어가기: 사진을 카메라 쪽으로 당긴다. 넘어갈 때는 더 빠르게 빨려 들어간다
    const out = clamp01((p - (scene.to - 0.02)) / 0.05);
    m.position.z = still ? 0 : ease(local) * scene.push + out * 1.6;
    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uStrength.value = still ? 0 : cover * 0.16;
    u.uOpacity.value = op;
    u.uBright.value = 0;
    m.renderOrder = index;
  });

  return <mesh ref={mesh} geometry={geo} material={mat} />;
}

/** 필요할 때만 그린다(frameloop demand). 스크롤, 크기 변경, 포인터 이동 때 한 장 그리고, 카메라가 따라가는 동안만 이어서 그린다 */
function Rig({ still }: { still: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const on = () => invalidate();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    addEventListener("pointermove", on, { passive: true });
    return () => {
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
      removeEventListener("pointermove", on);
    };
  }, [invalidate]);
  // 손가락, 마우스 위치에 따라 고개를 살짝 돌리는 느낌
  useFrame((state) => {
    const c = state.camera;
    const tx = still ? 0 : state.pointer.x * 0.35;
    const ty = still ? 0 : state.pointer.y * 0.2;
    c.position.x = THREE.MathUtils.lerp(c.position.x, tx, 0.08);
    c.position.y = THREE.MathUtils.lerp(c.position.y, ty, 0.08);
    c.lookAt(0, 0, -2);
    if (Math.abs(c.position.x - tx) + Math.abs(c.position.y - ty) > 0.002) state.invalidate();
  });
  return null;
}

function PhotoSpace3D({ progress, scenes, still, low }: { progress: React.RefObject<number>; scenes: Scene[]; still: boolean; low: boolean }) {
  const opt = useMemo(() => ({ still, small: typeof window !== "undefined" && innerWidth < 768 }), [still]);
  const light = low || opt.small;
  return (
    <Canvas
      frameloop="demand"
      dpr={light ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 50 }}
      gl={{ antialias: !light, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#111"]} />
      <Rig still={still} />
      {scenes.map((s, i) => (
        <Layer key={s.k} scene={s} index={i} progress={progress} opt={opt} />
      ))}
    </Canvas>
  );
}

// 바깥(Dental2027)이 스크롤마다 다시 그려져도 3D는 다시 만들지 않는다
export default memo(PhotoSpace3D);
