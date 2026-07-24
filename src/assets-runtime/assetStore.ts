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

const MIME_BY_EXTENSION: Record<string, string> = Object.fromEntries(
  Object.entries(EXTENSION_BY_MIME).map(([mime, ext]) => [ext, mime]),
)

export function extensionForMime(mime: string): string {
  return EXTENSION_BY_MIME[mime] ?? 'bin'
}

/**
 * Reverses extensionForMime. The archive only stores an asset's original MIME
 * type via its file extension (no separate metadata table) — used to restore
 * a real `type` on the Blob rebuilt from a re-opened .ond's raw bytes, since
 * an untyped Blob still fails to render as an <img> for formats like SVG that
 * browsers won't content-sniff the way they do PNG/JPEG.
 */
export function mimeForExtension(ext: string): string {
  return MIME_BY_EXTENSION[ext] ?? 'application/octet-stream'
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

/**
 * Drops (and revokes) any registered asset not in `keepIds` — called on save
 * with every asset id still actually referenced by the document, so assets
 * left behind by e.g. uploading a replacement logo don't linger in memory or
 * get re-embedded into the archive forever.
 */
export function pruneAssets(keepIds: ReadonlySet<string>): void {
  for (const [id, entry] of assets) {
    if (keepIds.has(id)) continue
    URL.revokeObjectURL(entry.url)
    assets.delete(id)
  }
}
