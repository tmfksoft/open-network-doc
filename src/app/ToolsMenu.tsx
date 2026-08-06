import { useMemo, useState } from 'react'
import { Menu, Button, Modal, SimpleGrid, Paper, Image, Text, ActionIcon, Stack, Group } from '@mantine/core'
import { IconChevronDown, IconPhoto, IconDownload } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import { getAllAssets, getAssetUrl, extensionForMime } from '../assets-runtime/assetStore'
import { collectAssetUsage } from '../utils/assetUsage'

interface EmbeddedImage {
  id: string
  url: string
  ext: string
  labels: string[]
}

function suggestedFilename(image: EmbeddedImage): string {
  const base = image.labels[0]
    ?.replace(/"/g, '')
    .replace(/[\\/:*?<>|]+/g, '_')
    .trim()
  return `${base || image.id}.${image.ext}`
}

function downloadImage(image: EmbeddedImage): void {
  const a = document.createElement('a')
  a.href = image.url
  a.download = suggestedFilename(image)
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export default function ToolsMenu() {
  const [opened, setOpened] = useState(false)
  const nodesBySheet = useDocumentStore((s) => s.nodesBySheet)
  const edgesBySheet = useDocumentStore((s) => s.edgesBySheet)
  const kbPages = useDocumentStore((s) => s.kbPages)

  const images = useMemo<EmbeddedImage[]>(() => {
    const usage = collectAssetUsage(nodesBySheet, edgesBySheet, kbPages)
    const assets = getAllAssets()
    const result: EmbeddedImage[] = []
    for (const [id, labels] of usage) {
      const blob = assets.get(id)
      const url = getAssetUrl(id)
      if (!blob || !url) continue
      result.push({ id, url, ext: extensionForMime(blob.type), labels })
    }
    return result
  }, [nodesBySheet, edgesBySheet, kbPages])

  return (
    <>
      <Menu shadow="md" width={220}>
        <Menu.Target>
          <Button variant="subtle" size="xs" rightSection={<IconChevronDown size={14} />}>
            Tools
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconPhoto size={14} />} onClick={() => setOpened(true)}>
            View embedded images
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Embedded images" size="lg">
        {images.length === 0 ? (
          <Text size="sm" c="dimmed">
            No images are currently embedded in this document.
          </Text>
        ) : (
          <SimpleGrid cols={3} spacing="sm">
            {images.map((image) => (
              <Paper key={image.id} withBorder p="xs" radius="sm">
                <Stack gap={6}>
                  <Image
                    src={image.url}
                    alt=""
                    h={100}
                    fit="contain"
                    radius="sm"
                    style={{ background: 'var(--mantine-color-dark-6)' }}
                  />
                  <Text size="xs" c="dimmed" lineClamp={2} title={image.labels.join(', ')}>
                    {image.labels.join(', ')}
                  </Text>
                  <Group justify="space-between" wrap="nowrap" gap={4}>
                    <Text size="xs" c="dimmed" tt="uppercase">
                      {image.ext}
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      aria-label="Download image"
                      onClick={() => downloadImage(image)}
                    >
                      <IconDownload size={14} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Modal>
    </>
  )
}
