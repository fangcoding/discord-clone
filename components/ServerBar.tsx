import type { Server } from "@/lib/data";
import { DiscordLogo, PlusIcon } from "./icons";

type ServerBarProps = {
  servers: Server[];
  activeServerId: string;
  onSelectServer: (id: string) => void;
  onAddServer: () => void;
};

function Pill({ active }: { active?: boolean }) {
  return (
    <span
      className={`absolute left-0 w-1 rounded-r-full bg-white transition-all duration-200 ease-out ${
        active
          ? "h-10 opacity-100"
          : "h-5 opacity-0 group-hover:h-5 group-hover:opacity-100"
      }`}
    />
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-[68px] z-50 origin-left scale-95 whitespace-nowrap rounded-md bg-[#111214] px-2.5 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-100 group-hover:scale-100 group-hover:opacity-100">
      {label}
    </span>
  );
}

export default function ServerBar({
  servers,
  activeServerId,
  onSelectServer,
  onAddServer,
}: ServerBarProps) {
  return (
    <nav className="flex h-full w-[72px] shrink-0 flex-col items-center gap-2 overflow-visible bg-d-serverbar py-3">
      {/* Home / direct messages */}
      <div className="group relative flex w-full items-center justify-center">
        <Pill />
        <button
          type="button"
          aria-label="Direct Messages"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-d-blurple text-white transition-all duration-200 ease-out hover:rounded-2xl hover:bg-d-blurple-hover"
        >
          <DiscordLogo className="h-7 w-7" />
        </button>
        <Tooltip label="Direct Messages" />
      </div>

      <div className="h-0.5 w-8 rounded-full bg-d-divider" />

      {/* Servers */}
      {servers.map((server) => {
        const active = server.id === activeServerId;
        const initials = server.name
          .split(" ")
          .map((word) => word[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div key={server.id} className="group relative flex w-full items-center justify-center">
            <Pill active={active} />
            <button
              type="button"
              aria-label={server.name}
              onClick={() => onSelectServer(server.id)}
              className={`flex h-12 w-12 items-center justify-center text-[15px] font-medium text-white transition-all duration-200 ease-out ${
                active ? "rounded-2xl" : "rounded-3xl hover:rounded-2xl"
              }`}
              style={{ background: server.color }}
            >
              {server.iconUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={server.iconUrl}
                  alt={server.name}
                  className={`h-full w-full object-cover ${
                    active ? "rounded-2xl" : "rounded-3xl hover:rounded-2xl"
                  } transition-all duration-200 ease-out`}
                />
              ) : (
                initials
              )}
            </button>
            <Tooltip label={server.name} />
          </div>
        );
      })}

      {/* Add a server */}
      <div className="group relative flex w-full items-center justify-center">
        <Pill />
        <button
          type="button"
          aria-label="Add a Server"
          onClick={onAddServer}
          className="flex h-12 w-12 items-center justify-center rounded-3xl bg-d-serverbar text-d-green transition-all duration-200 ease-out hover:rounded-2xl hover:bg-d-green hover:text-white"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
        <Tooltip label="Add a Server" />
      </div>
    </nav>
  );
}
