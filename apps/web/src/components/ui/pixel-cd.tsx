"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import type * as THREE from "three";

function Voxel({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 0.3, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function CDDisc() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008;
    }
  });

  const voxels = useMemo(() => {
    const pixels: { x: number; z: number; color: string }[] = [];
    const size = 16;
    const center = size / 2 - 0.5;

    const rainbow = [
      "#ff4444",
      "#ff8844",
      "#ffdd44",
      "#44dd44",
      "#44dddd",
      "#4488ff",
    ];

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const dx = x - center;
        const dz = z - center;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= 7.5 && dist >= 1) {
          let color = "#e8e8e8";

          if (dist < 2.5) {
            color = "#666666";
          } else if (dist > 3 && dist < 6.5) {
            const angle = Math.atan2(dz, dx);
            const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);

            if (
              (normalizedAngle > 0.1 && normalizedAngle < 0.35) ||
              (normalizedAngle > 0.6 && normalizedAngle < 0.85)
            ) {
              const rainbowIndex = Math.floor(
                ((dist - 3) / 3.5) * rainbow.length,
              );
              color = rainbow[Math.min(rainbowIndex, rainbow.length - 1)];
            } else if (dist > 4 && dist < 5.5) {
              color = "#d0d0d0";
            }
          } else if (dist > 6.5) {
            color = "#aaaaaa";
          }

          pixels.push({ x: dx, z: dz, color });
        }
      }
    }

    return pixels;
  }, []);

  return (
    <group ref={groupRef} rotation={[0.8, 0, 0]}>
      {voxels.map((voxel, i) => (
        <Voxel key={i} position={[voxel.x, 0, voxel.z]} color={voxel.color} />
      ))}
    </group>
  );
}

export default function PixelCD({ className }: { className?: string }) {
  return (
    <div className={className ?? "w-14 h-14 mb-2"}>
      <Canvas camera={{ position: [0, 12, 12], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />
        <CDDisc />
      </Canvas>
    </div>
  );
}
