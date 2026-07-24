import type { Manifest } from '../types'
import { CURRENT_FORMAT_VERSION } from '../types'
import { APP_VERSION } from '../appVersion'

export function buildManifest(docId: string): Manifest {
  return {
    formatVersion: CURRENT_FORMAT_VERSION,
    appVersion: APP_VERSION,
    generatedAt: new Date().toISOString(),
    docId,
  }
}

export function parseManifest(bytes: Uint8Array): Manifest {
  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    throw new Error('manifest.json is not valid JSON.')
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Manifest).formatVersion !== 'number'
  ) {
    throw new Error('manifest.json is missing a formatVersion.')
  }
  return parsed as Manifest
}

export function isSupportedFormatVersion(version: number): boolean {
  return version === CURRENT_FORMAT_VERSION
}
