import { useEffect, useRef } from 'react'
import { notifications } from '@mantine/notifications'
import { loadDocumentFromUrl } from '../fileformat/io/loadDocument'

/**
 * Supports opening a document via `?url=<encoded url>` on page load, e.g. a
 * publicly hosted file or an S3 presigned URL, so a document can be shared as
 * a plain link. Runs once per page load, before any local edits exist.
 */
export function useOpenFromUrlParam(): void {
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    const url = new URLSearchParams(window.location.search).get('url')
    if (!url) return

    notifications.show({
      id: 'open-from-url',
      message: `Opening file from URL...`,
      loading: true,
      autoClose: false,
      withCloseButton: false,
    })

    loadDocumentFromUrl(url)
      .then(() => {
        notifications.update({
          id: 'open-from-url',
          message: 'Opened',
          color: 'green',
          loading: false,
          autoClose: 3000,
          withCloseButton: true,
        })
      })
      .catch((err: unknown) => {
        notifications.update({
          id: 'open-from-url',
          title: 'Could not open file from URL',
          message: err instanceof Error ? err.message : String(err),
          color: 'red',
          loading: false,
          autoClose: false,
          withCloseButton: true,
        })
      })
  }, [])
}
