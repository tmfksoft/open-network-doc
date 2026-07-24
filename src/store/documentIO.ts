import { useDocumentStore } from './useDocumentStore'
import type { DocumentState } from '../fileformat/types'
import { clearAssets } from '../assets-runtime/assetStore'

export function getDocumentStateSnapshot(): DocumentState {
  const s = useDocumentStore.getState()
  return {
    docId: s.docId,
    docTitle: s.docTitle,
    sheets: s.sheets,
    nodesBySheet: s.nodesBySheet,
    edgesBySheet: s.edgesBySheet,
    kbPages: s.kbPages,
  }
}

export function hydrateDocumentState(state: DocumentState): void {
  useDocumentStore.setState({
    docId: state.docId,
    docTitle: state.docTitle,
    sheets: state.sheets,
    nodesBySheet: state.nodesBySheet,
    edgesBySheet: state.edgesBySheet,
    kbPages: state.kbPages,
    activeSheetId: state.sheets[0]?.id ?? '',
    activeKbPageId: null,
    mode: 'diagram',
    selection: null,
    focusNodeId: null,
    dirty: false,
  })
}

export function createNewDocument(): void {
  clearAssets()
  useDocumentStore.setState({
    docId: crypto.randomUUID(),
    docTitle: 'Untitled Network Document',
    sheets: [],
    nodesBySheet: {},
    edgesBySheet: {},
    kbPages: [],
    activeSheetId: '',
    activeKbPageId: null,
    mode: 'diagram',
    selection: null,
    focusNodeId: null,
    dirty: false,
  })
  const store = useDocumentStore.getState()
  const id = store.addSheet('Overview')
  store.setActiveSheet(id)
  store.markClean()
}
