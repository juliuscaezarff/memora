"use client";

import { ListFilter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type BookmarkLabel = {
	id: string;
	name: string;
	color: string;
};

export function LabelFilter({
	labels,
	value,
	onChange,
}: {
	labels: BookmarkLabel[];
	value: string | null;
	onChange: (value: string | null) => void;
}) {
	const selectedLabel = labels.find((label) => label.id === value);

	if (labels.length === 0) return null;

	return (
		<div className="flex justify-end">
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							variant="ghost"
							size="sm"
							aria-label={
								selectedLabel
									? `Filtering by ${selectedLabel.name}`
									: "Filter by label"
							}
							className="rounded-md text-[#666] hover:bg-[#111] hover:text-[#ededed]"
						/>
					}
				>
					{selectedLabel ? (
						<span
							className="size-2 rounded-full"
							style={{ backgroundColor: selectedLabel.color }}
						/>
					) : (
						<ListFilter />
					)}
					<span>{selectedLabel?.name ?? "Filter"}</span>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-48 border-[#262626] bg-[#0a0a0a] text-[#ededed]"
				>
					<DropdownMenuGroup>
						<DropdownMenuLabel>Filter by label</DropdownMenuLabel>
						<DropdownMenuSeparator className="bg-[#262626]" />
						<DropdownMenuRadioGroup
							className="mt-1"
							value={value ?? "all"}
							onValueChange={(nextValue) =>
								onChange(nextValue === "all" ? null : nextValue)
							}
						>
							<DropdownMenuRadioItem value="all" className="focus:bg-[#1a1a1a]">
								<X className="text-[#666]" />
								All links
							</DropdownMenuRadioItem>
							{labels.map((label) => (
								<DropdownMenuRadioItem
									key={label.id}
									value={label.id}
									className="focus:bg-[#1a1a1a]"
								>
									<span
										className="size-2 rounded-full"
										style={{ backgroundColor: label.color }}
									/>
									<span className="truncate">{label.name}</span>
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
