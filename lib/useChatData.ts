"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  fallbackAuthors,
  fallbackChannels,
  fallbackCurrentUser,
  fallbackMembers,
  fallbackMessages,
  fallbackServers,
  type Author,
  type Channel,
  type ChannelType,
  type Message,
  type Server,
} from "./data";
import {
  createChannel as createChannelRow,
  createServer as createServerRow,
  fetchChannels,
  fetchMessages,
  fetchProfiles,
  fetchServers,
  gradientFor,
  insertMessage,
  mapMessage,
  roleColorFor,
  type MessageRow,
} from "./db";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

export type AuthResult = { error: string | null; notice: string | null };

export type ChatData = {
  authReady: boolean;
  session: Session | null;
  servers: Server[];
  channels: Channel[];
  authors: Record<string, Author>;
  currentUser: Author;
  members: Author[];
  activeServer: Server | null;
  activeChannel: Channel | null;
  activeChannelId: string;
  messages: Message[];
  selectServer: (id: string) => void;
  selectChannel: (id: string) => void;
  sendMessage: (content: string) => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>;
  signOut: () => void;
  createServer: (name: string) => Promise<void>;
  createChannel: (name: string, type: ChannelType) => Promise<void>;
};

/** Shown when Supabase is reachable but the signed-in user has no profile row. */
function authorFromSession(id: string, fallbackName: string): Author {
  return {
    id,
    name: fallbackName,
    color: gradientFor(id),
    role: "Member",
    roleColor: roleColorFor(id),
    status: "online",
    avatarUrl: null,
    customStatus: null,
    badges: [],
  };
}

/**
 * Single source of truth for the chat UI.
 *
 * Cloud mode (`NEXT_PUBLIC_SUPABASE_*` present): the signed-in user's data is
 * read from Postgres, new messages stream in over Realtime, and every mutation
 * is written back to the database. Local mode (no env vars): the static dataset
 * in `lib/data.ts` drives the UI so it always renders something.
 */
export function useChatData(): ChatData {
  const client = supabase;
  const live = isSupabaseConfigured && client !== null;

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!live);

  const [servers, setServers] = useState<Server[]>(fallbackServers);
  const [channels, setChannels] = useState<Channel[]>(fallbackChannels);
  const [authors, setAuthors] = useState<Record<string, Author>>(fallbackAuthors);
  const [currentUser, setCurrentUser] = useState<Author>(fallbackCurrentUser);
  const [members, setMembers] = useState<Author[]>(fallbackMembers);
  const [messages, setMessages] = useState<Record<string, Message[]>>(fallbackMessages);
  const [activeServerId, setActiveServerId] = useState(fallbackServers[0].id);
  const [activeChannelId, setActiveChannelId] = useState(fallbackChannels[0].id);

  const userId = session?.user.id ?? null;

  // 1. Session tracking.
  useEffect(() => {
    if (!live || !client) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    client.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setAuthReady(true);
    });

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [live, client]);

  // 2. Load everything the signed-in user can see. Runs again on account switch.
  useEffect(() => {
    if (!live || !client || !userId) return;

    let cancelled = false;

    (async () => {
      try {
        const [profiles, serverRows] = await Promise.all([
          fetchProfiles(client),
          fetchServers(client),
        ]);
        if (cancelled) return;

        const me =
          profiles[userId] ??
          authorFromSession(
            userId,
            session?.user.email?.split("@")[0] ?? "You",
          );

        setAuthors({ ...fallbackAuthors, ...profiles, [me.id]: me });
        setCurrentUser(me);
        setMembers(
          Object.values(profiles).filter((member) => member.id !== userId),
        );
        setServers(serverRows);
        setActiveServerId((previous) =>
          serverRows.some((server) => server.id === previous)
            ? previous
            : serverRows[0]?.id ?? "",
        );
      } catch (error) {
        console.warn("[chat] Could not load servers and profiles.", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [live, client, userId, session?.user.email]);

  // 3. Load the channels of the active server.
  useEffect(() => {
    if (!live || !client || !userId || !activeServerId) return;

    let cancelled = false;

    (async () => {
      try {
        const rows = await fetchChannels(client, activeServerId);
        if (cancelled) return;
        setChannels(rows);
        setActiveChannelId((previous) =>
          rows.some((channel) => channel.id === previous)
            ? previous
            : rows[0]?.id ?? "",
        );
      } catch (error) {
        console.warn("[chat] Could not load channels for this server.", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [live, client, userId, activeServerId]);

  // 4. Load message history for the active channel.
  useEffect(() => {
    if (!live || !client || !userId || !activeChannelId) return;

    let cancelled = false;

    (async () => {
      try {
        const history = await fetchMessages(client, activeChannelId);
        if (cancelled) return;
        setMessages((previous) => ({ ...previous, [activeChannelId]: history }));
      } catch (error) {
        console.warn("[chat] Could not load messages for this channel.", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [live, client, userId, activeChannelId]);

  // 5. Realtime: append inserts as they land in Postgres.
  useEffect(() => {
    if (!live || !client || !userId || !activeChannelId) return;

    const channel = client
      .channel(`messages:${activeChannelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${activeChannelId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((previous) => {
            const existing = previous[activeChannelId] ?? [];
            if (existing.some((message) => message.id === row.id)) return previous;
            return { ...previous, [activeChannelId]: [...existing, mapMessage(row)] };
          });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [live, client, userId, activeChannelId]);

  const selectServer = useCallback((id: string) => setActiveServerId(id), []);

  const selectChannel = useCallback((id: string) => setActiveChannelId(id), []);

  const appendMessage = useCallback((channelId: string, message: Message) => {
    setMessages((previous) => {
      const existing = previous[channelId] ?? [];
      if (existing.some((item) => item.id === message.id)) return previous;
      return { ...previous, [channelId]: [...existing, message] };
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      if (!live || !client || !userId) {
        const time = new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
        appendMessage(activeChannelId, {
          id: `local-${Date.now()}`,
          authorId: currentUser.id,
          timestamp: `Today at ${time}`,
          content: trimmed,
        });
        return;
      }

      if (!activeChannelId) return;

      try {
        const message = await insertMessage(
          client,
          activeChannelId,
          userId,
          trimmed,
        );
        appendMessage(activeChannelId, message);
      } catch (error) {
        console.warn("[chat] Could not send message to Supabase.", error);
      }
    },
    [activeChannelId, appendMessage, client, currentUser.id, live, userId],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!client) return { error: "Supabase is not configured.", notice: null };
      const { error } = await client.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null, notice: null };
    },
    [client],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string,
    ): Promise<AuthResult> => {
      if (!client) return { error: "Supabase is not configured.", notice: null };

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) return { error: error.message, notice: null };

      // With email confirmation enabled there is no session yet.
      if (!data.session) {
        return {
          error: null,
          notice: "Account created. Confirm your email, then sign in.",
        };
      }

      return { error: null, notice: null };
    },
    [client],
  );

  const signOut = useCallback(() => {
    void client?.auth.signOut();
  }, [client]);

  const createServer = useCallback(
    async (name: string) => {
      if (!client || !userId) throw new Error("Sign in to create a server.");

      const server = await createServerRow(client, name, userId);
      setServers((previous) => [...previous, server]);
      setChannels([]);
      setActiveChannelId("");
      setActiveServerId(server.id);
    },
    [client, userId],
  );

  const createChannel = useCallback(
    async (name: string, type: ChannelType) => {
      if (!client || !userId) throw new Error("Sign in to create a channel.");
      if (!activeServerId) throw new Error("Select a server first.");

      const channel = await createChannelRow(client, activeServerId, name, type);
      setChannels((previous) => [...previous, channel]);
      if (type === "text") setActiveChannelId(channel.id);
    },
    [activeServerId, client, userId],
  );

  const activeServer = useMemo(
    () =>
      servers.find((server) => server.id === activeServerId) ?? servers[0] ?? null,
    [servers, activeServerId],
  );

  const activeChannel = useMemo(
    () =>
      channels.find((channel) => channel.id === activeChannelId) ??
      channels[0] ??
      null,
    [channels, activeChannelId],
  );

  return {
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
    messages: messages[activeChannelId] ?? [],
    selectServer,
    selectChannel,
    sendMessage,
    signIn,
    signUp,
    signOut,
    createServer,
    createChannel,
  };
}
