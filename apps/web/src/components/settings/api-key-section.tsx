"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link2, Copy, RefreshCw, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
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
import { orpc, queryClient } from "@/utils/orpc";

export function ApiKeySection() {
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const { data: apiKey, isLoading } = useQuery(orpc.apiKey.get.queryOptions());

  const createKey = useMutation(
    orpc.apiKey.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.apiKey.get.queryOptions().queryKey,
        });
        setShowUrl(true);
        toast.success("MCP URL generated");
      },
      onError: () => {
        toast.error("Failed to generate MCP URL");
      },
    }),
  );

  const regenerateKey = useMutation(
    orpc.apiKey.regenerate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.apiKey.get.queryOptions().queryKey,
        });
        setShowUrl(true);
        toast.success("MCP URL regenerated");
      },
      onError: () => {
        toast.error("Failed to regenerate MCP URL");
      },
    }),
  );

  const mcpUrl = apiKey?.key ? `${baseUrl}/mcp/${apiKey.key}` : "";

  const copyToClipboard = async () => {
    if (mcpUrl) {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      toast.success("MCP URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskedUrl = apiKey?.key
    ? `${baseUrl}/mcp/${apiKey.key.slice(0, 6)}${"•".repeat(12)}${apiKey.key.slice(-4)}`
    : "";

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-xs font-medium text-[#666] uppercase tracking-wider mb-4">
          MCP Integration
        </h2>
        <div className="bg-[#0a0a0a] border border-[#262626] rounded-sm p-4">
          <div className="h-20 bg-[#1a1a1a] rounded animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-xs font-medium text-[#666] uppercase tracking-wider mb-4">
        MCP Integration
      </h2>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-sm p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-[#1a1a1a] rounded-sm flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5 text-[#666]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#ededed] mb-1">MCP Server URL</p>
            <p className="text-xs text-[#666] leading-relaxed">
              Use this URL to connect your bookmarks with Claude, ChatGPT, or
              any MCP-compatible client
            </p>
          </div>
        </div>

        {apiKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#1a1a1a] border border-[#262626] rounded-sm px-3 py-2 font-mono text-xs text-[#888] overflow-hidden text-ellipsis">
                {showUrl ? mcpUrl : maskedUrl}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUrl(!showUrl)}
                className="h-9 w-9 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a] rounded-sm"
              >
                {showUrl ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-9 w-9 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a] rounded-sm"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-[#666]">
                Keep this URL secret. Do not share it publicly.
              </p>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#888] hover:text-[#ededed] hover:bg-[#1a1a1a] h-8 px-2 rounded-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Regenerate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0a0a0a] border-[#262626] rounded-sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[#ededed]">
                      Regenerate MCP URL?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[#666]">
                      This will invalidate your current URL. Any integrations
                      using the old URL will stop working.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-[#262626] text-[#888] hover:bg-[#1a1a1a] hover:text-[#ededed] rounded-sm">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => regenerateKey.mutate({})}
                      disabled={regenerateKey.isPending}
                      className="bg-[#ededed] text-[#0a0a0a] hover:bg-[#d4d4d4] rounded-sm"
                    >
                      {regenerateKey.isPending
                        ? "Regenerating..."
                        : "Regenerate"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => createKey.mutate({})}
            disabled={createKey.isPending}
            className="w-full bg-[#1a1a1a] border border-[#262626] text-[#ededed] hover:bg-[#262626] hover:border-[#404040] text-sm h-10 rounded-sm transition-all"
          >
            {createKey.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-2" />
                Generate MCP URL
              </>
            )}
          </Button>
        )}
      </div>
    </section>
  );
}
