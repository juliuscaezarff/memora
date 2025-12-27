"use client";

import { useQuery } from "@tanstack/react-query";
import { BookmarkHero } from "@/components/bookmark-hero";
import { BookmarkList } from "@/components/bookmark-list";
import { Header } from "@/components/header";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useState } from "react";

export default function Bookmarks({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const [showImages, setShowImages] = useState(false);
  const [showMonths, setShowMonths] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const { data: folders = [] } = useQuery(orpc.folder.getAll.queryOptions());

  const selectedFolder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)
    : (folders[0] ?? null);

  return (
    <div className="min-h-screen bg-black">
      <Header
        selectedFolderId={selectedFolderId}
        onFolderChange={setSelectedFolderId}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <BookmarkHero
          showImages={showImages}
          setShowImages={setShowImages}
          showMonths={showMonths}
          setShowMonths={setShowMonths}
          selectedFolderId={selectedFolder?.id ?? null}
          selectedFolderIcon={selectedFolder?.icon ?? null}
          selectedFolderName={selectedFolder?.name ?? null}
        />
        <BookmarkList
          showImages={showImages}
          showMonths={showMonths}
          selectedFolderId={selectedFolder?.id ?? null}
        />
      </div>
    </div>
  );
}
