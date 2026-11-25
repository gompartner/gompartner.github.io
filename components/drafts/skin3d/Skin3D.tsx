"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

// 피부과 2026 터치 인터랙션(11-25). 화면 가득 피부결을 크게 확대한 표면(결, 모공, 잔주름, 잡티).
// 손가락이나 마우스로 쓸면 빛이 지나간 자리가 매끈해진다(손대지 않으면 붓이 저절로 지나간다).
// 스크롤 구간: 레이저 토닝(빛줄기가 지나가며 잡티가 옅어짐), 리프팅(한 점에 빛이 모이며 잔주름이 펴짐), 보습(물방울이 스며들며 윤이 남).
// 모델, 사진 없이 코드로 만든다. 무늬는 처음 한 번 계산해 텍스처에 담고, 화면에서는 빛 계산만 한다(휴대폰 가볍게).

const N = 512; // 무늬 텍스처 크기(이음매 없이 반복)

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
/** 이음매 없는 값 노이즈 */
function vnoise(x: number, y: number, p: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const w = (t: number) => t * t * (3 - 2 * t);
  const h = (a: number, b: number) => hash(((a % p) + p) % p, ((b % p) + p) % p);
  const a = h(xi, yi);
  const b = h(xi + 1, yi);
  const c = h(xi, yi + 1);
  const d = h(xi + 1, yi + 1);
  return a + (b - a) * w(xf) + (c - a) * w(yf) + (a - b - c + d) * w(xf) * w(yf);
}

/** R 모공과 결 높이, G 잡티, B 잔주름, A 모공 중심. 한 번만 계산 */
function makeSkinTexture() {
  const data = new Uint8Array(N * N * 4);
  // 모공 자리: 격자마다 하나씩 흔들어 둔 점(셀 노이즈)
  const cells = 34;
  const pores: [number, number, number][] = [];
  for (let j = 0; j < cells; j++)
    for (let i = 0; i < cells; i++) pores.push([(i + 0.1 + hash(i, j) * 0.8) / cells, (j + 0.1 + hash(j + 9, i + 3) * 0.8) / cells, 0.5 + hash(i + 5, j + 7) * 0.7]);
  const spots: [number, number, number][] = Array.from({ length: 26 }, (_, k) => [hash(k, 1.3), hash(2.7, k), 0.006 + hash(k, k + 4) * 0.02]);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const u = x / N;
      const v = y / N;
      // 가장 가까운 모공까지 거리
      const ci = Math.floor(u * cells);
      const cj = Math.floor(v * cells);
      let dmin = 1;
      let size = 1;
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          const ii = (ci + di + cells) % cells;
          const jj = (cj + dj + cells) % cells;
          const p = pores[jj * cells + ii];
          let dx = Math.abs(u - p[0]);
          let dy = Math.abs(v - p[1]);
          dx = Math.min(dx, 1 - dx);
          dy = Math.min(dy, 1 - dy);
          const d = Math.hypot(dx, dy) * cells;
          if (d < dmin) {
            dmin = d;
            size = p[2];
          }
        }
      const pore = Math.max(0, 1 - dmin / (0.13 * size));
      // 결: 세 방향의 가는 골이 겹쳐 생기는 마름모 무늬(피부 미세 주름). 정수 방향이라 이음매 없이 반복된다
      const warp = (vnoise(u * 8, v * 8, 8) - 0.5) * 1.6 + (vnoise(u * 23, v * 23, 23) - 0.5) * 0.5;
      let groove = 0;
      for (const [a, b2, w] of [[17, 6, 1], [-5, 16, 0.85], [11, -13, 0.6]] as const) {
        const c = u * a + v * b2 + warp;
        const g = Math.pow(1 - Math.abs(Math.sin(Math.PI * c)), 6) * w * (0.55 + 0.45 * vnoise(u * 12 + a, v * 12 + b2, 12));
        groove = Math.max(groove, g);
      }
      const soft = vnoise(u * 6, v * 6, 6);
      const height = Math.min(1, Math.max(0, 0.8 - groove * 0.32 + soft * 0.2 + (vnoise(u * 90, v * 90, 90) - 0.5) * 0.08 - pore * 0.45));
      // 잡티
      let spot = 0;
      for (const s of spots) {
        let dx = Math.abs(u - s[0]);
        let dy = Math.abs(v - s[1]);
        dx = Math.min(dx, 1 - dx);
        dy = Math.min(dy, 1 - dy);
        spot = Math.max(spot, 1 - Math.hypot(dx, dy) / s[2]);
      }
      spot = Math.max(0, spot) * (0.6 + 0.4 * vnoise(u * 60, v * 60, 60));
      // 잔주름: 가로로 긴 가는 골
      const line = Math.pow(Math.max(0, 1 - Math.abs(Math.sin((v * 9 + vnoise(u * 3, v * 3, 3) * 0.9) * Math.PI)) * 14), 2) * vnoise(u * 5 + 3, v * 2, 5);
      const o = (y * N + x) * 4;
      data[o] = height * 255;
      data[o + 1] = Math.min(1, spot * 1.4) * 255;
      data[o + 2] = Math.min(1, line) * 255;
      data[o + 3] = 255 - pore * 255; // A: 모공 중심(어두운 구멍)
    }
  const tex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  uniform float uLift;
  uniform vec2 uFocus;
  void main() {
    vUv = uv;
    vec3 p = position;
    // 리프팅: 빛이 모이는 점 둘레가 살짝 솟는다
    float d = distance(uv, uFocus);
    p.z += uLift * 0.35 * exp(-d * d * 18.0);
    vec4 w = modelMatrix * vec4(p, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uSkin;
  uniform sampler2D uMask;
  uniform float uRep;
  uniform float uSmooth;
  uniform float uLaser;
  uniform float uLaserOn;
  uniform float uLift;
  uniform vec2 uFocus;
  uniform float uTime;
  uniform float uMoist;
  uniform vec4 uDrops[6];
  uniform vec3 uLight;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vec2 st = vUv * uRep;
    float e = 1.0 / 512.0;
    float m = texture2D(uMask, vUv).r;                 // 손으로 쓴 자리
    float sm = clamp(max(m, uSmooth), 0.0, 1.0);       // 매끈함
    float lineCut = 1.0 - uLift * (1.0 - smoothstep(0.0, 0.45, distance(vUv, uFocus)));
    vec4 t = texture2D(uSkin, st);
    float hx = texture2D(uSkin, st + vec2(e, 0.0)).r - texture2D(uSkin, st - vec2(e, 0.0)).r;
    float hy = texture2D(uSkin, st + vec2(0.0, e)).r - texture2D(uSkin, st - vec2(0.0, e)).r;
    float lx = texture2D(uSkin, st + vec2(e, 0.0)).b - texture2D(uSkin, st - vec2(e, 0.0)).b;
    float ly = texture2D(uSkin, st + vec2(0.0, e)).b - texture2D(uSkin, st - vec2(0.0, e)).b;
    float rough = (1.0 - sm * 0.85);
    float bump = 4.2 * rough;
    vec3 n = normalize(vec3(-(hx + lx * 0.8 * lineCut) * bump, -(hy + ly * 0.8 * lineCut) * bump, 1.0));

    // 물방울: 둥근 볼록면, 스며들수록 작아진다
    float drop = 0.0;
    float rim = 0.0;
    for (int i = 0; i < 6; i++) {
      vec4 d = uDrops[i];
      float r = d.z;
      if (r <= 0.0) continue;
      vec2 q = (vUv - d.xy) / r;
      q.x *= 1.6;
      float k = 1.0 - dot(q, q);
      if (k > 0.0) {
        n = normalize(mix(n, normalize(vec3(-q * 0.9, sqrt(k))), 0.85));
        drop = max(drop, sqrt(k));
        rim = max(rim, smoothstep(0.35, 0.0, k) * step(0.0, k));
      }
    }

    vec3 L = normalize(uLight);
    vec3 V = normalize(cameraPosition - vWorld);
    vec3 H = normalize(L + V);
    float ndl = max(dot(n, L), 0.0);
    float wrap = (dot(n, L) + 0.25) / 1.25;            // 피부처럼 그늘이 부드럽게
    vec3 base = vec3(0.91, 0.72, 0.62);
    vec3 deep = vec3(0.66, 0.38, 0.33);                // 그늘 속 붉은 기
    float spotAmt = t.g * (1.0 - smoothstep(uLaser - 0.02, uLaser + 0.02, 1.0 - vUv.y) * uLaserOn) * (1.0 - sm * 0.7);
    base = mix(base, vec3(0.62, 0.43, 0.33), spotAmt * 0.7);
    base *= 1.0 - (1.0 - t.r) * 0.3 * rough;           // 결 그늘
    base *= 1.0 - (1.0 - t.a) * 0.45 * rough;          // 모공은 어둡게 패인 구멍으로
    vec3 col = mix(deep, base, clamp(wrap, 0.0, 1.0));
    float gloss = mix(18.0, 70.0, max(sm, uMoist));
    float spec = pow(max(dot(n, H), 0.0), gloss) * mix(0.12, 0.55, max(uMoist, drop));
    col += spec;
    col *= 0.85 + 0.25 * ndl;
    col *= 1.0 - rim * 0.25;                            // 물방울 가장자리

    // 레이저 빛줄기
    float beam = exp(-pow((1.0 - vUv.y - uLaser) * 90.0, 2.0)) * uLaserOn;
    col = mix(col, vec3(0.75, 1.0, 0.95), beam * 0.8);
    // 리프팅 빛: 한 점으로 모이는 고리
    float dd = distance(vUv, uFocus);
    float ring = exp(-pow((dd - (0.28 - uLift * 0.26) - 0.02 * sin(uTime * 3.0)) * 60.0, 2.0)) * step(0.01, uLift) * (1.0 - uLift * 0.6);
    col += vec3(1.0, 0.95, 0.85) * ring * 0.5;
    col += vec3(1.0, 0.9, 0.8) * exp(-dd * dd * 900.0) * uLift * 0.6;
    // 손이 지나간 자리의 은은한 빛
    col += vec3(1.0, 0.96, 0.92) * m * 0.05;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** 손으로 쓴 자리를 그리는 작은 캔버스(텍스처로 넘긴다) */
function useMask() {
  return useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv);
    const paint = (u: number, v: number, r = 26) => {
      const g = ctx.createRadialGradient(u * 256, (1 - v) * 256, 0, u * 256, (1 - v) * 256, r);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(u * 256 - r, (1 - v) * 256 - r, r * 2, r * 2);
      tex.needsUpdate = true;
    };
    return { tex, paint };
  }, []);
}

function Surface({ progress, still }: { progress: React.RefObject<number>; still: boolean }) {
  const skin = useMemo(() => makeSkinTexture(), []);
  const mask = useMask();
  const mesh = useRef<THREE.Mesh>(null);
  const touched = useRef(0);
  const { viewport } = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uSkin: { value: skin },
          uMask: { value: mask.tex },
          uRep: { value: 1.25 },
          uSmooth: { value: 0 },
          uLaser: { value: 0 },
          uLaserOn: { value: 0 },
          uLift: { value: 0 },
          uFocus: { value: new THREE.Vector2(0.62, 0.55) },
          uTime: { value: 0 },
          uMoist: { value: 0 },
          uDrops: { value: Array.from({ length: 6 }, () => new THREE.Vector4(0, 0, 0, 0)) },
          uLight: { value: new THREE.Vector3(-0.8, 0.55, 0.35) },
        },
      }),
    [skin, mask.tex],
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1, 120, 120), []);
  const drops = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ x: 0.2 + ((i * 0.37) % 0.65), y: 0.25 + ((i * 0.53) % 0.55), r: 0.06 + (i % 3) * 0.02, at: 0.6 + i * 0.022 })), []);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const p = progress.current ?? 0;
    const u = (m.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value += dt;
    // 화면을 덮는 크기(기울어진 판이라 넉넉히)
    const s = Math.max(viewport.width, viewport.height) * 1.9;
    m.scale.set(s, s, 1);
    // 손대지 않으면 붓이 저절로 지나간다(첫 화면만)
    if (!still && p < 0.18 && performance.now() / 1000 - touched.current > 2.5) {
      const t = state.clock.elapsedTime * 0.45;
      mask.paint(0.5 + 0.3 * Math.sin(t * 1.3), 0.5 + 0.22 * Math.sin(t * 2.1 + 1), 18);
    }
    u.uLaserOn.value = smooth(0.18, 0.22, p) * (1 - smooth(0.4, 0.44, p));
    u.uLaser.value = smooth(0.2, 0.4, p) * 1.1 - 0.05;
    u.uLift.value = smooth(0.42, 0.56, p) * (1 - smooth(0.6, 0.66, p));
    u.uMoist.value = smooth(0.62, 0.8, p);
    u.uSmooth.value = smooth(0.2, 0.4, p) * 0.35 + smooth(0.42, 0.6, p) * 0.25 + smooth(0.62, 0.85, p) * 0.4;
    (u.uDrops.value as THREE.Vector4[]).forEach((v, i) => {
      const d = drops[i];
      const born = smooth(d.at, d.at + 0.02, p);
      const sink = smooth(d.at + 0.06, d.at + 0.16, p);
      v.set(d.x, d.y, d.r * born * (1 - sink), 0);
    });
    // 판을 비스듬히 눕히고, 스크롤에 따라 천천히 미끄러진다
    m.rotation.x = -0.62 + p * 0.25;
    m.position.y = -0.2 + p * 0.4;
    const L = u.uLight.value as THREE.Vector3;
    L.set(-0.8 + state.pointer.x * 0.6, 0.55 + state.pointer.y * 0.3, 0.35);
  });

  return (
    <mesh
      ref={mesh}
      geometry={geo}
      material={mat}
      onPointerMove={(e) => {
        if (!e.uv) return;
        touched.current = performance.now() / 1000;
        mask.paint(e.uv.x, e.uv.y);
      }}
    />
  );
}

export default function Skin3D({ progress, still, low }: { progress: React.RefObject<number>; still: boolean; low: boolean }) {
  return (
    <Canvas dpr={low ? [1, 1.25] : [1, 1.75]} camera={{ position: [0, 0, 4.2], fov: 38 }} gl={{ antialias: !low }} style={{ touchAction: "pan-y" }}>
      <color attach="background" args={["#f3e7df"]} />
      <Surface progress={progress} still={still} />
    </Canvas>
  );
}
