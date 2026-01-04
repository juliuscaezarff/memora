"use client";

import { motion } from "motion/react";

export function LoginAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex items-center gap-2 md:pt-8 pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.8 } }}
    >
      {children}
    </motion.div>
  );
}
