import { auth } from "@/lib/auth";
import { normalizeEmail } from "@/lib/validate";

export const ownerEmail = "veruschkapestano@gmail.com";

export type OwnerAccess =
  | { status: "authorized"; email: string }
  | { status: "unauthenticated" }
  | { status: "forbidden"; email: string };

export function ownerEmails(): string[] {
  const configured = process.env.ADMIN_EMAILS ?? ownerEmail;
  const emails = configured
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email): email is string => Boolean(email));

  return emails.length > 0 ? emails : [ownerEmail];
}

export function isOwnerEmail(email: unknown): email is string {
  const normalized = normalizeEmail(email);
  return Boolean(normalized && ownerEmails().includes(normalized));
}

export async function getOwnerAccess(): Promise<OwnerAccess> {
  const session = await auth();
  const email = normalizeEmail(session?.user?.email);
  if (!email) return { status: "unauthenticated" };
  if (!isOwnerEmail(email)) return { status: "forbidden", email };
  return { status: "authorized", email };
}

export function safeRedirectPath(
  value: FormDataEntryValue | string | string[] | null | undefined,
  fallback = "/studio",
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return fallback;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}
