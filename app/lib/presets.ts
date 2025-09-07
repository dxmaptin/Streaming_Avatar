export type PresetAvatar = { name: string; avatar_id: string };

const parsePresets = (): PresetAvatar[] => {
  try {
    const raw = process.env.NEXT_PUBLIC_PRESET_AVATARS;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) => x && typeof x.name === "string" && typeof x.avatar_id === "string",
    );
  } catch {
    return [];
  }
};

// Use the correct Astrid avatar ID
const ASTRID_AVATAR_ID = "972e0055-4a8a-4ba5-8b77-39bc0dfb6a1c";

export const PRESET_AVATARS: PresetAvatar[] = (() => {
  const envPresets = parsePresets();
  if (envPresets.length > 0) return envPresets;
  return [{ name: "Astrid", avatar_id: ASTRID_AVATAR_ID }];
})();

export const DEFAULT_AVATAR_ID: string = ASTRID_AVATAR_ID;
