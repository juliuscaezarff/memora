"use client";

import { Trash2 } from "lucide-react";
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

export function DangerZoneSection() {
	return (
		<section className="mb-6">
			<h2 className="mb-3 font-medium text-[#666] text-xs uppercase tracking-wider">
				Danger Zone
			</h2>

			<div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-3">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-[#ededed] text-sm">Delete account</p>
						<p className="text-[#666] text-xs">
							Permanently remove your account and all data
						</p>
					</div>
					<AlertDialog>
						<AlertDialogTrigger
							render={
								<Button
									variant="outline"
									size="sm"
									className="h-7 rounded-md border-[#3d1f1f] bg-transparent text-[#ff6369] text-xs hover:border-[#4d2525] hover:bg-[#2a1515] hover:text-[#ff6369]"
								/>
							}
						>
							<Trash2 className="mr-1.5 h-3.5 w-3.5" />
							Delete
						</AlertDialogTrigger>
						<AlertDialogContent className="rounded-sm border-[#262626] bg-[#0a0a0a]">
							<AlertDialogHeader>
								<AlertDialogTitle className="text-[#ededed]">
									Are you absolutely sure?
								</AlertDialogTitle>
								<AlertDialogDescription className="text-[#666]">
									This action cannot be undone. This will permanently delete
									your account and remove all your bookmarks from our servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel className="rounded-sm border-[#262626] bg-transparent text-[#888] hover:bg-[#1a1a1a] hover:text-[#ededed]">
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction className="rounded-sm border-[#4d2525] bg-[#3d1f1f] text-[#ff6369] hover:bg-[#4d2525]">
									Delete account
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</section>
	);
}
