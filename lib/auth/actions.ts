"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { normalizeEmail } from "@/lib/validate";

export interface SignInState {
  error?: string;
}

async function clientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

/** Magic-link sign-in: validate, rate limit, then hand off to Auth.js. */
export async function signInWithEmail(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = normalizeEmail(formData.get("email"));
  if (!email) {
    return { error: "Please enter a valid email address." };
  }

  const ip = await clientIp();
  const [ipAllowed, emailAllowed] = await Promise.all([
    allowRequest(`signin:ip:${ip}`),
    allowRequest(`signin:email:${email}`),
  ]);
  if (!ipAllowed || !emailAllowed) {
    return {
      error: "Too many sign-in attempts. Please try again in a little while.",
    };
  }

  try {
    await signIn("resend", { email, redirectTo: "/account" });
    return {};
  } catch (error) {
    // signIn signals success by throwing a redirect — let it through.
    if (error instanceof AuthError) {
      return {
        error: "We couldn’t send the sign-in email. Please try again.",
      };
    }
    throw error;
  }
}

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
