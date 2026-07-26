'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { BTN_GHOST } from '@/app/admin/ui'

interface VoiceRecorderProps {
  onTranscription: (text: string) => void
  enhance?: boolean
}

export default function VoiceRecorder({ onTranscription, enhance = true }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('enhance', enhance.toString())

      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const data = await response.json()
      onTranscription(data.final)
      toast.success(enhance ? 'Content enhanced with AI!' : 'Transcription complete!')
    } catch (error) {
      console.error('Error processing audio:', error)
      toast.error('Failed to process audio')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {!isRecording && !isProcessing && (
        <button
          onClick={startRecording}
          // Not a destructive action, so not the danger treatment. The red dot
          // appears once recording is actually live, which is the state worth
          // signalling.
          className={BTN_GHOST}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
          Start Recording
        </button>
      )}

      {isRecording && (
        <button
          onClick={stopRecording}
          className={BTN_GHOST}
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-danger animate-pulse" />
          Stop recording
        </button>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 px-4 py-2 border border-rule text-ink ">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {enhance ? 'Enhancing with AI...' : 'Transcribing...'}
        </div>
      )}
    </div>
  )
}
