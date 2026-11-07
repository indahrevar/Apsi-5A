import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { AppRole } from "@/lib/demo-auth";

const cookieName = "dapur-abita-session";
const sessionLifetimeSeconds = 60 * 60 * 12;

export type AppSession = {
  role: AppRole;
  id: string;
  name: string;
  expiresAt: number;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured in production.");
  }

  return "dapur-abita-local-demo-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export async function createSession(session: Omit<AppSession, "expiresAt">) {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = Buffer.from(
    JSON.stringify({ ...session, expiresAt }),
  ).toString("base64url");
  const token = `${payload}.${sign(payload)}`;

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetimeSeconds,
  });
}

export async function clearSession() {
  (await cookies()).delete(cookieName);
}

export async function getSession(): Promise<AppSession | null> {
  const token = (await cookies()).get(cookieName)?.value;

  if (!token) {
    return null;
  }

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) {
    return null;
  }

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AppSession;

    if (
      !session ||
      typeof session.id !== "string" ||
      typeof session.name !== "string" ||
      typeof session.expiresAt !== "number" ||
      !["customer", "admin", "production", "owner"].includes(session.role) ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
