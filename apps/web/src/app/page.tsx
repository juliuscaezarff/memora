"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GithubIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();
  const lastMethod = authClient.getLastUsedLoginMethod();

  const signInWithGoogle = () => {
    authClient.signIn.social(
      { provider: "google" },
      {
        onSuccess: () => {
          router.push("/bookmarks");
        },
      },
    );
  };

  const signInWithGithub = () => {
    authClient.signIn.social(
      { provider: "github" },
      {
        onSuccess: () => {
          router.push("/bookmarks");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main content - white card with rounded bottom corners */}
      <main className="flex-1 bg-white rounded-b-[24px] md:rounded-b-[40px] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-0">
        <div className="max-w-xl w-full">
          <Image src="/brain.svg" alt="Brain" width={85} height={85} />

          {/* Name */}
          <h1 className="text-lg sm:text-xl font-medium text-black">Memora</h1>

          {/* Location */}
          <p className="text-gray-500 text-sm mb-4 sm:mb-6">
            Somewhere on the web
          </p>

          {/* Bio paragraphs */}
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-4">
            I've always enjoyed saving things from the web links, articles,
            small discoveries I didn't want to lose. Over time, that habit
            quietly became a way to remember what matters.
          </p>

          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            Memora is a place to organize and share your bookmarks, without the
            usual noise.
          </p>
          <motion.div
            className=" flex items-center gap-2 md:pt-8 pt-16 transition duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8 } }}
            exit={{ opacity: 0 }}
          >
            <div className="flex w-full items-center justify-center flex-col md:flex-row md:gap-4 gap-6">
              <div className="relative">
                <motion.button
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={signInWithGoogle}
                  className="flex items-center justify-center gap-2 rounded-lg bg-black w-36 h-9 text-sm font-normal text-white no-underline"
                >
                  <div className="flex items-center gap-2">
                    <p>Sign in with</p>
                    <Image
                      src="/google.ico"
                      alt="Google logo"
                      width={18}
                      height={18}
                    />
                  </div>
                </motion.button>
                {lastMethod === "google" && (
                  <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 h-4">
                    Last used
                  </Badge>
                )}
              </div>
              <div className="hidden h-4 w-0.5 rounded-full bg-stone-700 md:block" />
              <div className="relative">
                <motion.button
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={signInWithGithub}
                  className="flex items-center justify-center gap-2 rounded-lg bg-black w-36 h-9 text-sm font-normal text-white no-underline"
                >
                  <div className="flex items-center gap-2">
                    <p>Sign in with</p>
                    <GithubIcon className="h-5 w-5" />
                  </div>
                </motion.button>
                {lastMethod === "github" && (
                  <Badge className="absolute -top-2 -right-2 text-[10px] text-white px-1.5 py-0 h-4 rounded-md bg-black border border-stone-600">
                    Last used
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer - on black background */}
      <footer className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-2.5 h-2.5 text-black ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="text-gray-400">
            Staying by Lizzy McAlpine{" "}
            <span className="text-gray-500">· 7m ago</span>
          </span>
        </div>

        <div className="text-stone-500 sm:text-right">
          Last updated <span className="text-stone-300">27.12.2025</span>
        </div>
      </footer>
    </div>
  );
}
