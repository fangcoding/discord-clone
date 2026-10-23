"use client";

import { useEffect } from "react";
import { CloseIcon } from "./icons";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const fieldClass =
  "w-full rounded bg-d-serverbar px-3 py-2.5 text-[15px] text-d-text placeholder-d-muted outline-none ring-1 ring-black/20 focus:ring-2 focus:ring-d-blurple";

export const labelClass =
  "mb-2 block text-[12px] font-bold uppercase tracking-[0.02em] text-d-header";

export const submitClass =
  "w-full rounded bg-d-blurple px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-d-blurple-hover disabled:cursor-not-allowed disabled:opacity-60";

/** Centered dialog with a click-away backdrop and Escape-to-close. */
export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-md bg-d-chat shadow-2xl"
      >
        <header className="flex items-start justify-between px-4 pt-4">
          <h2 className="text-[20px] font-semibold text-white">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="mt-0.5 text-d-muted transition-colors hover:text-d-header"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="px-4 pb-5 pt-3">{children}</div>
      </div>
    </div>
  );
}
