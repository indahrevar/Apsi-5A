import "server-only";

import { getCurrentUser, type AuthUser } from "@/lib/auth";

function apiError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function authorizeApi(...roles: AuthUser["role"][]) {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: apiError("Silakan masuk terlebih dahulu.", 401) };
  }
  if (!roles.includes(user.role)) {
    return { user: null, response: apiError("Anda tidak memiliki izin untuk tindakan ini.", 403) };
  }
  return { user, response: null };
}

export function validId(value: string) {
  return /^[A-Za-z0-9-]{1,10}$/.test(value);
}
