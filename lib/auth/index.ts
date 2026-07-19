import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "@/lib/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema";
import { emailFrom, getResend } from "@/lib/email";
import { magicLinkEmail } from "@/lib/email/templates";
import { subscribeVerifiedReader } from "@/lib/newsletter/account";
import { normalizeEmail } from "@/lib/validate";

/**
 * Auth.js v5, deliberately isolated behind this module (ADR 0001 §Review):
 * the rest of the app imports only `auth`, `signIn`, `signOut`, `handlers`.
 *
 * - Magic-link email sign-in (passwordless; no password-breach liability)
 *   through Resend with our own on-brand template.
 * - Google OAuth, enabled only when its env vars are present.
 * - Database sessions in Neon via the Drizzle adapter.
 */

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // This app is deployed behind Vercel's trusted host/proxy layer. Setting this
  // explicitly also keeps local production smoke tests from failing with
  // Auth.js UntrustedHost errors when using localhost/127.0.0.1.
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin/check-email",
  },
  providers: [
    Resend({
      from: emailFrom,
      async sendVerificationRequest({ identifier, url }) {
        const { subject, html, text } = magicLinkEmail({ url });
        const { error } = await getResend().emails.send({
          from: emailFrom,
          to: identifier,
          subject,
          html,
          text,
        });
        if (error) {
          throw new Error(`Could not send sign-in email: ${error.message}`);
        }
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            // Both of our providers prove ownership of the email address
            // (magic link by delivery, Google by verified account), so
            // linking a Google sign-in to an existing magic-link user with
            // the same address is safe and avoids a dead-end error.
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    /**
     * A verified sign-in creates one coherent reader identity: account and
     * newsletter subscription, keyed by the proven email address. Best-effort:
     * sign-in must never fail because Resend or newsletter bookkeeping is down.
     */
    async signIn({ user }) {
      const email = normalizeEmail(user.email);
      if (!user.id || !email) return;
      try {
        await subscribeVerifiedReader({ userId: user.id, email });
      } catch (error) {
        console.error("[auth] Failed to synchronize reader subscription:", error);
      }
    },
  },
});

export { googleConfigured };
