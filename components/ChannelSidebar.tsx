"use client";

import { useState } from "react";
import type { Author, Channel, Server } from "@/lib/data";
import Avatar from "./Avatar";
import Badges from "./Badges";
import {
  ChevronIcon,
  CloseIcon,
  HashIcon,
  HeadphonesIcon,
  LogOutIcon,
  MicIcon,
  PlusIcon,
  SettingsIcon,
  SpeakerIcon,
} from "./icons";

type ChannelSidebarProps = {
  server: Server | null;
  channels: Channel[];
  currentUser: Author;
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  open: boolean;
  onClose: () => void;
  canAddChannel: boolean;
  onAddChannel: () => void;
  onSignOut?: () => void;
};

function CategorySection({
  title,
  channels,
  activeChannelId,
  onSelectChannel,
  onAdd,
}: {
  title: string;
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  onAdd?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="mb-1">
      <div className="flex items-center gap-0.5 px-1 pb-1 pt-4">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="group flex min-w-0 flex-1 items-center gap-0.5 text-[11px] font-bold uppercase tracking-[0.02em] text-d-muted transition-colors hover:text-d-header"
        >
          <ChevronIcon
            className={`h-3 w-3 shrink-0 transition-transform duration-150 ${
              collapsed ? "-rotate-90" : ""
            }`}
            strokeWidth={3}
          />
          <span className="truncate">
            {collapsed ? `${title} (${channels.length})` : title}
          </span>
        </button>
        {onAdd && (
          <button
            type="button"
            aria-label={`Create a channel in ${title}`}
            title="Create Channel"
            onClick={onAdd}
            className="flex h-4 w-4 shrink-0 items-center justify-center text-d-muted transition-colors hover:text-d-header"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <ul className="space-y-0.5">
        {!collapsed &&
          channels.map((channel) => {
            const active = channel.id === activeChannelId;
            return (
              <li key={channel.id}>
                <button
                  type="button"
                  onClick={() => onSelectChannel(channel.id)}
                  className={`group flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-[15px] font-medium transition-colors ${
                    active
                      ? "bg-d-active text-white"
                      : "text-d-muted hover:bg-d-hover hover:text-d-header"
                  } ${channel.type === "voice" ? "mt-0.5" : ""}`}
                >
                  {channel.type === "text" ? (
                    <HashIcon className="h-5 w-5 shrink-0 text-d-muted" />
                  ) : (
                    <SpeakerIcon className="h-5 w-5 shrink-0 text-d-muted" />
                  )}
                  <span className="truncate">{channel.name}</span>
                  <SettingsIcon className="ml-auto hidden h-4 w-4 shrink-0 text-d-muted group-hover:block" />
                </button>
              </li>
            );
          })}
      </ul>
    </section>
  );
}

function PanelIconButton({
  label,
  muted,
  onClick,
  children,
}: {
  label: string;
  muted?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`group relative flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors hover:bg-d-hover ${
        muted ? "text-d-red" : "text-d-text"
      }`}
    >
      {children}
      {muted && (
        <span className="pointer-events-none absolute h-[2px] w-5 rotate-45 rounded bg-d-red" />
      )}
    </button>
  );
}

export default function ChannelSidebar({
  server,
  channels,
  currentUser,
  activeChannelId,
  onSelectChannel,
  open,
  onClose,
  canAddChannel,
  onAddChannel,
  onSignOut,
}: ChannelSidebarProps) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const textChannels = channels.filter((channel) => channel.category === "Text Channels");
  const voiceChannels = channels.filter((channel) => channel.category === "Voice Channels");

  return (
    <>
      {open && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-[72px] z-40 flex w-60 shrink-0 flex-col bg-d-sidebar transition-transform duration-200 ease-out md:relative md:left-auto md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[320px]"
        }`}
      >
        {/* Server header */}
        <div className="flex h-12 shrink-0 items-center shadow-[0_1px_0_rgba(0,0,0,0.24)]">
          <button
            type="button"
            className="flex h-full min-w-0 flex-1 items-center gap-1 px-4 text-[15px] font-semibold text-d-header transition-colors hover:bg-d-hover"
          >
            <span className="truncate">{server ? server.name : "No server"}</span>
            {server && <ChevronIcon className="h-4 w-4 shrink-0" strokeWidth={3} />}
          </button>
          <button
            type="button"
            aria-label="Close channel list"
            onClick={onClose}
            className="mr-2 flex h-8 w-8 items-center justify-center rounded text-d-muted transition-colors hover:text-d-header md:hidden"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Channel list */}
        <div className="scrollbar-discord flex-1 overflow-y-auto px-2 pb-2">
          {server ? (
            <>
              <CategorySection
                title="Text Channels"
                channels={textChannels}
                activeChannelId={activeChannelId}
                onSelectChannel={onSelectChannel}
                onAdd={canAddChannel ? onAddChannel : undefined}
              />
              <CategorySection
                title="Voice Channels"
                channels={voiceChannels}
                activeChannelId={activeChannelId}
                onSelectChannel={onSelectChannel}
              />
              {channels.length === 0 && (
                <p className="px-2 pt-3 text-[13px] leading-relaxed text-d-muted">
                  This server has no channels yet.
                  {canAddChannel
                    ? " Use the + next to Text Channels to add one."
                    : " The owner hasn't created any yet."}
                </p>
              )}
            </>
          ) : (
            <p className="px-2 pt-6 text-center text-[13px] leading-relaxed text-d-muted">
              You don&apos;t have any servers yet. Use the{" "}
              <span className="font-bold text-d-green">+</span> button above the
              list to create your first one.
            </p>
          )}
        </div>

        {/* User panel */}
        <div className="relative flex h-[52px] shrink-0 items-center gap-0.5 bg-d-userpanel px-2">
          {menuOpen && (
            <>
              <div
                role="presentation"
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute bottom-[60px] left-2 z-50 w-56 overflow-hidden rounded-md bg-[#111214] p-2 shadow-2xl">
                <div className="px-2 py-1">
                  <p className="flex items-center gap-1 text-[15px] font-semibold text-white">
                    <span className="truncate">{currentUser.name}</span>
                    <Badges badges={currentUser.badges} size={15} />
                  </p>
                  <p className="truncate text-[12px] text-d-muted">
                    {currentUser.customStatus || "Online"}
                  </p>
                </div>
                <div className="my-1 h-px bg-d-divider" />
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[14px] font-medium text-d-red transition-colors hover:bg-d-hover"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    Sign Out
                  </button>
                )}
              </div>
            </>
          )}

          <button
            type="button"
            title={currentUser.name}
            onClick={() => setMenuOpen((value) => !value)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-d-hover"
          >
            <Avatar
              name={currentUser.name}
              color={currentUser.color}
              src={currentUser.avatarUrl}
              status={currentUser.status}
              size={32}
              ringClass="ring-d-userpanel"
            />
            <span className="min-w-0 text-left leading-tight">
              <span className="flex min-w-0 items-center gap-1">
                <span className="truncate text-[13px] font-semibold text-d-header">
                  {currentUser.name}
                </span>
                <Badges badges={currentUser.badges} size={14} />
              </span>
              <span className="block truncate text-[12px] text-d-muted">
                {muted ? "Muted" : currentUser.customStatus || "Online"}
              </span>
            </span>
          </button>

          <PanelIconButton label="Mute" muted={muted} onClick={() => setMuted((value) => !value)}>
            <MicIcon className="h-[18px] w-[18px]" />
          </PanelIconButton>
          <PanelIconButton
            label="Deafen"
            muted={deafened}
            onClick={() => setDeafened((value) => !value)}
          >
            <HeadphonesIcon className="h-[18px] w-[18px]" />
          </PanelIconButton>
          <PanelIconButton label="User Settings">
            <SettingsIcon className="h-[18px] w-[18px]" />
          </PanelIconButton>
        </div>
      </aside>
    </>
  );
}
