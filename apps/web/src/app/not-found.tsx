"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const PixelCD = dynamic(() => import("@/components/ui/pixel-cd"), {
  ssr: false,
  loading: () => <div className="w-20 h-20" />,
});

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <main className="flex-1 bg-white rounded-b-[24px] md:rounded-b-[40px] flex items-center justify-center px-4 sm:px-6">
        <div className="text-center">
          <motion.div
            className="flex items-center justify-center gap-2 sm:gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-7xl sm:text-9xl font-bold text-black">4</span>
            <PixelCD className="w-20 h-20 sm:w-28 sm:h-28" />
            <span className="text-7xl sm:text-9xl font-bold text-black">4</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-xl sm:text-2xl font-medium text-black mb-2">
              Page not found
            </h1>
            <p className="text-stone-500 text-sm sm:text-base mb-8 max-w-md mx-auto">
              Looks like this bookmark got lost somewhere on the web. Let's get
              you back on track.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 h-8 text-sm font-normal text-white transition-opacity hover:opacity-80 active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </motion.div>
        </div>
      </main>

      <footer className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm text-stone-500">
        Maybe try checking your URL?
      </footer>
    </div>
  );
}
