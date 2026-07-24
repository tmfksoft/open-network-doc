import { parseArchiveBytes } from './archiveIO'
import { hydrateDocumentState } from '../../store/documentIO'
import { resetSaveHandle } from './saveDocument'
import { clearAssets } from '../../assets-runtime/assetStore'

export async function loadDocumentFromFile(file: File): Promise<void> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  // Clear the previous document's assets before parsing so stale blob URLs
  // don't leak and asset ids from the old document can't collide with the new one.
  clearAssets()
  const state = await parseArchiveBytes(bytes)
  hydrateDocumentState(state)
  resetSaveHandle()
}
