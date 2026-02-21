export function parseEnvArray(raw: string | undefined): string[] {
    if (!raw) return [];
    try {
      if (raw.trim().startsWith("[") && raw.trim().endsWith("]")) {
        return JSON.parse(raw).map(String);
      }
    } catch {}
    return raw.split(",").map(v => v.trim()).filter(Boolean);
  }
  