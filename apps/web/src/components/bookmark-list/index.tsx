"use client";

import { useQuery } from "@tanstack/react-query";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { BookmarkActions } from "@/components/bookmark-actions";
import { LabelFilter } from "@/components/label-filter";
import { orpc } from "@/utils/orpc";
import {
	BookmarkListItem,
	type BookmarkListItemMetadata,
} from "./bookmark-list";

type BookmarkLabel = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	name: string;
	userId: string;
	color: string;
};

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
	labels: BookmarkLabel[];
};

type BookmarkListProps = {
	showPreview: boolean;
	showMonths: boolean;
	selectedFolderId: string | null;
	folders: Array<{ id: string; name: string; icon: string }>;
	labels: BookmarkLabel[];
};

const BOOKMARK_SKELETONS = [
	"bookmark-skeleton-1",
	"bookmark-skeleton-2",
	"bookmark-skeleton-3",
	"bookmark-skeleton-4",
	"bookmark-skeleton-5",
	"bookmark-skeleton-6",
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

// The previous row-and-actions UI remains available in bookmark-list-legacy.tsx.
export function BookmarkList({
	showPreview,
	showMonths,
	selectedFolderId,
	folders,
	labels,
}: BookmarkListProps) {
	const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
	const { data: bookmarks = [], isPending } = useQuery({
		...orpc.bookmark.getByFolder.queryOptions({
			input: { folderId: selectedFolderId ?? "" },
		}),
		enabled: !!selectedFolderId,
	});

	useEffect(() => {
		if (
			selectedLabelId &&
			!labels.some((label) => label.id === selectedLabelId)
		) {
			setSelectedLabelId(null);
		}
	}, [labels, selectedLabelId]);

	const filteredBookmarks = useMemo(
		() =>
			selectedLabelId
				? bookmarks.filter((bookmark) =>
						bookmark.labels.some((label) => label.id === selectedLabelId),
					)
				: bookmarks,
		[bookmarks, selectedLabelId],
	);

	if (!selectedFolderId) {
		return (
			<div className="py-12 text-center text-[#4a4a4a]">
				<p>Create a folder to start saving bookmarks</p>
			</div>
		);
	}

	if (isPending) {
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
				<p>No bookmarks yet. Paste a link above to save your first bookmark.</p>
			</div>
		);
	}

	const groupedBookmarks = showMonths
		? filteredBookmarks.reduce(
				(groups, bookmark) => {
					const month = formatMonth(bookmark.createdAt);
					if (!groups[month]) groups[month] = [];
					groups[month].push(bookmark);
					return groups;
				},
				{} as Record<string, Bookmark[]>,
			)
		: { all: filteredBookmarks };

	return (
		<div>
			<div className="mb-4">
				<LabelFilter
					labels={labels}
					value={selectedLabelId}
					onChange={setSelectedLabelId}
				/>
			</div>
			{filteredBookmarks.length === 0 ? (
				<div className="py-12 text-center text-[#4a4a4a]">
					<p>No links match this label.</p>
				</div>
			) : (
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
										{bookmark.labels.length > 0 ? (
											<span
												className="ms-2 me-0.5 flex shrink-0 items-center gap-1"
												title={bookmark.labels
													.map((label) => label.name)
													.join(", ")}
											>
												<span className="sr-only">
													Labels:{" "}
													{bookmark.labels
														.map((label) => label.name)
														.join(", ")}
												</span>
												{bookmark.labels.slice(0, 3).map((label) => (
													<span
														key={label.id}
														className="size-1.5 rounded-full"
														style={{ backgroundColor: label.color }}
													/>
												))}
												{bookmark.labels.length > 3 ? (
													<span className="text-[#555] text-[10px]">
														+{bookmark.labels.length - 3}
													</span>
												) : null}
											</span>
										) : null}
										<BookmarkActions
											bookmark={bookmark}
											currentFolderId={selectedFolderId}
											folders={folders}
											labels={labels}
											alwaysVisible
										/>
									</div>
								))}
							</div>
						</section>
					))}
				</div>
			)}
		</div>
	);
}
