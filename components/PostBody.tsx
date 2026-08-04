import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

/**
 * Renders a post body from Markdown.
 *
 * **Raw HTML is not enabled, and that is the point.** `rehype-raw` is
 * deliberately not installed: without it, `<script>alert(1)</script>` in a body
 * is text, not markup. That matters more here than anywhere else in this
 * codebase, because a body can be written by a language model rather than by a
 * person — so the thing being rendered is not always something a human read
 * first. Do not add `rehype-raw` to "support a bit of HTML"; it turns every
 * post into a stored-XSS vector against the admin session.
 *
 * A server component. All three libraries stay on the server, the parse happens
 * inside the page's cache rather than per request, and the browser is sent plain
 * HTML with no markdown runtime at all.
 */

/**
 * Link schemes that are allowed to survive.
 *
 * react-markdown ships a URL sanitiser, but it is stated in terms of its default
 * schemes rather than a promise, and `[click](javascript:alert(1))` is exactly
 * what a model might produce from a badly-worded prompt. Being explicit costs
 * four lines and removes the need to trust a default.
 */
function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined
  const value = href.trim()
  // Relative, anchor and protocol-relative links are fine.
  if (/^(\/|#|\.{1,2}\/)/.test(value)) return value
  return /^(https?:|mailto:|tel:)/i.test(value) ? value : undefined
}

export default function PostBody({ markdown }: { markdown: string }) {
  return (
    <div className="post-body max-w-measure">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          a: ({ href, children, ...rest }) => {
            const safe = safeHref(href)
            // A refused scheme renders as plain text rather than disappearing —
            // silently dropping the words would leave a sentence with a hole.
            if (!safe) return <>{children}</>
            const external = /^https?:/i.test(safe)
            return (
              <a
                href={safe}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...rest}
              >
                {children}
              </a>
            )
          },
          // Markdown images would bypass the upload validation entirely and
          // could hotlink anything, so they are not rendered. Covers are
          // uploaded fields with alt text, which is the supported path.
          img: () => null,
        }}
      >
        {markdown}
      </Markdown>
    </div>
  )
}
