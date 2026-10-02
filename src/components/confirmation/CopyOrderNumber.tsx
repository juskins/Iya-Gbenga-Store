"use client";

import { useState } from "react";
import Icon from "@/components/store/Icon";

export default function CopyOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={copyCode}
        className="mt-3 min-h-11 px-4 rounded-full bg-on-primary text-primary font-label-md text-label-md hover:bg-surface-bright transition-colors inline-flex items-center gap-1 shadow-sm"
      >
        <Icon name={copied ? "check" : "content_copy"} className="!text-sm" />
        {copied ? "Copied" : "Copy order number"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Order number copied" : ""}
      </span>
    </>
  );
}
