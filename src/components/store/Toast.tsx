"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hideToast } from "@/store/uiSlice";
import Icon from "./Icon";

export default function Toast() {
  const message = useAppSelector((s) => s.ui.toast);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => dispatch(hideToast()), 2500);
    return () => clearTimeout(t);
  }, [message, dispatch]);

  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-5 py-3 rounded-full bg-inverse-surface text-inverse-on-surface font-label-md text-label-md shadow-xl"
    >
      <Icon name="check_circle" className="text-xl text-primary-fixed-dim" />
      {message}
    </div>
  );
}
