type BadgeMeta = {
  label: string;
  glyph: string;
  gradient: string;
};

/**
 * Badge keys stored in `profiles.badges`. Unknown keys still render, using a
 * neutral gradient and the raw key as the label.
 */
const BADGE_META: Record<string, BadgeMeta> = {
  staff: { label: "Discord Staff", glyph: "★", gradient: "from-[#5865f2] to-[#8b5cf6]" },
  partner: { label: "Partnered Server Owner", glyph: "⛨", gradient: "from-[#f23f43] to-[#ff7a45]" },
  verified: { label: "Verified", glyph: "✓", gradient: "from-[#00a8fc] to-[#5865f2]" },
  bug_hunter: { label: "Bug Hunter", glyph: "✹", gradient: "from-[#f0b232] to-[#f7d16b]" },
  developer: { label: "Early Developer", glyph: "◆", gradient: "from-[#23a55a] to-[#3ddc84]" },
  early_supporter: { label: "Early Supporter", glyph: "❤", gradient: "from-[#eb459e] to-[#b45bff]" },
};

type BadgesProps = {
  badges?: string[];
  size?: number;
  className?: string;
};

/** Small animated badge chips that sit next to a username. */
export default function Badges({ badges, size = 14, className = "" }: BadgesProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <span className={`flex shrink-0 items-center gap-0.5 ${className}`}>
      {badges.map((badge, index) => {
        const meta = BADGE_META[badge] ?? {
          label: badge,
          glyph: "★",
          gradient: "from-[#80848e] to-[#a3a6aa]",
        };

        return (
          <span
            key={badge}
            title={meta.label}
            style={{
              width: size,
              height: size,
              fontSize: Math.round(size * 0.62),
              animationDelay: `${index * 140}ms`,
            }}
            className={`flex animate-badge-float items-center justify-center rounded-[4px] bg-gradient-to-br leading-none text-white shadow-sm ${meta.gradient}`}
          >
            {meta.glyph}
          </span>
        );
      })}
    </span>
  );
}
