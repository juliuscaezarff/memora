"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import {
	BookmarkListItem,
	type BookmarkListItemMetadata,
} from "@/components/bookmark-list/bookmark-list";

type Bookmark = {
	id: string;
	url: string;
	title: string;
	faviconUrl: string | null;
	ogImageUrl: string | null;
	description: string | null;
	folderId: string;
	createdAt: Date;
	updatedAt: Date;
};

type PublicBookmarkListProps = {
	bookmarks: Bookmark[];
	showPreview: boolean;
	showMonths: boolean;
	isLoading?: boolean;
};

const BOOKMARK_SKELETONS = [
	"public-bookmark-skeleton-1",
	"public-bookmark-skeleton-2",
	"public-bookmark-skeleton-3",
	"public-bookmark-skeleton-4",
	"public-bookmark-skeleton-5",
	"public-bookmark-skeleton-6",
] as const;

function formatMonth(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		year: "numeric",
	}).format(new Date(date));
}

function getDomain(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

function getBookmarkMetadata(bookmark: Bookmark): BookmarkListItemMetadata {
	const domain = getDomain(bookmark.url);

	return {
		url: bookmark.url,
		title: bookmark.title,
		description: bookmark.description ?? undefined,
		siteName: domain.split(".")[0] || domain,
		domain,
		image: bookmark.ogImageUrl ?? undefined,
		favicon: bookmark.faviconUrl ?? undefined,
	};
}

function moveRowHighlight(event: ReactPointerEvent<HTMLDivElement>) {
	if (!(event.target instanceof Element)) return;

	const row = event.target.closest<HTMLElement>("[data-bookmark-row]");
	if (!row || row.parentElement !== event.currentTarget) return;

	const container = event.currentTarget;
	const highlight = container.querySelector<HTMLElement>(
		"[data-bookmark-highlight]",
	);
	if (!highlight) return;

	if (
		highlight.style.opacity === "1" &&
		container.dataset.highlightedRow === row.dataset.bookmarkRow
	) {
		return;
	}

	container.dataset.highlightedRow = row.dataset.bookmarkRow;
	highlight.style.height = `${row.offsetHeight}px`;
	highlight.style.transform = `translate3d(0, ${row.offsetTop}px, 0)`;
	highlight.style.opacity = "1";
}

function hideRowHighlight(event: ReactPointerEvent<HTMLDivElement>) {
	const highlight = event.currentTarget.querySelector<HTMLElement>(
		"[data-bookmark-highlight]",
	);
	if (highlight) highlight.style.opacity = "0";
}

export function PublicBookmarkList({
	bookmarks,
	showPreview,
	showMonths,
	isLoading = false,
}: PublicBookmarkListProps) {
	if (isLoading) {
		return (
			<output className="block space-y-3" aria-label="Loading bookmarks">
				{BOOKMARK_SKELETONS.map((skeleton) => (
					<div
						key={skeleton}
						className="h-7 w-2/3 animate-pulse rounded bg-[#111]"
					/>
				))}
			</output>
		);
	}

	if (bookmarks.length === 0) {
		return (
			<div className="py-12 text-center text-[#4a4a4a]">
				<p>No bookmarks in this folder yet.</p>
			</div>
		);
	}

	const groupedBookmarks = showMonths
		? bookmarks.reduce(
				(groups, bookmark) => {
					const month = formatMonth(bookmark.createdAt);
					if (!groups[month]) groups[month] = [];
					groups[month].push(bookmark);
					return groups;
				},
				{} as Record<string, Bookmark[]>,
			)
		: { all: bookmarks };

	return (
		<div className="space-y-6">
			{Object.entries(groupedBookmarks).map(([month, items]) => (
				<section key={month}>
					{showMonths && month !== "all" && (
						<h2 className="mb-3 font-medium text-[#4a4a4a] text-[10px] uppercase tracking-wider sm:text-[11px]">
							{month}
						</h2>
					)}

					<div
						className="relative flex flex-col items-stretch gap-2"
						onPointerOver={moveRowHighlight}
						onPointerLeave={hideRowHighlight}
					>
						<span
							aria-hidden="true"
							data-bookmark-highlight
							className="pointer-events-none absolute inset-x-0 top-0 z-0 rounded-[5px] bg-[#111] opacity-0"
						/>
						{items.map((bookmark) => (
							<div
								key={bookmark.id}
								data-bookmark-row={bookmark.id}
								className="relative z-10 flex items-center rounded-[5px] has-[:focus-visible]:bg-[#111] has-[[data-state=open]]:bg-[#111]"
							>
								<BookmarkListItem
									url={bookmark.url}
									metadata={getBookmarkMetadata(bookmark)}
									prefetch="hover"
									showPreview={showPreview}
									variant="row"
									className="dark min-w-0 flex-1"
									previewClassName="dark"
								/>
							</div>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
