import { cacheLife } from "next/cache";

export async function SiteFooter() {
  "use cache";
  cacheLife("days");

  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto max-w-4xl px-6 py-10 font-sans text-sm text-ink-faint">
        <p>© {new Date().getFullYear()} Veruschka Pestano</p>
      </div>
    </footer>
  );
}
