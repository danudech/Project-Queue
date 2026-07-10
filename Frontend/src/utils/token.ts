export function isExpired(expUtc?: string | null): boolean {
  if (!expUtc) return true;
  const expMs = Date.parse(expUtc);
  if (!Number.isFinite(expMs)) return true;
  return Date.now() >= expMs;
}
