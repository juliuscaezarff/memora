"use client";

import { useState } from "react";
import Image from "next/image";
import { GithubIcon, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";

export function LoginButtons() {
  const lastMethod = authClient.getLastUsedLoginMethod();
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  const signInWithGoogle = () => {
    setLoadingProvider("google");
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/bookmarks",
    });
  };

  const signInWithGithub = () => {
    setLoadingProvider("github");
    authClient.signIn.social({
      provider: "github",
      callbackURL: "/bookmarks",
    });
  };

  return (
    <div className="flex w-full items-center justify-center flex-row md:gap-4 gap-6">
      <div className="relative">
        <button
          onClick={signInWithGoogle}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 rounded-lg bg-black w-36 h-9 text-sm font-normal text-white no-underline transition-opacity hover:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loadingProvider === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <p>Sign in with</p>
              <Image
                src="/google.ico"
                alt="Google logo"
                width={18}
                height={18}
              />
            </div>
          )}
        </button>
        {lastMethod === "google" && (
          <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 h-4">
            Last used
          </Badge>
        )}
      </div>
      <div className="hidden h-4 w-0.5 rounded-full bg-stone-700 md:block" />
      <div className="relative">
        <button
          onClick={signInWithGithub}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 rounded-lg bg-black w-36 h-9 text-sm font-normal text-white no-underline transition-opacity hover:opacity-80 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loadingProvider === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <p>Sign in with</p>
              <GithubIcon className="h-5 w-5" />
            </div>
          )}
        </button>
        {lastMethod === "github" && (
          <Badge className="absolute -top-2 -right-2 text-[10px] text-white px-1.5 py-0 h-4 rounded-md bg-black border border-stone-600">
            Last used
          </Badge>
        )}
      </div>
    </div>
  );
}
