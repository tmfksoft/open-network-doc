import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate'

export type ArchiveFiles = Record<string, Uint8Array>

export function buildArchive(files: ArchiveFiles): Uint8Array {
  return zipSync(files, { level: 6 })
}

export function readArchive(bytes: Uint8Array): ArchiveFiles {
  return unzipSync(bytes)
}

export function textFile(content: string): Uint8Array {
  return strToU8(content)
}

export function readText(bytes: Uint8Array): string {
  return strFromU8(bytes)
}
