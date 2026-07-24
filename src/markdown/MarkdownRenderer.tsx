import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { Typography } from '@mantine/core'
import { getAssetUrl } from '../assets-runtime/assetStore'

// Pasted/dropped images resolve to blob: URLs (see assetStore). Two independent
// layers would otherwise strip them: rehype-sanitize's default schema only
// allows http/https for `src` (fixed below via a custom schema), and
// react-markdown's own separate `urlTransform` step has its own hardcoded
// protocol allowlist that doesn't include `blob:` either (fixed via
// `blobAwareUrlTransform` below) — blob: is safe to pass through unchanged
// since we generate these URLs ourselves, never from untrusted input.
const sanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), 'blob'],
  },
}

function blobAwareUrlTransform(url: string): string {
  return url.startsWith('blob:') ? url : defaultUrlTransform(url)
}

const ASSET_URL_PATTERN = /asset:\/\/([a-f0-9-]+)/gi

function resolveAssetLinks(markdown: string): string {
  return markdown.replace(ASSET_URL_PATTERN, (match, id: string) => getAssetUrl(id) ?? match)
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
        urlTransform={blobAwareUrlTransform}
      >
        {resolveAssetLinks(content)}
      </ReactMarkdown>
    </Typography>
  )
}
