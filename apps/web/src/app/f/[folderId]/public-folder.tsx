"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { BookmarkHero } from "@/components/bookmark-hero";
import { PublicBookmarkList } from "./public-bookmark-list";

interface PublicFolderProps {
  folderId: string;
}

export function PublicFolder({ folderId }: PublicFolderProps) {
  const [showImages, setShowImages] = useState(false);
  const [showMonths, setShowMonths] = useState(false);

  const { data: folder, isLoading: isFolderLoading } = useQuery(
    orpc.public.getSharedFolder.queryOptions({ input: { id: folderId } }),
  );

  const { data: bookmarks = [] } = useQuery({
    ...orpc.public.getSharedFolderBookmarks.queryOptions({
      input: { folderId },
    }),
    enabled: !!folder,
  });

  if (!isFolderLoading && !folder) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#ededed] mb-2">
            Folder not found
          </h1>
          <p className="text-[#666]">
            This folder doesn&apos;t exist or is not public.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <BookmarkHero
          showImages={showImages}
          setShowImages={setShowImages}
          showMonths={showMonths}
          setShowMonths={setShowMonths}
          selectedFolderId={folderId}
          selectedFolderIcon={folder?.icon ?? null}
          selectedFolderName={folder?.name ?? null}
          isLoading={isFolderLoading}
          isPublicView={true}
          isShared={true}
        />
        <PublicBookmarkList
          bookmarks={bookmarks}
          showImages={showImages}
          showMonths={showMonths}
        />
      </div>
    </div>
  );
}
