import { buildArchiveBytes } from './archiveIO'
import { getDocumentStateSnapshot } from '../../store/documentIO'
import { useDocumentStore } from '../../store/useDocumentStore'

let fileHandle: FileSystemFileHandle | null = null

export function resetSaveHandle(): void {
  fileHandle = null
}

function suggestedFileName(title: string): string {
  const safe = title.trim().replace(/[\\/:*?"<>|]+/g, '_') || 'network-document'
  return `${safe}.ond`
}

function downloadBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export interface SaveResult {
  saved: boolean
  method: 'file-system-access' | 'download'
}

/** Saves the current document. Pass `saveAs: true` to always re-prompt for a location. */
export async function saveDocument(options: { saveAs?: boolean } = {}): Promise<SaveResult> {
  const state = getDocumentStateSnapshot()
  const bytes = await buildArchiveBytes(state)
  const filename = suggestedFileName(state.docTitle)

  if (window.showSaveFilePicker && (options.saveAs || !fileHandle)) {
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'Open Network Doc', accept: { 'application/zip': ['.ond'] } }],
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { saved: false, method: 'file-system-access' }
      }
      throw err
    }
  }

  if (fileHandle) {
    const writable = await fileHandle.createWritable()
    await writable.write(bytes)
    await writable.close()
    useDocumentStore.getState().markClean()
    return { saved: true, method: 'file-system-access' }
  }

  downloadBytes(bytes, filename)
  useDocumentStore.getState().markClean()
  return { saved: true, method: 'download' }
}
