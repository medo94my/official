/**
 * HTTP status choices that are not obvious.
 *
 * Deliberately dependency-free. This was briefly in `lib/api.ts`, which imports
 * `lib/content.ts` for the cache tag — so a single status-code constant pulled
 * React's `cache()` into anything that referenced it, including the pure modules
 * that are supposed to be testable outside a Next runtime.
 */

/**
 * A third-party API failed, and the explanation has to survive the trip.
 *
 * **Not 502.** This app sits behind Traefik and a Cloudflare Tunnel, and both
 * read an origin 502 as *their own* failure: the JSON body is discarded and
 * replaced with a gateway error page. Every carefully worded "check the token
 * has not expired" then reaches the owner as the string `error code: 502`,
 * which defeats the whole reason these routes write their own messages instead
 * of deferring to `handleApiError`.
 *
 * 424 Failed Dependency says precisely what happened — the request failed
 * because something it depends on failed — and, being a 4xx, proxies pass it
 * through untouched. Confirmed against the deployed site: a 400 body arrives
 * intact, a 502 body does not.
 */
export const UPSTREAM_FAILED = 424
