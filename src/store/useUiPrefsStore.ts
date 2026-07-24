import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Local, per-browser UI preferences (panel sizes, toggles, etc.) — distinct
 * from useDocumentStore, which holds the document being edited. Nothing here
 * is ever written into a saved .ond file.
 */
export interface UiPrefsState {
  navbarWidth: number
  setNavbarWidth: (width: number) => void
  snapToGrid: boolean
  setSnapToGrid: (value: boolean) => void
}

export const DEFAULT_NAVBAR_WIDTH = 260
export const MIN_NAVBAR_WIDTH = 200
export const MAX_NAVBAR_WIDTH = 520

export const useUiPrefsStore = create<UiPrefsState>()(
  persist(
    (set) => ({
      navbarWidth: DEFAULT_NAVBAR_WIDTH,
      setNavbarWidth: (width) =>
        set({ navbarWidth: Math.min(MAX_NAVBAR_WIDTH, Math.max(MIN_NAVBAR_WIDTH, width)) }),
      snapToGrid: false,
      setSnapToGrid: (value) => set({ snapToGrid: value }),
    }),
    { name: 'open-network-doc-ui-prefs' },
  ),
)
