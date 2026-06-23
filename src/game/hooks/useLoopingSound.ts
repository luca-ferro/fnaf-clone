import { useEffect } from 'react'

const AUDIO_UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

type UseLoopingSoundOptions = {
  enabled?: boolean
  src: string
  volume: number
}

export function useLoopingSound({ enabled = true, src, volume }: UseLoopingSoundOptions) {
  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const audio = new Audio(src)
    let isMounted = true
    let needsUserGesture = false

    audio.loop = true
    audio.preload = 'auto'
    audio.volume = volume

    const removeUnlockListeners = () => {
      AUDIO_UNLOCK_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resumePlayback)
      })
    }

    const requestUnlock = () => {
      if (needsUserGesture) {
        return
      }

      needsUserGesture = true
      AUDIO_UNLOCK_EVENTS.forEach((eventName) => {
        window.addEventListener(eventName, resumePlayback, { passive: true })
      })
    }

    const startPlayback = () => {
      audio.play().then(removeUnlockListeners).catch(requestUnlock)
    }

    const resumePlayback = () => {
      if (!isMounted) {
        return
      }

      startPlayback()
    }

    startPlayback()

    return () => {
      isMounted = false
      removeUnlockListeners()
      audio.pause()
      audio.currentTime = 0
    }
  }, [enabled, src, volume])
}
