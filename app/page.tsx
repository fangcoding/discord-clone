"use client";

import { useState } from "react";
import AuthScreen from "@/components/AuthScreen";
import ChannelSidebar from "@/components/ChannelSidebar";
import ChatArea from "@/components/ChatArea";
import CreateChannelModal from "@/components/CreateChannelModal";
import CreateServerModal from "@/components/CreateServerModal";
import ServerBar from "@/components/ServerBar";
import UserDrawer from "@/components/UserDrawer";
import { DiscordLogo } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useChatData } from "@/lib/useChatData";

export default function Home() {
  const {
    authReady,
    session,
    servers,
    channels,
    authors,
    currentUser,
    members,
    activeServer,
    activeChannel,
    activeChannelId,
    messages,
    selectServer,
    selectChannel,
    sendMessage,
    signIn,
    signUp,
    signOut,
    createServer,
    createChannel,
  } = useChatData();

  const [channelSidebarOpen, setChannelSidebarOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(true);
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);

  // Only the server's owner may add channels (the RLS policy enforces it too).
  const canAddChannel =
    !isSupabaseConfigured ||
    (activeServer?.ownerId != null && activeServer.ownerId === currentUser.id);

  if (isSupabaseConfigured && !authReady) {
    return (
      <main className="flex h-screen items-center justify-center bg-d-chat">
        <DiscordLogo className="h-12 w-12 animate-pulse text-d-blurple" />
      </main>
    );
  }

  if (isSupabaseConfigured && !session) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-d-chat">
      <ServerBar
        servers={servers}
        activeServerId={activeServer?.id ?? ""}
        onSelectServer={selectServer}
        onAddServer={() => setServerModalOpen(true)}
      />

      <ChannelSidebar
        server={activeServer}
        channels={channels}
        currentUser={currentUser}
        activeChannelId={activeChannelId}
        onSelectChannel={(id) => {
          selectChannel(id);
          setChannelSidebarOpen(false);
        }}
        open={channelSidebarOpen}
        onClose={() => setChannelSidebarOpen(false)}
        canAddChannel={canAddChannel}
        onAddChannel={() => setChannelModalOpen(true)}
        onSignOut={isSupabaseConfigured ? signOut : undefined}
      />

      <ChatArea
        channel={activeChannel}
        messages={messages}
        authors={authors}
        membersOpen={membersOpen}
        onSend={sendMessage}
        onOpenChannels={() => setChannelSidebarOpen(true)}
        onToggleMembers={() => setMembersOpen((value) => !value)}
      />

      <UserDrawer open={membersOpen} members={members} />

      {serverModalOpen && (
        <CreateServerModal
          onClose={() => setServerModalOpen(false)}
          onCreate={createServer}
        />
      )}

      {channelModalOpen && activeServer && (
        <CreateChannelModal
          serverName={activeServer.name}
          onClose={() => setChannelModalOpen(false)}
          onCreate={(name) => createChannel(name, "text")}
        />
      )}
    </main>
  );
}
