'use client'

import Markdown from 'react-markdown'
import { markdownComponents, rehypePlugins, remarkPlugins } from '@/components/markdown'

/**
 * The admin's preview of a post body.
 *
 * Renders through exactly the same plugins and component overrides as the
 * public page — which is the whole point. The previous version showed raw
 * Markdown in a `<pre>`, so it told you your asterisks were where you left
 * them and nothing about what would actually publish.
 *
 * A client component, because the editor's textarea is client state and a
 * server component cannot re-render on every keystroke. The cost is that the
 * markdown parser is client code here, which is why the admin page loads this
 * through `next/dynamic` — the chunk is fetched the first time Preview is
 * pressed and never on a page that does not use it.
 *
 * `post-body` is the same class the public page uses, so the type scale, the
 * code blocks and both themes are identical rather than merely similar.
 */
export default function MarkdownPreview({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return <p className="text-meta text-foreground-muted">Nothing to preview yet.</p>
  }

  return (
    <div className="max-h-[28rem] overflow-y-auto border border-border bg-background p-4">
      <div className="post-body max-w-measure">
        <Markdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={markdownComponents}
        >
          {markdown}
        </Markdown>
      </div>
    </div>
  )
}
