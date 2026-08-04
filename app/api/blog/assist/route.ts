import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { OpenRouterError, chat, getRoleModel } from '@/lib/openrouter'

/**
 * Improves text the owner already wrote.
 *
 * Grounded by construction, unlike the drafter next door: every task here takes
 * the owner's own words as input, so there is nothing for the model to invent —
 * which is why it is worth having even for someone wary of the writer.
 */
export const dynamic = 'force-dynamic'

const TASKS = {
  tighten: {
    system:
      'You edit technical prose. Tighten the text: remove filler and hedging, fix grammar, shorten sentences that run long. Keep the author\'s voice, structure and Markdown formatting. Add no claim, number, technology or example that is not already present. Return only the edited text.',
    maxTokens: 3000,
  },
  summary: {
    system:
      'You write search-result descriptions. Given a blog post, return one or two sentences, under 200 characters, saying what the reader will learn. Draw only on the post. No marketing language, no questions, no ellipsis. Return only the sentence.',
    maxTokens: 200,
  },
  tags: {
    system:
      'You tag technical blog posts. Given a post, return three to six tags as a comma-separated line — real technologies or concepts that genuinely appear in it, capitalised as their ecosystem writes them (TypeScript, PostgreSQL, Next.js). No hashes, no invented topics. Return only the line.',
    maxTokens: 100,
  },
} as const

type TaskName = keyof typeof TASKS

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = (await request.json().catch(() => ({}))) as {
      task?: unknown
      text?: unknown
    }

    const task = body.task as TaskName
    if (!(task in TASKS)) {
      return NextResponse.json(
        { error: `Unknown task. Expected one of: ${Object.keys(TASKS).join(', ')}.` },
        { status: 400 }
      )
    }

    const text = typeof body.text === 'string' ? body.text.trim() : ''
    if (!text) {
      return NextResponse.json({ error: 'There is nothing to work on yet.' }, { status: 400 })
    }

    const model = await getRoleModel('text')
    if (!model) {
      return NextResponse.json(
        { error: 'No text model chosen. Pick one in Settings → Models.' },
        { status: 503 }
      )
    }

    const spec = TASKS[task]
    const result = await chat({
      model,
      messages: [
        { role: 'system', content: spec.system },
        { role: 'user', content: text.slice(0, 40_000) },
      ],
      maxTokens: spec.maxTokens,
      temperature: 0.3,
    })

    return NextResponse.json(
      { result: result.trim() },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof OpenRouterError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[blog-assist]', error)
    return NextResponse.json({ error: 'That did not work.' }, { status: 500 })
  }
}
