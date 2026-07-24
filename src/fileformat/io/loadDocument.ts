import { parseArchiveBytes } from './archiveIO'
import { hydrateDocumentState } from '../../store/documentIO'
import { resetSaveHandle } from './saveDocument'
import { clearAssets } from '../../assets-runtime/assetStore'

async function loadDocumentFromBytes(bytes: Uint8Array): Promise<void> {
  // Clear the previous document's assets before parsing so stale blob URLs
  // don't leak and asset ids from the old document can't collide with the new one.
  clearAssets()
  const state = await parseArchiveBytes(bytes)
  hydrateDocumentState(state)
  resetSaveHandle()
}

export async function loadDocumentFromFile(file: File): Promise<void> {
  await loadDocumentFromBytes(new Uint8Array(await file.arrayBuffer()))
}

/** Fetches a `.ond` file from a URL (e.g. a public link or an S3 presigned URL) and opens it. */
export async function loadDocumentFromUrl(url: string): Promise<void> {
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Only http(s) URLs are supported.')
  }

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    // Almost always a CORS rejection when fetching cross-origin — the remote
    // host (e.g. an S3 bucket) needs to send Access-Control-Allow-Origin for
    // this to work from a page hosted on a different origin.
    throw new Error(
      'Could not fetch the file. If it is hosted elsewhere, that host must allow cross-origin requests (CORS) from this page.',
    )
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch the file: ${response.status} ${response.statusText}`)
  }

  await loadDocumentFromBytes(new Uint8Array(await response.arrayBuffer()))
}
