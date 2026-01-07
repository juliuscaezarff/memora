"use client";

import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ApiKeySection } from "@/components/settings/api-key-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";
import Link from "next/link";

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 w-full bg-black border-b border-[#1a1a1a]">
        <div className="w-full px-4 sm:px-6 h-12 sm:h-14 flex items-center">
          <Link
            href="/bookmarks"
            className="flex items-center gap-2 text-[#888] hover:text-[#ededed] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-xl sm:text-2xl font-medium text-[#ededed] mb-1">
          Settings
        </h1>
        <p className="text-[13px] sm:text-sm text-[#666] mb-8">
          Manage your account preferences
        </p>

        <ProfileSection />

        <Separator className="bg-[#1a1a1a] mb-8" />

        <ApiKeySection />

        <Separator className="bg-[#1a1a1a] mb-8" />

        <DangerZoneSection />
      </main>
    </div>
  );
}
