import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import OpenAI from 'openai'

// Constructed per request rather than at module scope: the OpenAI client throws
// when the key is missing, which would fail `next build` on every deploy that
// doesn't use the optional voice feature.
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const openai = getOpenAI()
    if (!openai) {
      return NextResponse.json(
        { error: 'Voice input is not configured — OPENAI_API_KEY is unset.' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const enhanceContent = formData.get('enhance') === 'true'

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Convert File to format OpenAI expects
    const buffer = await audioFile.arrayBuffer()
    const blob = new Blob([buffer], { type: audioFile.type })
    const file = new File([blob], audioFile.name, { type: audioFile.type })

    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
    })

    let result = transcription.text

    // Optionally enhance the transcription with GPT-4
    if (enhanceContent) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional portfolio content writer.
            Take the user's voice transcription about their project or skill and enhance it to sound professional and compelling.
            Keep the core information but make it concise, engaging, and suitable for a portfolio website.
            Format it as a clear description without extra commentary.`,
          },
          {
            role: 'user',
            content: result,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      result = completion.choices[0]?.message?.content || result
    }

    return NextResponse.json({
      transcription: transcription.text,
      enhanced: enhanceContent ? result : null,
      final: result,
    })
  } catch (error) {
    // Not handleApiError: an OpenAI failure message is useful to the one
    // authenticated person who sees it, and this route is admin-only.
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Whisper API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
