import type { Status } from "@/lib/data";

const statusColor: Record<Status, string> = {
  online: "bg-d-green",
  idle: "bg-d-yellow",
  dnd: "bg-d-red",
  offline: "bg-[#80848e]",
};

type AvatarProps = {
  name: string;
  color: string;
  src?: string | null;
  size?: number;
  status?: Status;
  ringClass?: string;
  className?: string;
};

export default function Avatar({
  name,
  color,
  src,
  size = 40,
  status,
  ringClass = "ring-d-sidebar",
  className = "",
}: AvatarProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={name}
          className="h-full w-full select-none rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full select-none items-center justify-center rounded-full font-medium text-white"
          style={{ background: color, fontSize: Math.round(size * 0.4) }}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-[3px] ${ringClass} ${statusColor[status]}`}
          style={{ width: size * 0.32, height: size * 0.32 }}
        />
      )}
    </div>
  );
}
