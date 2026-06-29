"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Stars, Line, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { ConceptNode, Domain } from "@/lib/types";
import { domainColor } from "./graph-2d";

type Pos = [number, number, number];

function useLayout(concepts: ConceptNode[]) {
  return useMemo(() => {
    const domains = Array.from(new Set(concepts.map((c) => c.domain))) as Domain[];
    const positions = new Map<string, Pos>();
    concepts.forEach((c) => {
      const di = domains.indexOf(c.domain);
      const da = (di / domains.length) * Math.PI * 2;
      const cluster: Pos = [Math.cos(da) * 6, Math.sin(da * 1.3) * 3, Math.sin(da) * 6];
      const idx = concepts.filter((x) => x.domain === c.domain).indexOf(c);
      const ja = (idx / 3) * Math.PI * 2;
      positions.set(c.id, [
        cluster[0] + Math.cos(ja) * 2.2,
        cluster[1] + Math.sin(ja) * 2.2,
        cluster[2] + Math.cos(ja * 0.7) * 1.6,
      ]);
    });
    const seen = new Set<string>();
    const links: [Pos, Pos, boolean][] = [];
    concepts.forEach((c) =>
      c.connections.forEach((t) => {
        const key = [c.id, t].sort().join("-");
        if (!seen.has(key) && positions.has(t)) {
          seen.add(key);
          links.push([positions.get(c.id)!, positions.get(t)!, false]);
        }
      }),
    );
    return { positions, links };
  }, [concepts]);
}

function ConceptSphere({
  concept,
  position,
  selected,
  dimmed,
  onSelect,
}: {
  concept: ConceptNode;
  position: Pos;
  selected: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = domainColor[concept.domain];
  const r = 0.4 + (concept.mastery / 100) * 0.5;

  useFrame(() => {
    if (!ref.current) return;
    const target = hovered || selected ? 1.25 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(concept.id); }}
      >
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected || hovered ? 1.4 : 0.6}
          roughness={0.3}
          metalness={0.5}
          transparent
          opacity={dimmed ? 0.2 : 1}
        />
      </mesh>
      <mesh scale={1.5}>
        <sphereGeometry args={[r, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.04 : selected || hovered ? 0.18 : 0.08} />
      </mesh>
      {(hovered || selected) && (
        <Html center distanceFactor={10} position={[0, r + 0.6, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-44 rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-xs font-semibold text-white">{concept.label}</p>
            <p className="mt-0.5 text-[10px] text-white/60">{concept.domain} · {concept.mastery}%</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Rig({ target }: { target: Pos | null }) {
  useFrame((state) => {
    if (target) {
      const dest = new THREE.Vector3(target[0] + 4, target[1] + 2, target[2] + 6);
      state.camera.position.lerp(dest, 0.06);
      state.camera.lookAt(target[0], target[1], target[2]);
    }
  });
  return null;
}

function Scene({
  concepts,
  selectedId,
  onSelect,
}: {
  concepts: ConceptNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { positions, links } = useLayout(concepts);
  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    concepts.forEach((c) => m.set(c.id, new Set(c.connections)));
    return m;
  }, [concepts]);
  const target = selectedId ? positions.get(selectedId) ?? null : null;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#93c5fd" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#8b5cf6" />
      <Stars radius={60} depth={50} count={2500} factor={3} fade speed={0.4} />
      {links.map((l, i) => {
        const lit = !selectedId;
        return <Line key={i} points={[l[0], l[1]]} color={lit ? "#3b82f6" : "#475569"} lineWidth={0.6} transparent opacity={selectedId ? 0.15 : 0.3} />;
      })}
      {concepts.map((c) => {
        const dimmed = !!selectedId && selectedId !== c.id && !neighbors.get(selectedId)?.has(c.id);
        return (
          <ConceptSphere
            key={c.id}
            concept={c}
            position={positions.get(c.id)!}
            selected={selectedId === c.id}
            dimmed={dimmed}
            onSelect={onSelect}
          />
        );
      })}
      <Rig target={target} />
      <OrbitControls enablePan enableZoom enableDamping dampingFactor={0.1} minDistance={4} maxDistance={30} makeDefault />
    </>
  );
}

export default function KnowledgeGraph3D(props: {
  concepts: ConceptNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 2, 18], fov: 60 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.8]} style={{ background: "transparent" }}>
      <Scene {...props} />
    </Canvas>
  );
}
