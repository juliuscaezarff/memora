"use client";

import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";

export function ProfileSection() {
  const { data: session } = authClient.useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <section className="mb-8">
      <h2 className="text-xs font-medium text-[#666] uppercase tracking-wider mb-4">
        Profile
      </h2>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="w-16 h-16 border border-[#262626]">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="bg-[#1a1a1a] text-[#ededed] text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <p className="text-sm text-[#ededed]">{session?.user?.name ?? "User"}</p>
          <p className="text-xs text-[#666]">{session?.user?.email}</p>
        </div>
      </div>
    </section>
  );
}
