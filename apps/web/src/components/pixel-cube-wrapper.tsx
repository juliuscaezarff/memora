"use client";

import dynamic from "next/dynamic";

const PixelCube = dynamic(() => import("@/components/ui/pixel-cube"), {
	ssr: false,
});

export function PixelCubeWrapper() {
	return <PixelCube className="size-full" />;
}
