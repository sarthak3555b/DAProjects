"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Stars, Sparkles, Float, Line, Html } from "@react-three/drei";
import * as THREE from "three";

type Topic = {
  id: string;
  label: string;
  color: string;
  position: [number, number, number];
  size: number;
};

const TOPICS: Topic[] = [
  { id: "money", label: "Money", color: "#3b82f6", position: [-5.5, 1.6, 0], size: 0.9 },
  { id: "economics", label: "Economics", color: "#8b5cf6", position: [-2.4, -2.4, -2], size: 0.78 },
  { id: "business", label: "Business", color: "#10b981", position: [2.6, 2.6, -1], size: 0.82 },
  { id: "markets", label: "Markets", color: "#f59e0b", position: [5.4, -0.6, 0.5], size: 0.86 },
  { id: "technology", label: "Technology", color: "#06b6d4", position: [0.4, 3.4, 1.5], size: 0.72 },
  { id: "ai", label: "AI", color: "#ec4899", position: [-3.6, 2.6, 2], size: 0.66 },
  { id: "capital", label: "Capital", color: "#22d3ee", position: [2.0, -3.0, 1.5], size: 0.8 },
];

const LINKS: [string, string][] = [
  ["money", "economics"], ["money", "markets"], ["economics", "markets"],
  ["business", "capital"], ["markets", "capital"], ["technology", "ai"],
  ["ai", "business"], ["money", "capital"], ["economics", "business"],
];

function Planet({ topic, onHover }: { topic: Topic; onHover: (id: string | null) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.25;
    const s = hovered ? 1.18 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <group position={topic.position}>
        <mesh
          ref={ref}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            setHovered(true);
            onHover(topic.id);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
            document.body.style.cursor = "auto";
          }}
        >
          <icosahedronGeometry args={[topic.size, 4]} />
          <meshStandardMaterial
            color={topic.color}
            emissive={topic.color}
            emissiveIntensity={hovered ? 1.6 : 0.7}
            roughness={0.35}
            metalness={0.4}
          />
        </mesh>
        {/* glow halo */}
        <mesh scale={1.5}>
          <sphereGeometry args={[topic.size, 24, 24]} />
          <meshBasicMaterial color={topic.color} transparent opacity={hovered ? 0.18 : 0.08} />
        </mesh>
        <Html center distanceFactor={12} position={[0, topic.size + 0.7, 0]} style={{ pointerEvents: "none" }}>
          <span
            className="select-none whitespace-nowrap rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
          >
            {topic.label}
          </span>
        </Html>
      </group>
    </Float>
  );
}

function Constellations({ active }: { active: string | null }) {
  const byId = useMemo(() => Object.fromEntries(TOPICS.map((t) => [t.id, t])), []);
  return (
    <group>
      {LINKS.map(([a, b], i) => {
        const ta = byId[a];
        const tb = byId[b];
        const lit = active === a || active === b;
        return (
          <Line
            key={i}
            points={[ta.position, tb.position]}
            color={lit ? "#93c5fd" : "#3b82f6"}
            lineWidth={lit ? 1.6 : 0.6}
            transparent
            opacity={lit ? 0.7 : 0.22}
            dashed={false}
          />
        );
      })}
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    const { pointer, camera, clock } = state;
    const x = pointer.x * 2.2;
    const y = pointer.y * 1.4;
    camera.position.x += (x - camera.position.x) * 0.04;
    camera.position.y += (y - camera.position.y) * 0.04;
    camera.position.z = 14 + Math.sin(clock.elapsedTime * 0.15) * 0.6;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#93c5fd" />
      <pointLight position={[-10, -6, -4]} intensity={0.8} color="#8b5cf6" />
      <Stars radius={80} depth={60} count={4000} factor={4} saturation={0} fade speed={0.6} />
      <Sparkles count={70} scale={18} size={2.4} speed={0.3} color="#93c5fd" opacity={0.5} />
      <Constellations active={active} />
      {TOPICS.map((t) => (
        <Planet key={t.id} topic={t} onHover={setActive} />
      ))}
      <Rig />
    </>
  );
}

export default function UniverseScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.8]}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}
