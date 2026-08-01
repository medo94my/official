/**
 * Fetch wrapper for the dashboard forms.
 *
 * The existing pages call `fetch` and then unconditionally toast "Created!",
 * so a rejected save looked identical to a successful one — you only found out
 * when the row was missing from the list. Now that the API returns real status
 * codes and messages (409 on a duplicate title or slug, 400 with field errors
 * on a bad date), this surfaces them instead of discarding them.
 */

type ApiError = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export class ApiRequestError extends Error {
  fieldErrors?: Record<string, string[]>

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiRequestError'
    this.fieldErrors = fieldErrors
  }
}

export async function apiRequest<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    // A non-JSON body here means the server failed before the handler ran;
    // the status is the only thing worth reporting.
    const body: ApiError = await res.json().catch(() => ({}))

    // Field errors are more useful than the generic message that accompanies
    // them, so lead with the first one.
    const first = body.fieldErrors && Object.entries(body.fieldErrors)[0]
    const message = first
      ? `${first[0]}: ${first[1][0]}`
      : body.error || `Request failed (${res.status})`

    throw new ApiRequestError(message, body.fieldErrors)
  }

  // DELETE handlers return a message body, but callers rarely want it.
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

/** Consistent toast text for a caught error. */
export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}
