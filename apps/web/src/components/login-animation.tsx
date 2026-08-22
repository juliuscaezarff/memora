"use client";

import { motion } from "motion/react";

export function LoginAnimation({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			className="mt-8 flex items-center"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.35, duration: 0.3 } }}
		>
			{children}
		</motion.div>
	);
}
