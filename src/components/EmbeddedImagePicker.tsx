import { useMemo } from 'react'
import { Modal, SimpleGrid, Paper, Image, Text, Stack } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import { getAllAssets, getAssetUrl } from '../assets-runtime/assetStore'
import { collectAssetUsage } from '../utils/assetUsage'

interface EmbeddedImagePickerProps {
  opened: boolean
  onClose: () => void
  onSelect: (assetId: string) => void
}

/** Lets a logo/icon field reuse an image already embedded elsewhere in the document, instead of only uploading a new one. */
export default function EmbeddedImagePicker({ opened, onClose, onSelect }: EmbeddedImagePickerProps) {
  const nodesBySheet = useDocumentStore((s) => s.nodesBySheet)
  const edgesBySheet = useDocumentStore((s) => s.edgesBySheet)
  const kbPages = useDocumentStore((s) => s.kbPages)

  const images = useMemo(() => {
    const usage = collectAssetUsage(nodesBySheet, edgesBySheet, kbPages)
    const assets = getAllAssets()
    const result: { id: string; url: string; labels: string[] }[] = []
    for (const [id, labels] of usage) {
      const url = getAssetUrl(id)
      if (!assets.has(id) || !url) continue
      result.push({ id, url, labels })
    }
    return result
  }, [nodesBySheet, edgesBySheet, kbPages])

  return (
    <Modal opened={opened} onClose={onClose} title="Choose an embedded image" size="lg">
      {images.length === 0 ? (
        <Text size="sm" c="dimmed">
          No images are embedded in this document yet — upload one instead.
        </Text>
      ) : (
        <SimpleGrid cols={4} spacing="sm">
          {images.map((image) => (
            <Paper
              key={image.id}
              withBorder
              p="xs"
              radius="sm"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                onSelect(image.id)
                onClose()
              }}
            >
              <Stack gap={4}>
                <Image
                  src={image.url}
                  alt=""
                  h={70}
                  fit="contain"
                  radius="sm"
                  style={{ background: 'var(--mantine-color-dark-6)' }}
                />
                <Text size="xs" c="dimmed" lineClamp={1} title={image.labels.join(', ')}>
                  {image.labels[0]}
                </Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      )}
    </Modal>
  )
}
