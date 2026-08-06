import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { Typography } from '@mantine/core'
import { IconFileText } from '@tabler/icons-react'
import { getAssetUrl } from '../assets-runtime/assetStore'
import { useDocumentStore } from '../store/useDocumentStore'

// Pasted/dropped images resolve to blob: URLs (see assetStore), and links to
// a knowledgebase page use a custom kb:// scheme (see KbLinkPicker). Three
// independent layers would otherwise strip these: rehype-sanitize's default
// schema only allows http/https for `src`/`href` (fixed below via a custom
// schema), and react-markdown's own separate `urlTransform` step has its own
// hardcoded protocol allowlist that doesn't include `blob:`/`kb:` either
// (fixed via `appAwareUrlTransform` below) — both are safe to pass through
// unchanged since we generate/interpret them ourselves, never from untrusted
// input.
const sanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), 'blob'],
    href: [...(defaultSchema.protocols?.href ?? []), 'kb'],
  },
}

function appAwareUrlTransform(url: string): string {
  return url.startsWith('blob:') || url.startsWith('kb://') ? url : defaultUrlTransform(url)
}

const ASSET_URL_PATTERN = /asset:\/\/([a-f0-9-]+)/gi
const KB_URL_PATTERN = /^kb:\/\/([a-f0-9-]+)$/i

function resolveAssetLinks(markdown: string): string {
  return markdown.replace(ASSET_URL_PATTERN, (match, id: string) => getAssetUrl(id) ?? match)
}

/** Renders `kb://<pageId>` links as in-app navigation instead of a dead/external link. */
function AppAwareAnchor({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  const pageId = href ? KB_URL_PATTERN.exec(href)?.[1] : undefined
  const setMode = useDocumentStore((s) => s.setMode)
  const setActiveKbPage = useDocumentStore((s) => s.setActiveKbPage)
  const kbPageExists = useDocumentStore((s) => (pageId ? s.kbPages.some((p) => p.id === pageId) : false))

  if (pageId) {
    return (
      <a
        href="#"
        className="nodrag nopan"
        onClick={(e) => {
          e.preventDefault()
          if (!kbPageExists) return
          setMode('knowledgebase')
          setActiveKbPage(pageId)
        }}
        style={{ opacity: kbPageExists ? 1 : 0.6, cursor: kbPageExists ? 'pointer' : 'not-allowed' }}
        title={kbPageExists ? undefined : 'This knowledgebase page no longer exists'}
        {...rest}
      >
        <IconFileText size={13} style={{ verticalAlign: -2, marginRight: 2 }} />
        {children}
      </a>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="nodrag nopan" {...rest}>
      {children}
    </a>
  )
}

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Typography>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        urlTransform={appAwareUrlTransform}
        components={{ a: AppAwareAnchor }}
      >
        {resolveAssetLinks(content)}
      </ReactMarkdown>
    </Typography>
  )
}
