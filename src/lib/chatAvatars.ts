/** Identidade exibida na thread do chat (avatar via ModelAvatar / novo.png). */

export const ASSISTANT_DISPLAY_NAME = 'DocMind';

export const USER_PROFILE_STORAGE_KEY = 'docmind:user-profile';

export interface UserChatProfile {
  displayName?: string;
  avatarUrl?: string;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Y';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

/** Perfil do usuário (localStorage opcional) para avatar na thread. */
export function getUserChatProfile(): { initials: string; avatarUrl?: string } {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) return { initials: 'Y' };
    const profile = JSON.parse(raw) as UserChatProfile;
    const name = profile.displayName?.trim();
    return {
      initials: name ? initialsFromName(name) : 'Y',
      avatarUrl: profile.avatarUrl?.trim() || undefined,
    };
  } catch {
    return { initials: 'Y' };
  }
}
