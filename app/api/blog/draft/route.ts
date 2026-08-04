import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { OpenRouterError, chatJson, getRoleModel } from '@/lib/openrouter'
import { buildPostPrompt, parsePostDraft, type PostLength } from '@/lib/blog-writer'

/**
 * Drafts a post from a topic.
 *
 * **Read-only.** It writes nothing — the draft goes back to the form, and the
 * owner saves it through the normal create route, which is what keeps the
 * review step and the 409 handling in one place.
 *
 * This sits beside `[id]/route.ts`. A static segment beats a dynamic one in the
 * App Router, so `/api/blog/draft` resolves here and never reaches the
 * per-post handler; ids are cuids, so no real post can be shadowed.
 */
export const dynamic = 'force-dynamic'

const LENGTHS = new Set<PostLength>(['short', 'standard', 'deep'])

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = (await request.json().catch(() => ({}))) as {
      topic?: unknown
      length?: unknown
    }

    const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
    if (topic.length < 8) {
      return NextResponse.json(
        { error: 'Give it more to work with — a sentence describing the post, not a single word.' },
        { status: 400 }
      )
    }
    if (topic.length > 500) {
      return NextResponse.json({ error: 'That topic is too long.' }, { status: 400 })
    }

    const model = await getRoleModel('text')
    if (!model) {
      return NextResponse.json(
        { error: 'No text model chosen. Pick one in Settings → Models.' },
        { status: 503 }
      )
    }

    const length = LENGTHS.has(body.length as PostLength)
      ? (body.length as PostLength)
      : 'standard'
    const { system, user } = buildPostPrompt(topic, length)

    const raw = await chatJson<unknown>({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      maxTokens: 4000,
      // Higher than the case-study drafter's 0.2: that one summarises supplied
      // text, where creativity is the failure mode. This one is composing
      // prose, where 0.2 reads mechanical.
      temperature: 0.6,
      timeoutMs: 120_000,
    })

    const draft = parsePostDraft(raw)
    if (!draft) {
      return NextResponse.json(
        { error: 'The model did not return a usable post. Try again, or a different model.' },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { ...draft, model },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof OpenRouterError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[blog-draft]', error)
    return NextResponse.json({ error: 'Could not draft that post.' }, { status: 500 })
  }
}
