import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { PAN_HITBOX_WIDTH_PERCENT, PAN_SPEED_PER_SECOND } from '../constants'

type PanDirection = -1 | 0 | 1

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function useRoomPan() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const panDirectionRef = useRef<PanDirection>(0)
  const lastFrameTimeRef = useRef<number | null>(null)
  const [pan, setPan] = useState(0)
  const [panDirection, setPanDirection] = useState<PanDirection>(0)

  const setActivePanDirection = useCallback((nextDirection: PanDirection) => {
    if (panDirectionRef.current === nextDirection) {
      return
    }

    panDirectionRef.current = nextDirection
    setPanDirection(nextDirection)
  }, [])

  useEffect(() => {
    let animationFrame = 0

    const updatePan = (timestamp: number) => {
      const previousTimestamp = lastFrameTimeRef.current ?? timestamp
      const deltaSeconds = (timestamp - previousTimestamp) / 1000
      lastFrameTimeRef.current = timestamp

      if (panDirectionRef.current !== 0) {
        setPan((currentPan) =>
          clamp(
            currentPan + panDirectionRef.current * PAN_SPEED_PER_SECOND * deltaSeconds,
            -1,
            1,
          ),
        )
      }

      animationFrame = requestAnimationFrame(updatePan)
    }

    animationFrame = requestAnimationFrame(updatePan)

    return () => cancelAnimationFrame(animationFrame)
  }, [])

  const updateDirectionFromPointer = useCallback(
    (clientX: number) => {
      const stage = stageRef.current

      if (!stage) {
        return
      }

      const rect = stage.getBoundingClientRect()
      const relativeX = clamp(clientX - rect.left, 0, rect.width)
      const hitboxWidth = rect.width * (PAN_HITBOX_WIDTH_PERCENT / 100)

      if (relativeX <= hitboxWidth) {
        setActivePanDirection(-1)
        return
      }

      if (relativeX >= rect.width - hitboxWidth) {
        setActivePanDirection(1)
        return
      }

      setActivePanDirection(0)
    },
    [setActivePanDirection],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      updateDirectionFromPointer(event.clientX)
    },
    [updateDirectionFromPointer],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      updateDirectionFromPointer(event.clientX)
    },
    [updateDirectionFromPointer],
  )

  const handlePointerLeave = useCallback(() => {
    setActivePanDirection(0)
  }, [setActivePanDirection])

  return {
    pan,
    panDirection,
    stageProps: {
      ref: stageRef,
      onPointerDown: handlePointerDown,
      onPointerLeave: handlePointerLeave,
      onPointerMove: handlePointerMove,
    },
  }
}
