"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

type CubeletPosition = [number, number, number];

function FaceTile({
	position,
	rotation = [0, 0, 0],
	color,
}: {
	position: CubeletPosition;
	rotation?: CubeletPosition;
	color: string;
}) {
	return (
		<mesh position={position} rotation={rotation}>
			<boxGeometry args={[0.72, 0.72, 0.055]} />
			<meshStandardMaterial color={color} roughness={0.82} />
		</mesh>
	);
}

function Cubelet({ position }: { position: CubeletPosition }) {
	const [x, y, z] = position;

	return (
		<group position={[x * 1.02, y * 1.02, z * 1.02]}>
			<mesh>
				<boxGeometry args={[0.9, 0.9, 0.9]} />
				<meshStandardMaterial color="#141414" roughness={0.9} />
			</mesh>

			{x === 1 && (
				<FaceTile
					position={[0.48, 0, 0]}
					rotation={[0, Math.PI / 2, 0]}
					color="#b5b5b0"
				/>
			)}
			{x === -1 && (
				<FaceTile
					position={[-0.48, 0, 0]}
					rotation={[0, -Math.PI / 2, 0]}
					color="#9c9c98"
				/>
			)}
			{y === 1 && (
				<FaceTile
					position={[0, 0.48, 0]}
					rotation={[-Math.PI / 2, 0, 0]}
					color="#f0f0eb"
				/>
			)}
			{y === -1 && (
				<FaceTile
					position={[0, -0.48, 0]}
					rotation={[Math.PI / 2, 0, 0]}
					color="#777773"
				/>
			)}
			{z === 1 && <FaceTile position={[0, 0, 0.48]} color="#d8d8d3" />}
			{z === -1 && (
				<FaceTile
					position={[0, 0, -0.48]}
					rotation={[0, Math.PI, 0]}
					color="#858581"
				/>
			)}
		</group>
	);
}

function MonochromeCube() {
	const cubelets = useMemo(() => {
		const positions: CubeletPosition[] = [];

		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				for (let z = -1; z <= 1; z++) {
					if (Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) === 1) {
						positions.push([x, y, z]);
					}
				}
			}
		}

		return positions;
	}, []);

	return (
		<group rotation={[0.48, -0.64, 0.12]}>
			{cubelets.map(([x, y, z]) => (
				<Cubelet key={`${x}-${y}-${z}`} position={[x, y, z]} />
			))}
		</group>
	);
}

export default function PixelCube({ className }: { className?: string }) {
	const reduceMotion = useReducedMotion();
	const [dragging, setDragging] = useState(false);

	return (
		<div
			className={`${className ?? "size-16"} ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
			aria-hidden="true"
			onPointerDown={() => setDragging(true)}
			onPointerUp={() => setDragging(false)}
			onPointerCancel={() => setDragging(false)}
		>
			<Canvas
				camera={{ position: [5.5, 4.5, 6.5], fov: 32 }}
				frameloop={reduceMotion ? "demand" : "always"}
				gl={{ antialias: false, alpha: true }}
				style={{ touchAction: "none" }}
			>
				<ambientLight intensity={0.55} />
				<directionalLight position={[5, 8, 6]} intensity={2.2} />
				<directionalLight position={[-4, 2, -3]} intensity={0.45} />
				<MonochromeCube />
				<OrbitControls
					autoRotate={!reduceMotion}
					autoRotateSpeed={1.4}
					dampingFactor={0.06}
					enableDamping
					enablePan={false}
					enableZoom={false}
					minPolarAngle={Math.PI * 0.28}
					maxPolarAngle={Math.PI * 0.72}
				/>
			</Canvas>
		</div>
	);
}
