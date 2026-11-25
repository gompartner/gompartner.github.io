"use client";

import { useEffect, useRef } from "react";

// 피부과 2027 리퀴드 글래스(11-25). 실제 공간 사진 위에 큰 물방울 하나가 떠서 지나가는 곳을 굴절, 확대해 보여 준다.
// 장면이 바뀔 때는 물방울 안에 다음 공간이 비치다가, 물방울이 화면 가득 커지며 그 공간으로 넘어간다.
// three 없이 WebGL 하나로 그린다(전체 화면 사각형 하나, 사진 두 장). progress는 0~1 스크롤 진행값(ref).

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;      // 지금 공간
uniform sampler2D uB;      // 다음 공간(물방울 안에 비침)
uniform vec2 uScaleA;      // 화면을 꽉 채우는 비율(cover)
uniform vec2 uScaleB;
uniform vec2 uRes;
uniform vec2 uC;           // 물방울 중심(0~1)
uniform float uR;          // 반지름(화면 짧은 변 기준)
uniform float uNext;       // 물방울 안에 다음 공간이 비치는 정도
uniform float uTime;
uniform float uFill;       // 물방울이 화면을 덮는 정도(넘어갈 때)

vec3 tex(sampler2D t, vec2 s, vec2 uv) {
  vec2 q = (uv - 0.5) * s + 0.5;
  return texture2D(t, clamp(q, 0.001, 0.999)).rgb;
}

void main() {
  float m = min(uRes.x, uRes.y);
  vec2 px = vUv * uRes;
  vec2 c = uC * uRes;
  vec2 d = (px - c) / m;
  // 물방울 가장자리가 살짝 출렁인다
  float a = atan(d.y, d.x);
  float wob = 1.0 + 0.025 * sin(a * 3.0 + uTime * 1.6) + 0.018 * sin(a * 5.0 - uTime * 1.1);
  float r = uR * wob;
  float dist = length(d) / r;

  vec3 outside = tex(uA, uScaleA, vUv);
  // 물방울 그림자(빛이 위 왼쪽에서 온다)
  vec2 sd = d - vec2(0.012, -0.02);
  float shadow = smoothstep(1.25, 0.85, length(sd) / r) * 0.18 * (1.0 - uFill);
  outside *= 1.0 - shadow;

  if (dist < 1.0) {
    // 볼록 렌즈: 가운데는 크게, 가장자리로 갈수록 강하게 휘어진다
    float h = sqrt(1.0 - dist * dist);
    vec2 n = d / r;
    float mag = mix(0.62, 1.0, uFill);
    vec2 bend = n * (1.0 - h) * 0.18 * (1.0 - uFill);
    vec2 base = (c / uRes) + (d * m / uRes) * mag;
    // 색 번짐(가장자리에서 빨강, 파랑이 조금씩 어긋남)
    float ca = 0.012 * pow(dist, 3.0) * (1.0 - uFill);
    vec3 ia, ib;
    vec2 uv0 = base - bend;
    ia.r = tex(uA, uScaleA, uv0 + n * ca).r;
    ia.g = tex(uA, uScaleA, uv0).g;
    ia.b = tex(uA, uScaleA, uv0 - n * ca).b;
    ib.r = tex(uB, uScaleB, uv0 + n * ca).r;
    ib.g = tex(uB, uScaleB, uv0).g;
    ib.b = tex(uB, uScaleB, uv0 - n * ca).b;
    vec3 inside = mix(ia, ib, uNext);
    // 맑은 물: 살짝 밝고 차갑게, 가장자리는 어둡게(두께)
    inside = inside * 1.04 + vec3(0.01, 0.02, 0.03);
    float edge = smoothstep(0.75, 1.0, dist) * (1.0 - uFill);
    inside *= 1.0 - edge * 0.22;
    // 빛 맺힘: 위 왼쪽에 큰 하이라이트, 아래 오른쪽에 되비침
    vec2 hl = n - vec2(-0.35, 0.42);
    float spec = exp(-dot(hl, hl) * 60.0) * 0.45 + exp(-pow(dist - 0.94, 2.0) * 1400.0) * 0.25 * step(0.0, n.y);
    vec2 bl = n - vec2(0.4, -0.5);
    spec += exp(-dot(bl, bl) * 70.0) * 0.12;
    inside += spec * (1.0 - uFill);
    float aa = smoothstep(1.0, 0.985, dist);
    gl_FragColor = vec4(mix(outside, inside, aa), 1.0);
  } else {
    gl_FragColor = vec4(outside, 1.0);
  }
}
`;

export type DropScene = { k: string; path: [number, number][] };

function load(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => x * x * (3 - 2 * x);

export default function DropLens({ progress, scenes, base, still, onReady }: { progress: React.RefObject<number>; scenes: DropScene[]; base: string; still: boolean; onReady?: () => void }) {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const tall = innerHeight > innerWidth * 1.1;
    const small = innerWidth < 1100;
    const sfx = tall ? "-m" : small ? "-sm" : "";
    const sh = (t: number, s: string) => {
      const o = gl.createShader(t)!;
      gl.shaderSource(o, s);
      gl.compileShader(o);
      return o;
    };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(pr, n);
    const u = { A: U("uA"), B: U("uB"), sA: U("uScaleA"), sB: U("uScaleB"), res: U("uRes"), c: U("uC"), r: U("uR"), next: U("uNext"), time: U("uTime"), fill: U("uFill") };
    gl.uniform1i(u.A, 0);
    gl.uniform1i(u.B, 1);

    const texs: { t: WebGLTexture; w: number; h: number }[] = [];
    let alive = true;
    let raf = 0;
    let t0 = performance.now();
    let target = progress.current ?? 0;
    let cur = target;
    const mouse = { x: 0, y: 0 };

    const size = () => {
      const dpr = Math.min(small ? 1.25 : 1.75, devicePixelRatio || 1);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const cover = (w: number, h: number) => {
      const sa = canvas.width / canvas.height;
      const ta = w / h;
      return sa > ta ? [1, ta / sa] : [sa / ta, 1];
    };
    const bind = (unit: number, i: number) => {
      const x = texs[Math.min(i, texs.length - 1)];
      gl.activeTexture(unit === 0 ? gl.TEXTURE0 : gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, x.t);
      const s = cover(x.w, x.h);
      gl.uniform2f(unit === 0 ? u.sA : u.sB, s[0], s[1]);
    };

    const draw = () => {
      if (!alive || !texs.length) return;
      cur += (target - cur) * (still ? 1 : 0.12);
      if (Math.abs(target - cur) < 0.00005) cur = target;
      const p = cur;
      const n = scenes.length;
      const span = 0.9 / n;
      const i = Math.min(n - 1, Math.floor(Math.min(p, 0.8999) / span));
      const t = (p - i * span) / span;
      // 물방울은 장면마다 정한 길(path)을 따라 흘러간다
      const path = scenes[i].path;
      const seg = clamp01(t / 0.7) * (path.length - 1);
      const k = Math.min(path.length - 2, Math.floor(seg));
      const f = ease(seg - k);
      let cx = path[k][0] + (path[k + 1][0] - path[k][0]) * f;
      let cy = path[k][1] + (path[k + 1][1] - path[k][1]) * f;
      // 마우스 쪽으로 조금 끌린다
      cx += mouse.x * 0.04;
      cy += mouse.y * 0.04;
      const next = ease(clamp01((t - 0.62) / 0.18));
      const fill = i < n - 1 ? ease(clamp01((t - 0.8) / 0.2)) : 0;
      const tall2 = canvas.height > canvas.width;
      const r0 = tall2 ? 0.36 : 0.24;
      const diag = Math.hypot(canvas.width, canvas.height) / Math.min(canvas.width, canvas.height);
      const r = r0 + fill * (diag * 0.9 - r0);
      // 넘어갈 때 물방울 중심을 화면 가운데로 모아 고르게 덮는다
      cx += (0.5 - cx) * fill;
      cy += (0.5 - cy) * fill;
      bind(0, i);
      bind(1, i < n - 1 ? i + 1 : i);
      // 끝 장면에서는 다음 공간 대신 같은 공간을 더 가까이
      gl.uniform1f(u.next, i < n - 1 ? next : 0);
      gl.uniform1f(u.fill, fill);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform2f(u.c, cx, 1 - cy);
      gl.uniform1f(u.r, r);
      gl.uniform1f(u.time, still ? 0 : (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };

    const on = () => {
      target = progress.current ?? 0;
    };
    const move = (e: PointerEvent) => {
      mouse.x = e.clientX / innerWidth - 0.5;
      mouse.y = e.clientY / innerHeight - 0.5;
    };
    const resize = () => size();
    size();
    // 첫 장면 두 장을 먼저, 나머지는 이어서 받는다
    Promise.all(scenes.map((s) => load(`${base}/${s.k}${sfx}.jpg`))).then((imgs) => {
      if (!alive) return;
      imgs.forEach((im) => {
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 사진은 위가 0, WebGL은 아래가 0
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        texs.push({ t, w: im.naturalWidth, h: im.naturalHeight });
      });
      t0 = performance.now();
      onReady?.();
      raf = requestAnimationFrame(draw);
    });
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      removeEventListener("scroll", on);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
    };
  }, [progress, scenes, base, still, onReady]);

  return <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />;
}
