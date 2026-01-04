"use client";

import dynamic from "next/dynamic";

const PixelCD = dynamic(() => import("@/components/ui/pixel-cd"), {
  ssr: false,
});

export function PixelCDWrapper() {
  return <PixelCD />;
}
