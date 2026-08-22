"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BookmarkHero } from "@/components/bookmark-hero";
import { orpc } from "@/utils/orpc";
import { PublicBookmarkList } from "./public-bookmark-list";

interface PublicFolderProps {
	folderId: string;
}

export function PublicFolder({ folderId }: PublicFolderProps) {
	const [showPreview, setShowPreview] = useState(true);
	const [showMonths, setShowMonths] = useState(false);

	const { data: folder, isLoading: isFolderLoading } = useQuery(
		orpc.public.getSharedFolder.queryOptions({ input: { id: folderId } }),
	);

	const { data: bookmarks = [], isLoading: areBookmarksLoading } = useQuery({
		...orpc.public.getSharedFolderBookmarks.queryOptions({
			input: { folderId },
		}),
		enabled: !!folder,
	});

	if (!isFolderLoading && !folder) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-black">
				<div className="text-center">
					<h1 className="mb-2 font-bold text-2xl text-[#ededed]">
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
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
				<BookmarkHero
					showPreview={showPreview}
					setShowPreview={setShowPreview}
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
					showPreview={showPreview}
					showMonths={showMonths}
					isLoading={isFolderLoading || areBookmarksLoading}
				/>
			</div>
		</div>
	);
}
