import type { ToasterProps } from "sonner";

import { CheckCircleIcon, Loader2 } from "lucide-react";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-center"
      icons={{
        success: (
          <CheckCircleIcon
            className="size-3 text-[#ededed]"
            strokeWidth={2.5}
          />
        ),
        loading: <Loader2 className="size-3 text-[#ededed] animate-spin" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-1.5 bg-[#0a0a0a] border border-[#262626] text-[#ededed] text-xs px-2 py-1.5 rounded-full",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
