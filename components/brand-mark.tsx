/**
 * The publication's wordmark. The default name keeps its two-tone setting
 * ("Writing" in ink, "Faith" in italic bronze); a custom name from Site
 * Settings renders whole, with its last word carrying the bronze accent.
 */
export function BrandMark({ name }: { name: string }) {
  if (name === "WritingFaith") {
    return (
      <>
        Writing<span className="italic text-accent">Faith</span>
      </>
    );
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return <>{name}</>;

  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <span className="italic text-accent">{last}</span>
    </>
  );
}
