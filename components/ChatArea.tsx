"use client";

import { useEffect, useRef, useState } from "react";
import type { Author, Channel, Message } from "@/lib/data";
import { UNKNOWN_AUTHOR } from "@/lib/data";
import Avatar from "./Avatar";
import {
  BellIcon,
  EmojiIcon,
  HamburgerIcon,
  HashIcon,
  PinIcon,
  PlusCircleIcon,
  SearchIcon,
  SpeakerIcon,
  UsersIcon,
} from "./icons";

type ChatAreaProps = {
  channel: Channel | null;
  messages: Message[];
  authors: Record<string, Author>;
  membersOpen: boolean;
  onSend: (content: string) => void;
  onOpenChannels: () => void;
  onToggleMembers: () => void;
};

function MessageRow({
  message,
  grouped,
  authors,
}: {
  message: Message;
  grouped: boolean;
  authors: Record<string, Author>;
}) {
  const author = authors[message.authorId] ?? UNKNOWN_AUTHOR;
  const time = message.timestamp.replace(/^Today at /, "");

  if (grouped) {
    return (
      <div className="group relative flex gap-4 px-4 py-0.5 hover:bg-[#2e3035]">
        <span className="w-10 shrink-0 select-none pt-[3px] text-right text-[11px] leading-[1.375rem] text-d-muted opacity-0 group-hover:opacity-100">
          {time}
        </span>
        <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-[15px] leading-[1.375rem] text-d-text">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="group relative flex gap-4 px-4 py-0.5 hover:bg-[#2e3035]">
      <Avatar
        name={author.name}
        color={author.color}
        size={40}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-medium" style={{ color: author.roleColor }}>
            {author.name}
          </span>
          <span className="text-[11px] text-d-muted">{message.timestamp}</span>
        </div>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.375rem] text-d-text">
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default function ChatArea({
  channel,
  messages,
  authors,
  membersOpen,
  onSend,
  onOpenChannels,
  onToggleMembers,
}: ChatAreaProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [channel?.id, messages.length]);

  if (!channel) {
    return (
      <section className="flex min-w-0 flex-1 flex-col bg-d-chat">
        <header className="flex h-12 shrink-0 items-center px-4 md:hidden">
          <button
            type="button"
            aria-label="Toggle channel list"
            onClick={onOpenChannels}
            className="flex h-8 w-8 items-center justify-center rounded text-d-muted transition-colors hover:bg-d-hover hover:text-d-header"
          >
            <HamburgerIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-d-active">
            <HashIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-[20px] font-semibold text-white">
            No channel selected
          </h2>
          <p className="mt-1 max-w-xs text-[15px] text-d-muted">
            Create a text channel from the sidebar to start chatting.
          </p>
        </div>
      </section>
    );
  }

  function handleSend() {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  }

  const ChannelIcon = channel.type === "voice" ? SpeakerIcon : HashIcon;

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-d-chat">
      {/* Channel header */}
      <header className="flex h-12 shrink-0 items-center px-4 shadow-[0_1px_0_rgba(0,0,0,0.2)]">
        <button
          type="button"
          aria-label="Toggle channel list"
          onClick={onOpenChannels}
          className="mr-2 flex h-8 w-8 items-center justify-center rounded text-d-muted transition-colors hover:bg-d-hover hover:text-d-header md:hidden"
        >
          <HamburgerIcon className="h-5 w-5" />
        </button>

        <ChannelIcon className="mr-2 h-6 w-6 shrink-0 text-d-muted" />
        <h1 className="truncate text-[15px] font-semibold text-white">{channel.name}</h1>

        {channel.topic && (
          <>
            <div className="mx-4 hidden h-6 w-px bg-d-divider sm:block" />
            <p className="hidden truncate text-[13px] text-d-muted sm:block">{channel.topic}</p>
          </>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-4 pl-4 text-d-muted">
          <button
            type="button"
            aria-label="Notification Settings"
            className="transition-colors hover:text-d-header"
          >
            <BellIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Pinned Messages"
            className="transition-colors hover:text-d-header"
          >
            <PinIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Toggle Member List"
            onClick={onToggleMembers}
            className={`transition-colors hover:text-d-header ${membersOpen ? "text-d-header" : ""}`}
          >
            <UsersIcon className="h-5 w-5" />
          </button>
          <div className="hidden items-center rounded bg-d-serverbar px-2 py-1 sm:flex">
            <input
              type="text"
              placeholder="Search"
              className="w-24 bg-transparent text-[13px] text-d-text placeholder-d-muted outline-none"
            />
            <SearchIcon className="h-4 w-4" />
          </div>
        </div>
      </header>

      {/* Message history */}
      <div
        ref={scrollRef}
        className="scrollbar-discord scrollbar-gutter-stable flex-1 overflow-y-auto py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-start justify-end px-4 pb-2">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-d-active">
              <ChannelIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-[30px] font-bold text-white">Welcome to #{channel.name}!</h2>
            <p className="text-[15px] text-d-muted">This is the start of the channel.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageRow
              key={message.id}
              message={message}
              authors={authors}
              grouped={index > 0 && messages[index - 1].authorId === message.authorId}
            />
          ))
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 px-4 pb-6 pt-1">
        <div className="flex items-center gap-4 rounded-lg bg-d-chatinput px-4">
          <button
            type="button"
            aria-label="Attach a file"
            className="text-d-muted transition-colors hover:text-d-header"
          >
            <PlusCircleIcon className="h-6 w-6" />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message #${channel.name}`}
            className="min-w-0 flex-1 bg-transparent py-[11px] text-[15px] text-d-text placeholder-d-muted outline-none"
          />
          <button
            type="button"
            aria-label="Choose an emoji"
            className="text-d-muted transition-colors hover:text-d-header"
          >
            <EmojiIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
