/**
 * Module-level (outside-React) registry mapping an asset id to its live blob
 * URL and raw bytes for the current document session. Images pasted/dropped
 * into a markdown editor are registered here immediately for instant preview;
 * the raw bytes are only written into the archive's /assets/images/ on save.
 */

interface AssetEntry {
  blob: Blob
  url: string
}

const assets = new Map<string, AssetEntry>()

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

export function extensionForMime(mime: string): string {
  return EXTENSION_BY_MIME[mime] ?? 'bin'
}

export function registerAsset(blob: Blob, id: string = crypto.randomUUID()): string {
  const existing = assets.get(id)
  if (existing) URL.revokeObjectURL(existing.url)
  assets.set(id, { blob, url: URL.createObjectURL(blob) })
  return id
}

export function getAssetUrl(id: string): string | undefined {
  return assets.get(id)?.url
}

export function getAllAssets(): Map<string, Blob> {
  const result = new Map<string, Blob>()
  for (const [id, entry] of assets) result.set(id, entry.blob)
  return result
}

/** Clears all registered assets (revoking their blob URLs) — call on New/Open. */
export function clearAssets(): void {
  for (const entry of assets.values()) URL.revokeObjectURL(entry.url)
  assets.clear()
}
