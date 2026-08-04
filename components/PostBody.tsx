import Markdown from 'react-markdown'
import { markdownComponents, rehypePlugins, remarkPlugins } from '@/components/markdown'

/**
 * Renders a post body on the public site.
 *
 * A server component: react-markdown and its plugins stay on the server, the
 * parse happens inside the page's cache rather than per request, and the
 * browser receives plain HTML with no markdown runtime at all.
 *
 * The configuration — including the deliberate absence of `rehype-raw` — lives
 * in components/markdown.tsx, shared with the admin preview so the two cannot
 * disagree about what a post will look like.
 */
export default function PostBody({ markdown }: { markdown: string }) {
  return (
    <div className="post-body max-w-measure">
      <Markdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
      >
        {markdown}
      </Markdown>
    </div>
  )
}
