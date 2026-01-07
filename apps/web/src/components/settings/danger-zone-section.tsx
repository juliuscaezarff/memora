"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function DangerZoneSection() {
  return (
    <section className="mb-8">
      <h2 className="text-xs font-medium text-[#666] uppercase tracking-wider mb-4">
        Danger Zone
      </h2>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#ededed]">Delete account</p>
            <p className="text-xs text-[#666]">
              Permanently remove your account and all data
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-[#3d1f1f] text-[#ff6369] hover:bg-[#2a1515] hover:text-[#ff6369] hover:border-[#4d2525] text-xs h-8 rounded-sm"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0a0a0a] border-[#262626] rounded-sm">
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
                <AlertDialogCancel className="bg-transparent border-[#262626] text-[#888] hover:bg-[#1a1a1a] hover:text-[#ededed] rounded-sm">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction className="bg-[#3d1f1f] border-[#4d2525] text-[#ff6369] hover:bg-[#4d2525] rounded-sm">
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
