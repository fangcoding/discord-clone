import type { SupabaseClient } from "@supabase/supabase-js";
import type { Author, Channel, ChannelType, Message, Server } from "./data";

/** Shapes returned by the tables defined in `schema.sql`. */

export type ProfileRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  custom_status: string | null;
  badges: string[] | null;
};

export type ServerRow = {
  id: string;
  name: string;
  icon_url: string | null;
  owner_id: string;
};

export type ChannelRow = {
  id: string;
  server_id: string;
  name: string;
  type: "text" | "voice";
};

export type MessageRow = {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

/**
 * The schema has no colour columns, so avatars/icons get a deterministic
 * gradient derived from their id. The same seed always yields the same colour.
 */
const GRADIENTS = [
  "linear-gradient(135deg, #5865f2, #7983f5)",
  "linear-gradient(135deg, #23a55a, #3ddc84)",
  "linear-gradient(135deg, #f23f43, #ff7a45)",
  "linear-gradient(135deg, #eb459e, #b45bff)",
  "linear-gradient(135deg, #00a8fc, #00d4c8)",
  "linear-gradient(135deg, #f0b232, #f7d16b)",
];

const ROLE_COLORS = ["#5865f2", "#23a55a", "#f0b232", "#eb459e", "#00a8fc", "#f23f43"];

const SELECTED_MESSAGE_COLUMNS = "id, channel_id, user_id, content, created_at";

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  return hash;
}

export function gradientFor(seed: string): string {
  return GRADIENTS[hashSeed(seed) % GRADIENTS.length];
}

export function roleColorFor(seed: string): string {
  return ROLE_COLORS[hashSeed(seed) % ROLE_COLORS.length];
}

/** Turns a Postgres timestamp into the "Today at 10:11 AM" label the UI uses. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const now = new Date();

  if (date.toDateString() === now.toDateString()) return `Today at ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`;

  return `${date.toLocaleDateString()} ${time}`;
}

export function mapServer(row: ServerRow): Server {
  return {
    id: row.id,
    name: row.name,
    color: gradientFor(row.id),
    iconUrl: row.icon_url,
    ownerId: row.owner_id,
  };
}

export function mapChannel(row: ChannelRow): Channel {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    category: row.type === "voice" ? "Voice Channels" : "Text Channels",
  };
}

export function mapProfile(row: ProfileRow): Author {
  return {
    id: row.id,
    name: row.username || "Unknown",
    color: gradientFor(row.id),
    role: "Member",
    roleColor: roleColorFor(row.id),
    status: "online",
    avatarUrl: row.avatar_url,
    customStatus: row.custom_status,
    badges: Array.isArray(row.badges)
      ? row.badges.filter((badge): badge is string => typeof badge === "string")
      : [],
  };
}

export function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    authorId: row.user_id,
    timestamp: formatTimestamp(row.created_at),
    content: row.content,
  };
}

export async function fetchProfiles(client: SupabaseClient): Promise<Record<string, Author>> {
  const { data, error } = await client
    .from("profiles")
    .select("id, username, avatar_url, custom_status, badges");

  if (error) throw error;

  const profiles: Record<string, Author> = {};
  for (const row of (data ?? []) as ProfileRow[]) {
    profiles[row.id] = mapProfile(row);
  }
  return profiles;
}

export async function fetchServers(client: SupabaseClient): Promise<Server[]> {
  const { data, error } = await client
    .from("servers")
    .select("id, name, icon_url, owner_id")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ServerRow[]).map(mapServer);
}

export async function fetchChannels(
  client: SupabaseClient,
  serverId: string,
): Promise<Channel[]> {
  const { data, error } = await client
    .from("channels")
    .select("id, server_id, name, type")
    .eq("server_id", serverId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ChannelRow[]).map(mapChannel);
}

export async function fetchMessages(
  client: SupabaseClient,
  channelId: string,
): Promise<Message[]> {
  const { data, error } = await client
    .from("messages")
    .select(SELECTED_MESSAGE_COLUMNS)
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as MessageRow[]).map(mapMessage);
}

export async function insertMessage(
  client: SupabaseClient,
  channelId: string,
  userId: string,
  content: string,
): Promise<Message> {
  const { data, error } = await client
    .from("messages")
    .insert({ channel_id: channelId, user_id: userId, content })
    .select(SELECTED_MESSAGE_COLUMNS)
    .single();

  if (error) throw error;
  return mapMessage(data as MessageRow);
}

export async function createServer(
  client: SupabaseClient,
  name: string,
  ownerId: string,
): Promise<Server> {
  const { data, error } = await client
    .from("servers")
    .insert({ name, owner_id: ownerId })
    .select("id, name, icon_url, owner_id")
    .single();

  if (error) throw error;
  return mapServer(data as ServerRow);
}

export async function createChannel(
  client: SupabaseClient,
  serverId: string,
  name: string,
  type: ChannelType,
): Promise<Channel> {
  const { data, error } = await client
    .from("channels")
    .insert({ server_id: serverId, name, type })
    .select("id, server_id, name, type")
    .single();

  if (error) throw error;
  return mapChannel(data as ChannelRow);
}
