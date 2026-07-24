import { useEffect } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'

export function useBeforeUnloadWarning(): void {
  const dirty = useDocumentStore((s) => s.dirty)

  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
}
