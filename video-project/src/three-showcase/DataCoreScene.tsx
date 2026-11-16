import React, {useMemo} from "react";
import {Easing, interpolate} from "remotion";
import {useThree} from "@react-three/fiber";
import * as THREE from "three";
import {CORE_COLORS as C, CORE_FPS, CORE_FRAMES, hash01} from "./theme";

// ---------------------------------------------------------------------------
// Everything in this scene is driven exclusively by the `frame` prop (which
// comes from Remotion's useCurrentFrame) + interpolate(). There is zero
// useFrame / per-hook animation state, so every render of frame N is
// pixel-identical and deterministic.
// ---------------------------------------------------------------------------

// ----- Camera rig: orbiting sweep that weaves through the glass field ------

const CameraRig: React.FC<{frame: number}> = ({frame}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const t = frame / CORE_FPS;

  // 1.2 revolutions over the timeline.
  const angle = interpolate(frame, [0, CORE_FRAMES], [0, Math.PI * 2.4]);

  // Radius keyframes: start wide, dive through the plane ring, pull back out.
  const radius = interpolate(
    frame,
    [0, 140, 380, 620, 860, CORE_FRAMES],
    [26, 8.5, 19, 7.5, 17, 27],
    {easing: Easing.inOut(Easing.ease)}
  );

  const height = Math.sin(angle * 1.7 + 0.8) * (radius * 0.45);

  camera.position.set(
    Math.cos(angle) * radius,
    height,
    Math.sin(angle) * radius
  );

  // Subtle dolly-zoom during the final pull-back.
  const fov = interpolate(frame, [0, 700, CORE_FRAMES], [58, 55, 46], {
    easing: Easing.inOut(Easing.ease),
  });
  if (camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  camera.lookAt(Math.sin(t * 0.3) * 1.2, Math.cos(t * 0.22) * 0.8, 0);
  return null;
};

// ----- Central data core: wireframe icosahedron + emissive inner core ------

const DataCore: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / CORE_FPS;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  const boot = interpolate(frame, [10, 70], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const scale = (0.6 + 0.4 * boot) * (1 + 0.045 * Math.sin(t * 2.4));

  return (
    <group>
      {/* Primary wireframe shell */}
      <mesh rotation={[t * 0.18, t * 0.5, t * 0.07]} scale={scale}>
        <icosahedronGeometry args={[3, 0]} />
        <meshBasicMaterial
          color={C.cyan}
          wireframe
          transparent
          opacity={0.85 * boot}
        />
      </mesh>

      {/* Secondary faint shell, counter-rotating */}
      <mesh rotation={[-t * 0.1, -t * 0.32, -t * 0.05]} scale={scale * 1.22}>
        <icosahedronGeometry args={[3, 1]} />
        <meshBasicMaterial
          color={C.violet}
          wireframe
          transparent
          opacity={0.22 * boot}
        />
      </mesh>

      {/* Glowing emissive inner core */}
      <mesh scale={scale * (0.98 + 0.06 * pulse)}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshStandardMaterial
          color="#160a20"
          emissive={C.magenta}
          emissiveIntensity={1.1 + 1.7 * pulse}
          roughness={0.3}
          metalness={0.45}
        />
      </mesh>

      {/* Light source living inside the core */}
      <pointLight
        color={C.magenta}
        intensity={(60 + 90 * pulse) * boot}
        distance={40}
        decay={2}
      />
    </group>
  );
};

// ----- Dynamic point lights orbiting the core (visible bulb nodes) ---------

type OrbitLightProps = {
  frame: number;
  radius: number;
  speed: number;
  phase: number;
  tilt: number;
  color: string;
  intensity: number;
};

const OrbitLight: React.FC<OrbitLightProps> = ({
  frame,
  radius,
  speed,
  phase,
  tilt,
  color,
  intensity,
}) => {
  const a = (frame / CORE_FPS) * speed + phase;
  const x = Math.cos(a) * radius;
  const z = Math.sin(a) * radius;
  const y = Math.sin(a * 1.6 + phase) * tilt;

  return (
    <group position={[x, y, z]}>
      <pointLight color={color} intensity={intensity} distance={55} decay={2} />
      <mesh>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
};

// ----- 2.5D glassmorphic planes arranged in Z-depth around the core --------

type GlassCard = {
  angle: number;
  radius: number;
  y: number;
  w: number;
  h: number;
  tiltX: number;
  tiltZ: number;
  appear: number;
  tint: string;
  bars: number[];
};

const CARDS: GlassCard[] = Array.from({length: 12}, (_, i) => {
  const h = (k: number) => hash01(i * 17.31 + k * 7.77);
  return {
    angle: (i / 12) * Math.PI * 2 + (h(1) - 0.5) * 0.5,
    radius: 9 + h(2) * 14,
    y: (h(3) - 0.5) * 16,
    w: 3.6 + h(4) * 2.4,
    h: 2.4 + h(5) * 1.6,
    tiltX: (h(6) - 0.5) * 0.35,
    tiltZ: (h(7) - 0.5) * 0.35,
    appear: 20 + i * 14,
    tint:
      i % 3 === 0 ? C.magentaGlass : i % 3 === 1 ? C.cyanGlass : C.violetGlass,
    bars: [h(8), h(9), h(10)],
  };
});

const GlassCardView: React.FC<{
  card: GlassCard;
  index: number;
  frame: number;
  plane: THREE.PlaneGeometry;
  edges: THREE.EdgesGeometry;
}> = ({card, index, frame, plane, edges}) => {
  const t = frame / CORE_FPS;

  const appear = interpolate(
    frame,
    [card.appear, card.appear + 40],
    [0, 1],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );
  if (appear <= 0) {
    return null;
  }

  const floatY = Math.sin(t * 0.7 + card.angle * 3) * 0.5;
  const position: [number, number, number] = [
    Math.cos(card.angle) * card.radius,
    card.y + floatY,
    Math.sin(card.angle) * card.radius,
  ];
  // Orient the card so its face points at the core.
  const rotY = -card.angle - Math.PI / 2;
  const rotZ = card.tiltZ + Math.sin(t * 0.4 + index) * 0.02;

  return (
    <group position={position} rotation={[card.tiltX, rotY, rotZ]}>
      {/* Glass body */}
      <mesh geometry={plane} scale={[card.w, card.h, 1]}>
        <meshPhysicalMaterial
          color={card.tint}
          transparent
          opacity={0.16 * appear}
          roughness={0.15}
          metalness={0.35}
          clearcoat={1}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Bright rim */}
      <lineSegments geometry={edges} scale={[card.w, card.h, 1]}>
        <lineBasicMaterial
          color={C.cyan}
          transparent
          opacity={0.55 * appear}
        />
      </lineSegments>

      {/* 2.5D "UI text lines" floating just in front of the glass */}
      {card.bars.map((b, bi) => {
        const barW = card.w * (0.3 + b * 0.55);
        return (
          <mesh
            key={bi}
            geometry={plane}
            position={[
              -card.w * 0.5 + card.w * 0.12 + barW * 0.5,
              card.h * 0.22 - bi * card.h * 0.2,
              0.03,
            ]}
            scale={[barW, 0.09, 1]}
          >
            <meshBasicMaterial
              color={bi === 0 ? C.white : C.cyan}
              transparent
              opacity={(bi === 0 ? 0.8 : 0.5) * appear}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const GlassField: React.FC<{frame: number}> = ({frame}) => {
  const geos = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1, 1);
    return {plane, edges: new THREE.EdgesGeometry(plane)};
  }, []);

  return (
    <>
      {CARDS.map((card, i) => (
        <GlassCardView
          key={i}
          card={card}
          index={i}
          frame={frame}
          plane={geos.plane}
          edges={geos.edges}
        />
      ))}
    </>
  );
};

// ----- 3D particle field: 2,000 floating stars/nodes -----------------------

const PARTICLE_COUNT = 2000;
const FIELD_RADIUS = 30;

const ParticleField: React.FC<{frame: number}> = ({frame}) => {
  const data = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT * 4); // r, theta, phi, phase
    const cyan = new THREE.Color(C.cyan);
    const magenta = new THREE.Color(C.magenta);
    const amber = new THREE.Color(C.amber);
    const white = new THREE.Color(C.white);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = FIELD_RADIUS * (0.35 + 0.65 * hash01(i * 3.1));
      const theta = hash01(i * 5.7 + 1.3) * Math.PI * 2;
      const phi = Math.acos(2 * hash01(i * 9.2 + 4.1) - 1);
      seeds[i * 4] = r;
      seeds[i * 4 + 1] = theta;
      seeds[i * 4 + 2] = phi;
      seeds[i * 4 + 3] = hash01(i * 13.7 + 8.8) * Math.PI * 2;

      const roll = hash01(i * 21.3 + 2.6);
      const col = roll < 0.6 ? cyan : roll < 0.85 ? magenta : roll < 0.95 ? amber : white;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return {geometry, positions, seeds};
  }, []);

  // Per-frame position update: pure math on frame -> deterministic.
  const t = frame / CORE_FPS;
  const drift = interpolate(frame, [0, CORE_FRAMES], [0, 1]) * 2.2;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = data.seeds[i * 4];
    const theta = data.seeds[i * 4 + 1];
    const phi = data.seeds[i * 4 + 2];
    const phase = data.seeds[i * 4 + 3];

    const swirl = t * 0.06 + drift * 0.25;
    const baseX = r * Math.sin(phi) * Math.cos(theta + swirl);
    const baseY = r * Math.cos(phi);
    const baseZ = r * Math.sin(phi) * Math.sin(theta + swirl);

    data.positions[i * 3] = baseX + Math.sin(t * 0.5 + phase) * 0.6;
    data.positions[i * 3 + 1] = baseY + Math.cos(t * 0.4 + phase * 1.3) * 0.6;
    data.positions[i * 3 + 2] = baseZ + Math.sin(t * 0.45 + phase * 0.7) * 0.6;
  }
  (data.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate =
    true;

  return (
    <points geometry={data.geometry}>
      <pointsMaterial
        size={0.14}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ----- Scene root -----------------------------------------------------------

export const DataCoreScene: React.FC<{frame: number}> = ({frame}) => {
  return (
    <>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 14, 70]} />

      <CameraRig frame={frame} />

      <ambientLight intensity={0.18} />
      <directionalLight position={[10, 18, 8]} intensity={0.35} color={C.white} />

      <DataCore frame={frame} />

      <OrbitLight
        frame={frame}
        radius={6.5}
        speed={1.1}
        phase={0}
        tilt={3}
        color={C.cyan}
        intensity={320}
      />
      <OrbitLight
        frame={frame}
        radius={8.5}
        speed={-0.8}
        phase={2.1}
        tilt={4.5}
        color={C.magenta}
        intensity={280}
      />
      <OrbitLight
        frame={frame}
        radius={11}
        speed={0.55}
        phase={4.2}
        tilt={2}
        color={C.violet}
        intensity={240}
      />

      <GlassField frame={frame} />
      <ParticleField frame={frame} />
    </>
  );
};
