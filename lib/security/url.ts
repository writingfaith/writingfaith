const allowedExternalProtocols = new Set(["https:", "http:", "mailto:", "tel:"]);

export function safeContentHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!href || /[\u0000-\u001f\u007f]/.test(href)) return null;

  if (href.startsWith("/")) {
    return href.startsWith("//") || href.includes("\\") ? null : href;
  }

  try {
    const url = new URL(href);
    return allowedExternalProtocols.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}
