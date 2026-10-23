"use client";

import { useState } from "react";
import Modal, { fieldClass, labelClass, submitClass } from "./Modal";

type CreateServerModalProps = {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
};

export default function CreateServerModal({
  onClose,
  onCreate,
}: CreateServerModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a server name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onCreate(trimmed);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create a server" onClose={onClose}>
      <p className="mb-4 text-[15px] leading-relaxed text-d-muted">
        Your server is where you and your friends hang out. Make yours and start
        talking.
      </p>

      <form onSubmit={handleSubmit}>
        <label className={labelClass} htmlFor="server-name">
          Server name
        </label>
        <input
          id="server-name"
          type="text"
          value={name}
          autoFocus
          onChange={(event) => setName(event.target.value)}
          placeholder="My cool server"
          className={fieldClass}
        />

        {error && <p className="mt-3 text-[13px] text-d-red">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:underline"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={`${submitClass} w-auto px-6`}>
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
