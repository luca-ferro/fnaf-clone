import { useCallback, useEffect, useRef } from 'react'

type UseSoundEffectOptions = {
  src: string
  volume: number
}

export function useSoundEffect({ src, volume }: UseSoundEffectOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(src)
    audio.preload = 'auto'
    audio.volume = volume
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
  }, [src, volume])

  return useCallback(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }, [])
}
