import type { Metadata } from 'next'

/**
 * Metadata for the whole admin area.
 *
 * Two things the login page could not set for itself: it is a client component,
 * so it cannot export `metadata`, and it was inheriting the site's public title
 * — a page called "Ahmet Yilmaz — Full-Stack Developer" that is actually a login
 * form is confusing in a tab strip and in browser history.
 *
 * `noindex, nofollow` on top of the robots.txt disallow. robots.txt is a request
 * a crawler may ignore and only stops fetching, not indexing — a disallowed URL
 * can still appear in results from inbound links alone. A meta directive is
 * followed far more consistently, and a login form in search results is a small
 * standing invitation to credential stuffing.
 *
 * This layout renders nothing itself; the dashboard's own client layout supplies
 * the chrome.
 */
export const metadata: Metadata = {
  title: 'Portfolio CMS',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
