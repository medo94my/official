import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

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
  } catch (error: any) {
    console.error('Whisper API error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
