import "server-only";

import type { account_role } from "@/app/generated/prisma/enums";
import { apiError, getCurrentUser, type AuthUser } from "@/lib/auth";

export async function authorizeApi(...roles: account_role[]) {
  const user = await getCurrentUser();
  if (!user) return { user: null, response: apiError("Silakan masuk terlebih dahulu.", 401) };
  if (!roles.includes(user.role)) {
    return { user: null, response: apiError("Anda tidak memiliki izin untuk tindakan ini.", 403) };
  }
  return { user: user as AuthUser, response: null };
}

export function validId(value: string) {
  return /^[A-Za-z0-9-]{1,10}$/.test(value);
}
