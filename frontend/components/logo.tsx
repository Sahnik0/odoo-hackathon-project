// Dotted-circle mark (DESIGN.md "Logo Strip" / nav wordmark reference) — a ring
// of small dots plus a denser cluster in the center, rendered as inline SVG so
// it inherits currentColor and needs no image asset.
export function DottedMark({ size = 28, className }: { size?: number; className?: string }) {
  const r = size / 2;
  const ringDots = 12;
  const dots: { cx: number; cy: number; radius: number }[] = [];

  for (let i = 0; i < ringDots; i++) {
    const angle = (i / ringDots) * Math.PI * 2;
    dots.push({ cx: r + Math.cos(angle) * (r - 2), cy: r + Math.sin(angle) * (r - 2), radius: 1.4 });
  }
  // Sparse inner cluster.
  const inner = [
    [r, r],
    [r - 4, r - 3],
    [r + 4, r + 2],
    [r - 2, r + 4],
    [r + 3, r - 4],
  ];
  for (const [cx, cy] of inner) dots.push({ cx, cy, radius: 1.2 });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.radius} fill="currentColor" />
      ))}
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-off-black ${className ?? ''}`}>
      <DottedMark size={24} />
      <span className="font-serif text-[24px] leading-none">hrms</span>
    </span>
  );
}
