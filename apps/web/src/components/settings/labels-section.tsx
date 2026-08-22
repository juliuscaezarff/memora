"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";

const LABEL_COLORS = [
	{ name: "Crimson", value: "#dc2626" },
	{ name: "Red", value: "#ef4444" },
	{ name: "Coral", value: "#fb7185" },
	{ name: "Pink", value: "#ec4899" },
	{ name: "Magenta", value: "#db2777" },
	{ name: "Fuchsia", value: "#d946ef" },
	{ name: "Purple", value: "#a855f7" },
	{ name: "Grape", value: "#7c3aed" },
	{ name: "Violet", value: "#8b5cf6" },
	{ name: "Periwinkle", value: "#6366f1" },
	{ name: "Indigo", value: "#4f46e5" },
	{ name: "Royal blue", value: "#2563eb" },
	{ name: "Blue", value: "#3b82f6" },
	{ name: "Sky", value: "#0ea5e9" },
	{ name: "Cyan", value: "#06b6d4" },
	{ name: "Ocean", value: "#0891b2" },
	{ name: "Teal", value: "#14b8a6" },
	{ name: "Deep teal", value: "#0d9488" },
	{ name: "Emerald", value: "#10b981" },
	{ name: "Green", value: "#22c55e" },
	{ name: "Olive", value: "#65a30d" },
	{ name: "Lime", value: "#84cc16" },
	{ name: "Mustard", value: "#ca8a04" },
	{ name: "Yellow", value: "#eab308" },
	{ name: "Amber", value: "#f59e0b" },
	{ name: "Orange", value: "#f97316" },
	{ name: "Burnt orange", value: "#ea580c" },
	{ name: "Terracotta", value: "#c2410c" },
	{ name: "Brown", value: "#a16207" },
	{ name: "Stone", value: "#78716c" },
	{ name: "Gray", value: "#71717a" },
	{ name: "Slate", value: "#64748b" },
	{ name: "Deep slate", value: "#475569" },
	{ name: "Silver", value: "#94a3b8" },
	{ name: "Mist", value: "#d4d4d8" },
	{ name: "Blush", value: "#fda4af" },
	{ name: "Peach", value: "#fdba74" },
	{ name: "Lemon", value: "#fde047" },
	{ name: "Mint", value: "#86efac" },
	{ name: "Aqua", value: "#5eead4" },
	{ name: "Ice blue", value: "#7dd3fc" },
	{ name: "Lavender", value: "#c4b5fd" },
] as const;

const QUICK_LABEL_COLOR_VALUES = [
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#3b82f6",
] as const;

const QUICK_LABEL_COLORS = QUICK_LABEL_COLOR_VALUES.map((value) => {
	const color = LABEL_COLORS.find((option) => option.value === value);
	if (!color) throw new Error(`Missing quick label color: ${value}`);
	return color;
});

type LabelColor = (typeof LABEL_COLORS)[number];

type Label = {
	id: string;
	name: string;
	color: string;
	_count: { bookmarks: number };
};

function getRelativeLuminance(hex: string) {
	const channels = [1, 3, 5].map((start) => {
		const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
		return channel <= 0.04045
			? channel / 12.92
			: ((channel + 0.055) / 1.055) ** 2.4;
	});

	return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function getReadableForeground(background: string) {
	const backgroundLuminance = getRelativeLuminance(background);
	const darkLuminance = getRelativeLuminance("#111111");
	const lightContrast = 1.05 / (backgroundLuminance + 0.05);
	const darkContrast =
		(Math.max(backgroundLuminance, darkLuminance) + 0.05) /
		(Math.min(backgroundLuminance, darkLuminance) + 0.05);

	return lightContrast >= darkContrast ? "#ffffff" : "#111111";
}

function ColorSwatch({
	color,
	selected,
	onSelect,
	className,
}: {
	color: LabelColor;
	selected: boolean;
	onSelect: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			title={color.name}
			aria-label={`Use ${color.name}`}
			aria-pressed={selected}
			onClick={onSelect}
			className={cn(
				"flex size-6 shrink-0 items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-[#0a0a0a] transition-[scale,box-shadow] duration-100 focus-visible:ring-1 focus-visible:ring-[#aaa] active:scale-96",
				selected && "ring-1 ring-white/80",
				className,
			)}
			style={{ backgroundColor: color.value }}
		>
			{selected ? (
				<Check
					className="size-3 drop-shadow-sm"
					strokeWidth={2}
					style={{ color: getReadableForeground(color.value) }}
				/>
			) : null}
		</button>
	);
}

function ColorPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (color: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const selectedColor = LABEL_COLORS.find((color) => color.value === value);
	const selectedIsQuick = QUICK_LABEL_COLOR_VALUES.some(
		(color) => color === value,
	);

	return (
		<fieldset className="flex items-center gap-2" aria-label="Label color">
			<legend className="sr-only">Choose a label color</legend>
			{QUICK_LABEL_COLORS.map((color) => (
				<ColorSwatch
					key={color.value}
					color={color}
					selected={value === color.value}
					onSelect={() => onChange(color.value)}
					className="size-7"
				/>
			))}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={
						<button
							type="button"
							title={
								selectedIsQuick
									? "More colors"
									: `More colors, ${selectedColor?.name ?? "custom color"} selected`
							}
							aria-label="Choose from more colors"
							className={cn(
								"flex size-7 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#111] text-[#666] outline-none transition-[background-color,color,scale,box-shadow] duration-100 hover:bg-[#181818] hover:text-[#ededed] focus-visible:ring-1 focus-visible:ring-[#aaa] active:scale-96",
								!selectedIsQuick && "ring-1 ring-white/80",
							)}
							style={selectedIsQuick ? undefined : { backgroundColor: value }}
						/>
					}
				>
					<ChevronDown
						className="size-3.5"
						style={
							selectedIsQuick
								? undefined
								: { color: getReadableForeground(value) }
						}
					/>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					sideOffset={6}
					className="w-64 gap-3 rounded-md border border-[#262626] bg-[#0a0a0a] p-3 shadow-black/30 shadow-lg"
				>
					<PopoverHeader>
						<PopoverTitle className="text-[#ededed] text-xs">
							Label color
						</PopoverTitle>
					</PopoverHeader>
					<fieldset className="grid grid-cols-7 gap-2" aria-label="Label color">
						<legend className="sr-only">Choose a label color</legend>
						{LABEL_COLORS.map((color) => (
							<ColorSwatch
								key={color.value}
								color={color}
								selected={value === color.value}
								onSelect={() => {
									onChange(color.value);
									setOpen(false);
								}}
							/>
						))}
					</fieldset>
				</PopoverContent>
			</Popover>
		</fieldset>
	);
}

function LabelRow({ label }: { label: Label }) {
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(label.name);
	const [color, setColor] = useState(label.color);

	const updateLabel = useMutation(
		orpc.label.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.label.getAll.queryOptions().queryKey,
				});
				queryClient.invalidateQueries({
					queryKey: orpc.bookmark.getByFolder.key(),
				});
				setEditing(false);
				toast.success("Label updated");
			},
			onError: () => toast.error("Could not update label"),
		}),
	);

	const deleteLabel = useMutation(
		orpc.label.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.label.getAll.queryOptions().queryKey,
				});
				queryClient.invalidateQueries({
					queryKey: orpc.bookmark.getByFolder.key(),
				});
				toast.success("Label deleted");
			},
			onError: () => toast.error("Could not delete label"),
		}),
	);

	const cancelEditing = () => {
		setName(label.name);
		setColor(label.color);
		setEditing(false);
	};

	if (editing) {
		return (
			<form
				className="space-y-3 rounded-md border border-[#262626] bg-[#0a0a0a] p-3"
				onSubmit={(event) => {
					event.preventDefault();
					if (!name.trim()) return;
					updateLabel.mutate({ id: label.id, name: name.trim(), color });
				}}
			>
				<Input
					value={name}
					onChange={(event) => setName(event.target.value)}
					maxLength={32}
					autoFocus
					aria-label="Label name"
					className="h-8 rounded-md border-[#262626] bg-[#111] text-[#ededed] text-sm"
				/>
				<ColorPicker value={color} onChange={setColor} />
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="rounded-md"
						onClick={cancelEditing}
					>
						<X />
						Cancel
					</Button>
					<Button
						type="submit"
						size="sm"
						className="rounded-md"
						disabled={updateLabel.isPending}
					>
						<Check />
						Save
					</Button>
				</div>
			</form>
		);
	}

	return (
		<div className="group flex min-h-12 items-center gap-2.5 rounded-md border border-[#1f1f1f] px-2.5 py-2">
			<span
				className="size-2.5 shrink-0 rounded-full"
				style={{ backgroundColor: label.color }}
				aria-hidden="true"
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[#ededed] text-sm">{label.name}</p>
				<p className="text-[#666] text-xs">
					{label._count.bookmarks === 1
						? "1 link"
						: `${label._count.bookmarks} links`}
				</p>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label={`Edit ${label.name}`}
				onClick={() => setEditing(true)}
				className="rounded-md text-[#666] hover:text-[#ededed]"
			>
				<Pencil />
			</Button>
			<AlertDialog>
				<AlertDialogTrigger
					render={
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={`Delete ${label.name}`}
							className="rounded-md text-[#666] hover:text-red-400"
						/>
					}
				>
					<Trash2 />
				</AlertDialogTrigger>
				<AlertDialogContent className="rounded-md border-[#262626] bg-[#0a0a0a]">
					<AlertDialogHeader>
						<AlertDialogTitle>Delete “{label.name}”?</AlertDialogTitle>
						<AlertDialogDescription>
							This removes the label from every link. Your links will not be
							deleted.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteLabel.mutate({ id: label.id })}
							className="bg-red-500 text-white hover:bg-red-600"
						>
							Delete label
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

export function LabelsSection() {
	const [name, setName] = useState("");
	const [color, setColor] = useState<string>(LABEL_COLORS[12].value);
	const { data: labels = [], isPending } = useQuery(
		orpc.label.getAll.queryOptions(),
	);

	const createLabel = useMutation(
		orpc.label.create.mutationOptions({
			onSuccess: () => {
				setName("");
				queryClient.invalidateQueries({
					queryKey: orpc.label.getAll.queryOptions().queryKey,
				});
				toast.success("Label created");
			},
			onError: () => toast.error("A label with this name may already exist"),
		}),
	);

	return (
		<section>
			<div className="mb-5">
				<h1 className="font-medium text-[#ededed] text-xl">Labels</h1>
				<p className="mt-1 text-[#666] text-[13px] leading-5">
					Create labels to organize and filter your saved links.
				</p>
			</div>

			<form
				className="rounded-md border border-[#262626] bg-[#0a0a0a] p-3"
				onSubmit={(event) => {
					event.preventDefault();
					if (!name.trim()) return;
					createLabel.mutate({ name: name.trim(), color });
				}}
			>
				<label
					htmlFor="new-label-name"
					className="font-medium text-[#888] text-xs"
				>
					New label
				</label>
				<div className="mt-2 flex gap-2">
					<Input
						id="new-label-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="e.g. Romance"
						maxLength={32}
						className="h-7 min-w-0 flex-1 rounded-md border-[#262626] bg-[#111] text-[#ededed] text-sm placeholder:text-[#555]"
					/>
					<Button
						type="submit"
						className="h-7 rounded-md"
						disabled={!name.trim() || createLabel.isPending}
					>
						<Plus />
						Add label
					</Button>
				</div>
				<div className="mt-3">
					<ColorPicker value={color} onChange={setColor} />
				</div>
			</form>

			<div className="mt-6">
				<h2 className="mb-2 font-medium text-[#666] text-xs uppercase tracking-wider">
					Your labels
				</h2>
				{isPending ? (
					<output className="block space-y-2" aria-label="Loading labels">
						{["label-1", "label-2", "label-3"].map((item) => (
							<div
								key={item}
								className="h-12 animate-pulse rounded-md bg-[#111]"
							/>
						))}
					</output>
				) : labels.length > 0 ? (
					<div className="space-y-2">
						{labels.map((label) => (
							<LabelRow key={label.id} label={label} />
						))}
					</div>
				) : (
					<div className="flex flex-col items-center rounded-md border border-[#262626] border-dashed px-4 py-8 text-center">
						<Tag className="size-5 text-[#555]" strokeWidth={1.5} />
						<p className="mt-3 text-[#888] text-sm">No labels yet</p>
						<p className="mt-1 text-[#555] text-xs">
							Create your first label using the form above.
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
