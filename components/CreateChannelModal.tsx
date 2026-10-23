"use client";

import { useState } from "react";
import Modal, { fieldClass, labelClass, submitClass } from "./Modal";

type CreateChannelModalProps = {
  serverName: string;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
};

export default function CreateChannelModal({
  serverName,
  onClose,
  onCreate,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Channel names are stored without the leading hash and without spaces.
    const trimmed = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) {
      setError("Please enter a channel name.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onCreate(trimmed);
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create the channel.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create a text channel" onClose={onClose}>
      <p className="mb-4 text-[15px] leading-relaxed text-d-muted">
        New channel in <span className="font-semibold text-d-header">{serverName}</span>.
        Channels are where your members communicate.
      </p>

      <form onSubmit={handleSubmit}>
        <label className={labelClass} htmlFor="channel-name">
          Channel name
        </label>
        <div className="relative">
          <input
            id="channel-name"
            type="text"
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            placeholder="new-channel"
            className={`${fieldClass} pl-8`}
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-medium text-d-muted">
            #
          </span>
        </div>

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
