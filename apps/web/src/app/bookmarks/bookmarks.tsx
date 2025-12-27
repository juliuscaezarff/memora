"use client";

import { BookmarkHero } from "@/components/bookmark-hero";
import { BookmarkList } from "@/components/bookmark-list";
import { Header } from "@/components/header";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function Bookmarks({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const [showImages, setShowImages] = useState(false);
  const [showMonths, setShowMonths] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <BookmarkHero
          showImages={showImages}
          setShowImages={setShowImages}
          showMonths={showMonths}
          setShowMonths={setShowMonths}
        />
        <BookmarkList showImages={showImages} showMonths={showMonths} />
      </div>
    </div>
  );
}
