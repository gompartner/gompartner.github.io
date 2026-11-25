"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";

// 치과 2027형(11-25) 실사 공간. 실제 치과 사진과 그 사진에서 뽑은 깊이 지도(Depth Anything V2)로 사진을 입체로 세우고,
// 스크롤하면 카메라가 사진 속으로 걸어 들어간다. 사진은 Unsplash 라이선스(상업 사용 가능, 출처 표기 의무 없음).
// 사진(11-25 교체): 접수 Unsplash ECBg5FQkBXI, 대기실 Unsplash pxOQ-P97sA8, 진료실 Pexels 9062525, 거울 Unsplash rubu_NvklJE.
// 움직임: 사진 속으로 다가가며 옆으로 비스듬히 돌아(앞뒤 물체가 따로 움직임), 초점이 먼 곳에서 가까운 곳으로 옮겨 간다.
// 11-25 손봄: 스크롤 값을 바로 쓰지 않고 따라가게(부드럽게), 사진 두 장이 겹쳐 비치지 않게 어두워졌다 밝아지며 넘김,
// 앞 물건 가장자리가 늘어나 번져 보이지 않게 입체 높이와 옆 움직임을 줄임.

const IMG = "/images/drafts/dent27";
/** aim, aimM: 다가갈 지점(사진 안 비율 x, y, 위에서부터). aimM은 세로 사진용 */
export type Scene = { k: string; from: number; to: number; focus: number; push: number; sway?: number; aim?: [number, number]; aimM?: [number, number] };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => x * x * (3 - 2 * x);
const T = 0.035; // 장면이 넘어가는 폭(진행값)

const VERT = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uStrength;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;
    vDepth = d;
    vec3 p = position;
    p.z += d * uStrength; // 가까운 것(밝은 값)이 앞으로 나온다
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uFocus;
  uniform float uBlur;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    // 초점 거리에서 먼 곳일수록 작은 밉맵을 읽어 흐리게(초점 옮기기)
    float b = clamp(abs(vDepth - uFocus) * uBlur, 0.0, 3.5);
    vec4 c = texture2D(uMap, vUv, b);
    gl_FragColor = vec4(mix(vec3(0.965, 0.965, 0.957), c.rgb, uOpacity), 1.0); // 겹치지 않고 밝은 바탕으로 바뀐다
    #include <colorspace_fragment>
  }
`;

type Opt = { still: boolean; small: boolean; tall: boolean };

function Layer({ scene, index, last, smoothRef, opt }: { scene: Scene; index: number; last: boolean; smoothRef: React.RefObject<number>; opt: Opt }) {
  const { still, small, tall } = opt;
  // 세로 화면(휴대폰, 세운 태블릿)은 원본에서 세로로 잘라 둔 사진(-m, 720x1200)을 쓴다. 가로 사진을 받아 양옆을 버리지 않게.
  // 가로로 든 작은 화면은 작은 사진(-sm), 나머지는 원본 크기
  const sfx = tall ? "-m" : small ? "-sm" : "";
  const focus = tall ? 0.5 : scene.focus;
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
      uniforms: { uMap: { value: tex }, uDepth: { value: depth }, uStrength: { value: 0 }, uOpacity: { value: 0 }, uFocus: { value: 0.3 }, uBlur: { value: 0 } },
    });
  }, [map, depth]);
  const geo = useMemo(() => (small ? new THREE.PlaneGeometry(1, 1, 110, 74) : new THREE.PlaneGeometry(1, 1, 200, 134)), [small]);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const p = smoothRef.current ?? 0;
    // 한 번에 한 장만 보인다. 끝에서 어두워지며 빨려 들어가고, 다음 장은 어둠에서 밝아진다
    const fadeIn = index === 0 ? 1 : clamp01((p - scene.from) / T);
    const fadeOut = last ? 1 : 1 - clamp01((p - (scene.to - T)) / T);
    const vis = p >= scene.from - 0.001 && (last || p < scene.to);
    m.visible = vis;
    if (!vis) return;
    const local = clamp01((p - scene.from) / (scene.to - scene.from));

    // 화면을 꽉 채우도록(cover) 크기를 맞추고, 사진 속으로 들어갈 여유를 둔다
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)) * 6;
    const vw = vh * viewport.aspect;
    const cover = Math.max(vw / aspect, vh) * 1.14;
    m.scale.set(cover * aspect, cover, 1);
    // 좁은 화면은 사진의 중요한 부분(focus, 0~1)을 가운데로
    const extra = Math.max(0, cover * aspect - vw) / 2;
    m.position.x = THREE.MathUtils.clamp((0.5 - focus) * cover * aspect, -extra, extra);
    const out = 1 - fadeOut;
    const e = ease(local);
    // 다가가는 동안 그 지점이 화면 가운데로 오게 판을 옮긴다(빈 벽이 아니라 의자, 꽃, 거울 쪽으로)
    const [ax, ay] = (tall ? scene.aimM : scene.aim) ?? [0.5, 0.5];
    const px = (ax - 0.5) * cover * aspect;
    const py = (0.5 - ay) * cover;
    m.position.x = THREE.MathUtils.clamp(m.position.x - px * e, -extra - Math.abs(px), extra + Math.abs(px));
    m.position.y = still ? 0 : -py * e;
    m.position.z = still ? 0 : e * scene.push + out * 0.9;
    // 비스듬히 돌아 들어가기: 판을 조금씩 돌리면 앞 물체와 뒤 벽이 다른 속도로 움직인다
    const sway = scene.sway ?? 0.12;
    m.rotation.y = still ? 0 : (0.5 - e) * sway * 2;
    m.rotation.x = still ? 0 : (e - 0.5) * sway * 0.4;
    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uStrength.value = still ? 0 : cover * 0.13;
    u.uOpacity.value = ease(Math.min(fadeIn, fadeOut));
    // 처음엔 안쪽(먼 곳)에 초점, 다가갈수록 앞 물건으로 초점이 온다
    u.uFocus.value = 0.25 + e * 0.6;
    u.uBlur.value = still ? 0 : small ? 1.8 : 2.6;
  });

  return <mesh ref={mesh} geometry={geo} material={mat} />;
}

/**
 * 필요할 때만 그린다(frameloop demand). 스크롤 진행값(progress)을 바로 쓰지 않고 smoothRef가 따라가게 해
 * 휴대폰 스크롤이 툭툭 끊겨도 화면은 미끄러지듯 움직인다. 따라가는 동안만 다음 장을 요청한다.
 */
function Rig({ progress, smoothRef, still }: { progress: React.RefObject<number>; smoothRef: React.RefObject<number>; still: boolean }) {
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
  useFrame((state, dt) => {
    const target = progress.current ?? 0;
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 7);
    const s = smoothRef.current ?? 0;
    const next = still ? target : s + (target - s) * k;
    smoothRef.current = next;
    // 마우스 위치에 따라 고개를 아주 살짝 돌리는 느낌(크게 움직이면 사진 가장자리가 늘어나 보인다)
    const c = state.camera;
    const tx = still ? 0 : state.pointer.x * 0.12;
    const ty = still ? 0 : state.pointer.y * 0.08;
    c.position.x += (tx - c.position.x) * k;
    c.position.y += (ty - c.position.y) * k;
    c.lookAt(0, 0, -2);
    if (Math.abs(target - next) > 0.00005 || Math.abs(c.position.x - tx) + Math.abs(c.position.y - ty) > 0.001) state.invalidate();
  });
  return null;
}

function Ready({ onReady }: { onReady?: () => void }) {
  // 사진을 다 받아 첫 장을 그린 뒤 알린다(그 전까지 바깥의 정지 사진이 자리를 지킨다)
  useEffect(() => onReady?.(), [onReady]);
  return null;
}

function PhotoSpace3D({ progress, scenes, still, low, onReady }: { progress: React.RefObject<number>; scenes: Scene[]; still: boolean; low: boolean; onReady?: () => void }) {
  const opt = useMemo(() => {
    const w = typeof window !== "undefined" ? innerWidth : 1280;
    const h = typeof window !== "undefined" ? innerHeight : 800;
    return { still, small: w < 768, tall: h > w * 1.1 };
  }, [still]);
  const smoothRef = useRef<number>(progress.current ?? 0);
  const light = low || opt.small;
  return (
    <Canvas
      frameloop="demand"
      dpr={light ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 50 }}
      gl={{ antialias: !light, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#f6f6f4"]} />
      <Rig progress={progress} smoothRef={smoothRef} still={still} />
      {scenes.map((s, i) => (
        <Layer key={s.k} scene={s} index={i} last={i === scenes.length - 1} smoothRef={smoothRef} opt={opt} />
      ))}
      <Ready onReady={onReady} />
    </Canvas>
  );
}

// 바깥(Dental2027)이 스크롤마다 다시 그려져도 3D는 다시 만들지 않는다
export default memo(PhotoSpace3D);
