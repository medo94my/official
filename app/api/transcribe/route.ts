import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { OpenRouterError, chat, getRoleModel } from '@/lib/openrouter'

/**
 * Voice input for the description fields.
 *
 * Was `/api/whisper` against OpenAI directly. It is not Whisper any more — the
 * models reached through OpenRouter are multimodal chat models that accept audio
 * as a message part, not dedicated transcription endpoints — and a route named
 * after a model it no longer calls is the kind of thing that costs somebody an
 * hour.
 *
 * Admin-only. Two models, either of which may be unset:
 *   MODEL_STT   transcribes the recording
 *   MODEL_TEXT  optionally tightens the transcript into prose
 */
export const dynamic = 'force-dynamic'

/** Roughly 20 MB of audio; several minutes of Opus, far more than a description. */
const MAX_BYTES = 20 * 1024 * 1024

/**
 * The container the browser actually produced.
 *
 * MediaRecorder gives `audio/webm;codecs=opus` on Chrome and Firefox and
 * `audio/mp4` on Safari. Support for these varies by model — OpenAI's
 * `input_audio` documents wav and mp3, while Gemini accepts considerably more —
 * so the real format is passed through and a rejection is surfaced verbatim
 * rather than being retried as a lie about what the bytes are.
 */
function audioFormat(mimeType: string) {
  const base = mimeType.split(';')[0].trim().toLowerCase()
  const known: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/mp4': 'mp4',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/flac': 'flac',
  }
  return known[base] ?? 'webm'
}

const TRANSCRIBE_INSTRUCTION =
  'Transcribe the audio verbatim. Return only the transcription, with no preamble, no commentary and no quotation marks. If the audio contains no speech, return an empty string.'

/**
 * Tightening, not selling.
 *
 * The previous prompt asked for prose that was "compelling" and "engaging",
 * which invites exactly the embellishment the rest of this project refuses — and
 * it runs on dictation about real projects, where an invented superlative
 * becomes a claim on a public page under the owner's name.
 */
const ENHANCE_INSTRUCTION = [
  'You tidy dictated notes into clear prose for a portfolio website.',
  '',
  'Fix grammar, remove filler and false starts, and make it read as written rather than spoken.',
  'Keep the original meaning, scope and tone.',
  'Add no claim, number, outcome, technology or superlative that is not in the transcript.',
  'If the transcript is already clean, return it substantially unchanged.',
  'Return only the rewritten text.',
].join('\n')

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const model = await getRoleModel('stt')
    if (!model) {
      return NextResponse.json(
        {
          error:
            'Voice input is not configured — choose a speech-to-text model in Settings → Models.',
        },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const audio = formData.get('audio')
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }
    if (audio.size === 0) {
      return NextResponse.json({ error: 'The recording was empty.' }, { status: 400 })
    }
    if (audio.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'That recording is too long. Keep it under a few minutes.' },
        { status: 413 }
      )
    }

    const base64 = Buffer.from(await audio.arrayBuffer()).toString('base64')

    const transcription = (
      await chat({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: TRANSCRIBE_INSTRUCTION },
              {
                type: 'input_audio',
                input_audio: { data: base64, format: audioFormat(audio.type) },
              },
            ],
          },
        ],
        maxTokens: 2000,
        // Transcription is not a creative act; drift here is pure loss.
        temperature: 0,
      })
    ).trim()

    if (!transcription) {
      return NextResponse.json(
        { error: 'No speech was detected in that recording.' },
        { status: 422 }
      )
    }

    let final = transcription
    const enhance = formData.get('enhance') === 'true'

    if (enhance) {
      const textModel = await getRoleModel('text')
      // Degrades rather than fails: a transcript the owner can edit is far more
      // use than an error because the optional second step was not configured.
      if (textModel) {
        try {
          final =
            (
              await chat({
                model: textModel,
                messages: [
                  { role: 'system', content: ENHANCE_INSTRUCTION },
                  { role: 'user', content: transcription },
                ],
                maxTokens: 1000,
                temperature: 0.2,
              })
            ).trim() || transcription
        } catch (error) {
          console.error('[transcribe] enhance step failed', error)
        }
      }
    }

    return NextResponse.json(
      { transcription, enhanced: enhance ? final : null, final },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // The only reader is the owner, so the model's own complaint — an
    // unsupported audio format, an empty balance — is more use than a generic
    // failure that sends them guessing.
    if (error instanceof OpenRouterError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[transcribe]', error)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}
