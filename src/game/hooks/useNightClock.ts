import { useEffect, useMemo, useState } from 'react'
import { NIGHT_DURATION_MS } from '../constants'

const NIGHT_HOUR_COUNT = 6

function formatNightHour(hourIndex: number) {
  if (hourIndex <= 0) {
    return '12:00AM'
  }

  if (hourIndex >= NIGHT_HOUR_COUNT) {
    return '6:00AM'
  }

  return `${hourIndex}:00AM`
}

export function useNightClock(durationMs = NIGHT_DURATION_MS) {
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    const startedAt = performance.now()
    let animationFrame = 0

    const updateClock = () => {
      const nextElapsedMs = Math.min(performance.now() - startedAt, durationMs)
      setElapsedMs(nextElapsedMs)

      if (nextElapsedMs < durationMs) {
        animationFrame = requestAnimationFrame(updateClock)
      }
    }

    animationFrame = requestAnimationFrame(updateClock)

    return () => cancelAnimationFrame(animationFrame)
  }, [durationMs])

  return useMemo(() => {
    const progress = Math.min(elapsedMs / durationMs, 1)
    const hourIndex = Math.min(Math.floor(progress * NIGHT_HOUR_COUNT), NIGHT_HOUR_COUNT)

    return {
      elapsedMs,
      progress,
      timeLabel: formatNightHour(hourIndex),
    }
  }, [durationMs, elapsedMs])
}
