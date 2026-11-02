"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Clone, RoundedBox, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { RoomProps } from "./places";
import { CAST, SeatedPerson, StandingPerson } from "./People";

/*
  병원 로비 모형(잘라 낸 집 모형처럼 위에서 내려다본다).
  - 방 10 x 7m, 뒤벽과 왼벽은 2.6m, 카메라 쪽 앞벽과 오른벽은 낮게 잘라 안이 보이게 한다.
  - 의자, 화분, 시계, 꽃병, 협탁은 Poly Haven CC0 모델(public/models/clinic), 바닥과 벽, 상판은 Poly Haven CC0 텍스처(바닥 마루, 나무 상판과 문).
  - 색은 흰색, 밝은 나무, 병원 색(#0f5560) 세 가지로 맞춘다.
*/

const W = 10;
const D = 7;
const H = 2.6;
const LOW = 0.32;
const T = 0.12;
const X0 = -W / 2;
const X1 = W / 2;
const Z0 = -D / 2;
const Z1 = D / 2;

const M = "/models/clinic/";
const TX = "/textures/clinic/";

const WALL = "#f3f1ec";
const CUT = "#d8d2c8";
const WHITE = "#f7f7f5";
const SEAT = "#6f8f94";

function useSet(name: string, repeat: [number, number], tint?: string) {
  // 비스듬히 내려다보는 바닥, 나무결이 멀리서 자글거리지 않게 그래픽 카드가 허락하는 최대 이방성 필터를 쓴다
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const t = useTexture({ map: `${TX}${name}_diff_1k.jpg`, normalMap: `${TX}${name}_nor_gl_1k.jpg`, aoMap: `${TX}${name}_arm_1k.jpg` });
  return useMemo(() => {
    const out: Record<string, THREE.Texture> = {};
    for (const [k, v] of Object.entries(t)) {
      const c = v.clone();
      c.wrapS = c.wrapT = THREE.RepeatWrapping;
      c.repeat.set(repeat[0], repeat[1]);
      c.colorSpace = k === "map" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      c.anisotropy = maxAniso;
      c.needsUpdate = true;
      out[k] = c;
    }
    const m = new THREE.MeshStandardMaterial({ map: out.map, normalMap: out.normalMap, roughnessMap: out.aoMap, roughness: 1, color: tint ?? "#ffffff" });
    m.normalScale.set(0.6, 0.6);
    return m;
  }, [t, repeat, tint, maxAniso]);
}

const FLOOR_REPEAT: [number, number] = [4, 3];
const WOOD_REPEAT: [number, number] = [2, 0.4];
const DOOR_REPEAT: [number, number] = [1, 2];

/** 벽 한 면. 두께를 가진 상자이고, 잘린 윗면은 단면 색으로 칠한다 */
function Wall({ p, s }: { p: [number, number, number]; s: [number, number, number] }) {
  return (
    <group position={p}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={s} />
        <meshStandardMaterial color={WALL} roughness={0.92} />
      </mesh>
      <mesh position={[0, s[1] / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[s[0], s[2]]} />
        <meshStandardMaterial color={CUT} roughness={1} />
      </mesh>
    </group>
  );
}

function Baseboard({ p, len, rotY = 0 }: { p: [number, number, number]; len: number; rotY?: number }) {
  return (
    <mesh position={p} rotation={[0, rotY, 0]} receiveShadow>
      <boxGeometry args={[len, 0.08, 0.015]} />
      <meshStandardMaterial color="#e2ddd5" roughness={0.6} />
    </mesh>
  );
}

function Chair({ p, rot = 0 }: { p: [number, number, number]; rot?: number }) {
  const { scene } = useGLTF(`${M}modern_arm_chair_01.glb`);
  // 검은 가죽 대신 차분한 병원 색 천으로 바꾼다(모델의 결 무늬와 다리 나무는 그대로)
  const obj = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const src = mesh.material as THREE.MeshStandardMaterial;
      if (src.name.includes("pillow")) {
        const m = src.clone();
        m.map = null;
        m.color = new THREE.Color(SEAT);
        m.roughness = 0.85;
        m.metalness = 0;
        mesh.material = m;
      }
    });
    return s;
  }, [scene]);
  return <primitive object={obj} position={p} rotation={[0, rot, 0]} />;
}

function Model({ url, p, rot = 0, scale = 1 }: { url: string; p: [number, number, number]; rot?: number; scale?: number }) {
  const { scene } = useGLTF(url);
  return <Clone object={scene} position={p} rotation={[0, rot, 0]} scale={scale} castShadow receiveShadow />;
}

function Door({ p, rotY }: { p: [number, number, number]; rotY: number }) {
  const wood = useSet("white_oak_veneer", DOOR_REPEAT);
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      {/* 문틀 */}
      <mesh position={[0, 1.08, 0]} castShadow>
        <boxGeometry args={[1.12, 2.2, 0.03]} />
        <meshStandardMaterial color="#e7e3dc" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.05, 0.02]} material={wood} castShadow>
        <boxGeometry args={[0.96, 2.08, 0.04]} />
      </mesh>
      {/* 손잡이와 문패 */}
      <mesh position={[0.36, 1.0, 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 12]} />
        <meshStandardMaterial color="#c9ccd0" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.62, 0.045]}>
        <boxGeometry args={[0.36, 0.12, 0.01]} />
        <meshStandardMaterial color="#0f5560" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Reception() {
  const wood = useSet("white_oak_veneer", WOOD_REPEAT);
  const x = 3.35;
  const z = -2.35;
  return (
    <group position={[x, 0, z]}>
      {/* 앞판(흰 인조대리석)과 나무 상판 */}
      <RoundedBox args={[2.7, 1.05, 0.62]} radius={0.03} smoothness={3} position={[0, 0.525, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={WHITE} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 1.075, 0.04]} material={wood} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.05, 0.74]} />
      </mesh>
      {/* 낮은 접수 칸(휠체어 높이) */}
      <mesh position={[-0.95, 0.76, 0.2]} material={wood} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.04, 0.5]} />
      </mesh>
      {/* 병원 색 띠 */}
      <mesh position={[0, 0.86, 0.312]}>
        <boxGeometry args={[2.7, 0.12, 0.006]} />
        <meshStandardMaterial color="#0f5560" roughness={0.45} />
      </mesh>
      {/* 발 쪽 걸레받이. 앞판 앞면(z 0.31)과 같은 면에 두면 떨려 보여서 1cm 앞으로 뺀다(11-02) */}
      <mesh position={[0, 0.04, 0.322]}>
        <boxGeometry args={[2.66, 0.08, 0.02]} />
        <meshStandardMaterial color="#9aa1a3" roughness={0.8} />
      </mesh>
      {/* 모니터 두 대 */}
      {[-0.5, 0.55].map((mx) => (
        <group key={mx} position={[mx, 1.1, -0.12]}>
          <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI, 0]} castShadow>
            <boxGeometry args={[0.5, 0.3, 0.025]} />
            <meshStandardMaterial color="#20262b" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.05, 0.1, 0.05]} />
            <meshStandardMaterial color="#9aa0a6" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Window({ z, len }: { z: number; len: number }) {
  // 왼벽 창: 밝은 바깥(빛나는 면), 알루미늄 창틀, 가운데 세로살
  return (
    <group position={[X0 + T + 0.001, 1.55, z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[len, 1.5]} />
        <meshBasicMaterial color="#f4f8fb" toneMapped={false} />
      </mesh>
      {[
        [0, 0.77, len + 0.1, 0.06],
        [0, -0.77, len + 0.1, 0.08],
        [-len / 2 - 0.02, 0, 0.06, 1.6],
        [len / 2 + 0.02, 0, 0.06, 1.6],
        [0, 0, 0.04, 1.5],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.025]} castShadow>
          <boxGeometry args={[w, h, 0.06]} />
          <meshStandardMaterial color="#c8ccd0" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Tv({ center, w, h }: { center: [number, number, number]; w: number; h: number }) {
  return (
    <group position={[center[0], center[1], center[2] - 0.03]}>
      <RoundedBox args={[w + 0.05, h + 0.05, 0.05]} radius={0.01} smoothness={2} castShadow>
        <meshStandardMaterial color="#16191d" roughness={0.35} />
      </RoundedBox>
      {/* 화면 자리(실제 화면 DOM이 겹친다) */}
      <mesh position={[0, 0, 0.0255]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#0A2E36" />
      </mesh>
    </group>
  );
}

export function ClinicLobby({ config }: RoomProps) {
  const floor = useSet("laminate_floor_02", FLOOR_REPEAT);
  // 벽은 무늬 없는 따뜻한 흰색 도장(모형이 차분하게 읽히도록)
  const plaster = useMemo(() => new THREE.MeshStandardMaterial({ color: WALL, roughness: 0.94 }), []);
  const tv = config.tv;
  const doorL = 2.6;
  const doorR = 4.2;
  const rows = [-1.15, 0.05];
  const seatsX = [-2.85, -2.0, -1.15, -0.3];
  return (
    <group>
      {/* 바닥(밝은 나무결 마루)과 바깥 보도 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floor} receiveShadow>
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(doorL + doorR) / 2, -0.01, Z1 + 0.7]} receiveShadow>
        <planeGeometry args={[3.2, 1.4]} />
        <meshStandardMaterial color="#cfccc6" roughness={0.95} />
      </mesh>
      {/* 입구 매트 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(doorL + doorR) / 2, 0.004, Z1 - 0.55]} receiveShadow>
        <planeGeometry args={[1.5, 0.9]} />
        <meshStandardMaterial color="#5b6366" roughness={1} />
      </mesh>

      {/* 뒤벽, 왼벽(높게, 미장 텍스처) */}
      <mesh position={[0, H / 2, Z0 + T / 2]} material={plaster} castShadow receiveShadow>
        <boxGeometry args={[W, H, T]} />
      </mesh>
      <mesh position={[X0 + T / 2, H / 2, 0]} material={plaster} castShadow receiveShadow>
        <boxGeometry args={[T, H, D]} />
      </mesh>
      {[
        [0, H + 0.001, Z0 + T / 2, W, T],
        [X0 + T / 2, H + 0.001, 0, T, D],
      ].map(([x, y, z, sx, sz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[sx, sz]} />
          <meshStandardMaterial color={CUT} roughness={1} />
        </mesh>
      ))}
      <Baseboard p={[0, 0.04, Z0 + T + 0.008]} len={W - T} />
      <Baseboard p={[X0 + T + 0.008, 0.04, 0]} len={D - T} rotY={Math.PI / 2} />

      {/* 앞벽, 오른벽(낮게 잘라 안이 보이게, 입구 자리는 비움) */}
      <Wall p={[(X0 + doorL) / 2, LOW / 2, Z1 - T / 2]} s={[doorL - X0, LOW, T]} />
      <Wall p={[(doorR + X1) / 2, LOW / 2, Z1 - T / 2]} s={[X1 - doorR, LOW, T]} />
      <Wall p={[X1 - T / 2, LOW / 2, 0]} s={[T, LOW, D - 2 * T]} />
      {/* 자동문 문턱과 유리문 두 짝(열린 자리) */}
      <mesh position={[(doorL + doorR) / 2, 0.006, Z1 - T / 2]} receiveShadow>
        <boxGeometry args={[doorR - doorL, 0.012, T]} />
        <meshStandardMaterial color="#b9bdc1" metalness={0.7} roughness={0.35} />
      </mesh>
      {[doorL + 0.2, doorR - 0.2].map((x) => (
        <mesh key={x} position={[x, LOW / 2 + 0.02, Z1 - T / 2]}>
          <boxGeometry args={[0.4, LOW + 0.04, 0.03]} />
          <meshPhysicalMaterial color="#dff0f2" roughness={0.05} transmission={0} transparent opacity={0.45} />
        </mesh>
      ))}

      <Window z={1.35} len={2.6} />
      <Door p={[X0 + T + 0.001, 0, -2.25]} rotY={Math.PI / 2} />
      <Door p={[X0 + T + 0.001, 0, 0 - 0.55]} rotY={Math.PI / 2} />

      {/* 접수 데스크 뒤 병원 색 벽면 */}
      <mesh position={[3.35, 1.3, Z0 + T + 0.006]}>
        <boxGeometry args={[3.0, 2.6, 0.01]} />
        <meshStandardMaterial color="#d9e4e3" roughness={0.9} />
      </mesh>
      <mesh position={[3.35, 2.05, Z0 + T + 0.02]}>
        <boxGeometry args={[1.4, 0.16, 0.02]} />
        <meshStandardMaterial color="#0f5560" roughness={0.5} />
      </mesh>
      <Reception />
      <Model url={`${M}ceramic_vase_01.glb`} p={[4.35, 1.1, -2.2]} scale={0.8} />

      {tv ? <Tv center={tv.center} w={tv.w} h={tv.h} /> : null}
      <group position={[0.7, 2.15, Z0 + T]}>
        <Model url={`${M}wall_clock.glb`} p={[0, 0, 0]} scale={1.1} />
      </group>

      {/* 대기석 두 줄(TV를 본다), 줄 끝 협탁 */}
      {/* 의자는 TV(뒤벽) 쪽을 본다. 앉는 면 중심은 의자 자리에서 등받이 쪽(+z)으로 0.2m */}
      {rows.map((z) => seatsX.map((x) => <Chair key={`${x}${z}`} p={[x, 0, z]} rot={Math.PI} />))}
      {/* 기다리는 환자 셋(노년 여성, 20대 여성, 직장인 남성) */}
      <SeatedPerson seat={[-2.0, 0.44, rows[0] + 0.2]} rotationY={Math.PI} look={CAST.elder} />
      <SeatedPerson seat={[-2.85, 0.44, rows[1] + 0.2]} rotationY={Math.PI} phone look={CAST.young} />
      <SeatedPerson seat={[-1.15, 0.44, rows[1] + 0.2]} rotationY={Math.PI} look={CAST.worker} />
      {/* 접수대 뒤 직원 */}
      <StandingPerson at={[2.75, 0, -2.98]} look={CAST.receptionist} />
      {rows.map((z) => (
        <Model key={z} url={`${M}side_table_01.glb`} p={[-3.75, 0, z]} rot={Math.PI / 2} scale={0.9} />
      ))}

      {/* 화분 */}
      <Model url={`${M}potted_plant_02.glb`} p={[-4.45, 0, -3.0]} />
      <Model url={`${M}potted_plant_02.glb`} p={[1.55, 0, -3.0]} rot={1.4} />
      <Model url={`${M}potted_plant_02.glb`} p={[4.5, 0, 2.9]} rot={2.6} scale={0.9} />
      <Model url={`${M}potted_plant_02.glb`} p={[-4.45, 0, 2.9]} rot={0.6} scale={0.9} />
    </group>
  );
}

useGLTF.preload(`${M}modern_arm_chair_01.glb`);
useGLTF.preload(`${M}potted_plant_02.glb`);
