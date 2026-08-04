import type { Components } from 'react-markdown'
import type { PluggableList } from 'unified'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

/**
 * One markdown configuration, shared by the public page and the admin preview.
 *
 * Extracted rather than duplicated because the preview's entire promise is that
 * what you see is what publishes. Two copies of this would drift — the first
 * time someone added a plugin to one of them, the preview would start lying,
 * and it would lie quietly.
 *
 * **`rehype-raw` is absent, and must stay absent.** Without it, `<script>` in a
 * body renders as text rather than markup. That matters more here than anywhere
 * else in this codebase because a body can be written by a language model, so
 * what is being rendered is not always something a person read first. Adding it
 * to "support a bit of HTML" turns every post into stored XSS against the admin
 * session.
 */

export const remarkPlugins: PluggableList = [remarkGfm]

export const rehypePlugins: PluggableList = [
  [rehypeHighlight, { detect: true, ignoreMissing: true }],
]

/**
 * Link schemes allowed to survive.
 *
 * react-markdown ships a URL sanitiser, but it is described in terms of its
 * default schemes rather than promised, and `[click](javascript:alert(1))` is
 * exactly what a model might produce from a badly worded prompt. Being explicit
 * costs four lines and removes the need to trust a default.
 */
export function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined
  const value = href.trim()
  // Relative, anchor and same-page links are fine.
  if (/^(\/|#|\.{1,2}\/)/.test(value)) return value
  return /^(https?:|mailto:|tel:)/i.test(value) ? value : undefined
}

export const markdownComponents: Components = {
  a: ({ href, children, ...rest }) => {
    const safe = safeHref(href)
    // A refused scheme renders as plain text rather than vanishing — dropping
    // the words would leave a hole in the middle of a sentence.
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
  // Markdown images bypass the upload validation entirely and could hotlink
  // anything. Covers are an uploaded field with alt text, which is the
  // supported path.
  img: () => null,
}
