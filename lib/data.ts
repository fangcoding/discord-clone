export type ChannelType = "text" | "voice";

export type ChannelCategory = "Text Channels" | "Voice Channels";

export type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  category: ChannelCategory;
  topic?: string;
};

export type Server = {
  id: string;
  name: string;
  color: string;
  iconUrl?: string | null;
  ownerId?: string;
};

export type Status = "online" | "idle" | "dnd" | "offline";

export type Author = {
  id: string;
  name: string;
  color: string;
  role: string;
  roleColor: string;
  status: Status;
  avatarUrl?: string | null;
  customStatus?: string | null;
  badges?: string[];
};

export type Message = {
  id: string;
  authorId: string;
  timestamp: string;
  content: string;
};

/**
 * Shown for a message whose author is not part of the loaded profile set.
 */
export const UNKNOWN_AUTHOR: Author = {
  id: "unknown",
  name: "Unknown",
  color: "linear-gradient(135deg, #80848e, #a3a6aa)",
  role: "Member",
  roleColor: "#949ba4",
  status: "offline",
};

/**
 * Everything below is the offline fallback dataset. It is used whenever
 * Supabase is not configured (or a query fails), so the UI always renders.
 */

export const fallbackServers: Server[] = [
  { id: "discord-devs", name: "Discord Developers", color: "linear-gradient(135deg, #5865f2, #7983f5)" },
  { id: "study-group", name: "Study Group", color: "linear-gradient(135deg, #23a55a, #3ddc84)" },
  { id: "gaming-hub", name: "Gaming Hub", color: "linear-gradient(135deg, #f23f43, #ff7a45)" },
  { id: "design-corner", name: "Design Corner", color: "linear-gradient(135deg, #eb459e, #b45bff)" },
  { id: "music-club", name: "Music Club", color: "linear-gradient(135deg, #00a8fc, #00d4c8)" },
];

export const fallbackChannels: Channel[] = [
  {
    id: "general",
    name: "general",
    type: "text",
    category: "Text Channels",
    topic: "General chit-chat for the whole server",
  },
  {
    id: "lobby",
    name: "lobby",
    type: "text",
    category: "Text Channels",
    topic: "New here? Come say hi",
  },
  {
    id: "voice-lounge",
    name: "Voice Lounge",
    type: "voice",
    category: "Voice Channels",
  },
];

export const fallbackAuthors: Record<string, Author> = {
  aria: { id: "aria", name: "Aria", color: "linear-gradient(135deg, #f23f43, #ff7a45)", role: "Admin", roleColor: "#f23f43", status: "online" },
  kai: { id: "kai", name: "Kai", color: "linear-gradient(135deg, #5865f2, #8891f2)", role: "Moderator", roleColor: "#5865f2", status: "online" },
  mira: { id: "mira", name: "Mira", color: "linear-gradient(135deg, #eb459e, #b45bff)", role: "Designer", roleColor: "#eb459e", status: "idle" },
  theo: { id: "theo", name: "Theo", color: "linear-gradient(135deg, #23a55a, #3ddc84)", role: "Developer", roleColor: "#23a55a", status: "online" },
  priya: { id: "priya", name: "Priya", color: "linear-gradient(135deg, #f0b232, #f7d16b)", role: "Member", roleColor: "#f0b232", status: "online" },
  sam: { id: "sam", name: "Sam", color: "linear-gradient(135deg, #00a8fc, #00d4c8)", role: "Member", roleColor: "#00a8fc", status: "offline" },
  jules: { id: "jules", name: "Jules", color: "linear-gradient(135deg, #80848e, #a3a6aa)", role: "Member", roleColor: "#949ba4", status: "offline" },
  nova: { id: "nova", name: "Nova", color: "linear-gradient(135deg, #5865f2, #eb459e)", role: "Developer", roleColor: "#23a55a", status: "online" },
};

export const fallbackCurrentUser = fallbackAuthors.nova;

export const fallbackMembers: Author[] = [
  fallbackAuthors.aria,
  fallbackAuthors.kai,
  fallbackAuthors.mira,
  fallbackAuthors.theo,
  fallbackAuthors.priya,
  fallbackAuthors.sam,
  fallbackAuthors.jules,
];

export const fallbackMessages: Record<string, Message[]> = {
  general: [
    { id: "g1", authorId: "aria", timestamp: "Today at 9:12 AM", content: "Morning everyone ☀️ Big update lands today — keep an eye on #announcements." },
    { id: "g2", authorId: "kai", timestamp: "Today at 9:14 AM", content: "Finally! I've been waiting on the new voice quality settings." },
    { id: "g3", authorId: "mira", timestamp: "Today at 9:21 AM", content: "Anyone up for a design review at 3pm? I want to walk through the new sidebar." },
    { id: "g4", authorId: "aria", timestamp: "Today at 9:23 AM", content: "Sounds good to me. I'll drop the Figma link in a bit." },
    { id: "g5", authorId: "theo", timestamp: "Today at 10:02 AM", content: "Pushed the scrollbar + palette tweaks. Everything should read as #313338 now." },
    { id: "g6", authorId: "kai", timestamp: "Today at 10:04 AM", content: "Chat feels so much smoother 🔥" },
    { id: "g7", authorId: "mira", timestamp: "Today at 10:09 AM", content: "@Nova can you take a look at the server bar spacing? The hover pills feel off by a pixel." },
    { id: "g8", authorId: "nova", timestamp: "Today at 10:11 AM", content: "On it — tightening the indicator pills and the icon radius now." },
  ],
  lobby: [
    { id: "l1", authorId: "priya", timestamp: "Today at 8:30 AM", content: "Welcome to the lobby 👋" },
    { id: "l2", authorId: "sam", timestamp: "Today at 8:41 AM", content: "Say hi if you're new — nobody bites, promise." },
    { id: "l3", authorId: "priya", timestamp: "Today at 8:45 AM", content: "We host movie nights every Friday at 8pm, hop into Voice Lounge to join." },
    { id: "l4", authorId: "jules", timestamp: "Today at 9:58 AM", content: "Just joined. This place looks great already!" },
  ],
  "voice-lounge": [
    { id: "v1", authorId: "kai", timestamp: "Today at 11:20 AM", content: "Hopping in for a quick call 🔊" },
    { id: "v2", authorId: "priya", timestamp: "Today at 11:24 AM", content: "Joining too — mic should be working this time." },
    { id: "v3", authorId: "kai", timestamp: "Today at 11:51 AM", content: "Heading out, back later tonight." },
  ],
};
