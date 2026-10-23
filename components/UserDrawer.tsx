import type { Author, Status } from "@/lib/data";
import Avatar from "./Avatar";

type UserDrawerProps = {
  open: boolean;
  members: Author[];
};

const groups: { status: Status; title: string }[] = [
  { status: "online", title: "Online" },
  { status: "offline", title: "Offline" },
];

export default function UserDrawer({ open, members: memberList }: UserDrawerProps) {
  if (!open) return null;

  return (
    <aside className="scrollbar-discord hidden w-60 shrink-0 overflow-y-auto bg-d-sidebar px-2 py-4 lg:block">
      {groups.map((group) => {
        const members = memberList.filter((member) => {
          if (group.status === "offline") return member.status === "offline";
          return member.status !== "offline";
        });

        if (members.length === 0) return null;

        return (
          <section key={group.status} className="mb-2">
            <h2 className="px-2 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-[0.02em] text-d-muted">
              {group.title} — {members.length}
            </h2>
            <ul>
              {members.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded px-2 py-1 text-left transition-colors hover:bg-d-hover"
                  >
                    <Avatar
                      name={member.name}
                      color={member.color}
                      src={member.avatarUrl}
                      status={member.status}
                      size={32}
                      ringClass="ring-d-sidebar"
                    />
                    <span className="min-w-0">
                      <span
                        className="block truncate text-[15px] font-medium"
                        style={{ color: member.roleColor }}
                      >
                        {member.name}
                      </span>
                      <span className="block truncate text-[12px] text-d-muted">
                        {member.role}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </aside>
  );
}
