import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CAMERA_FEED_FISHEYE_STRENGTH,
  CAMERA_FEED_PAN_HOLD_MS,
  CAMERA_FEED_PAN_TRAVEL_MS,
  CAMERA_FEED_RENDER_HEIGHT,
  CAMERA_FEED_RENDER_WIDTH,
  CAMERA_FEED_TV_STATIC_STRENGTH,
  CAMERA_SWITCH_STATIC_DURATION_MS,
  CAMERA_SWITCH_STATIC_STRENGTH,
} from '../constants'
import { createFisheyeMap, renderFisheyeCompositeFrame } from '../rendering/fisheye'

export type CameraFeedLayer = {
  imageSrc: string
  renderOrder: number
}

type UseCameraFeedCanvasOptions = {
  baseImageSrc: string
  layers: CameraFeedLayer[]
  panCycleStartedAtMs: number
  switchTransitionStartedAtMs: number
}

function getCameraPan(elapsedMs: number) {
  const cycleMs = CAMERA_FEED_PAN_TRAVEL_MS * 2 + CAMERA_FEED_PAN_HOLD_MS * 2
  const cycleTime = elapsedMs % cycleMs
  const rightHoldStart = CAMERA_FEED_PAN_TRAVEL_MS
  const leftTravelStart = rightHoldStart + CAMERA_FEED_PAN_HOLD_MS
  const leftHoldStart = leftTravelStart + CAMERA_FEED_PAN_TRAVEL_MS

  if (cycleTime < rightHoldStart) {
    const progress = cycleTime / CAMERA_FEED_PAN_TRAVEL_MS
    return -1 + progress * 2
  }

  if (cycleTime < leftTravelStart) {
    return 1
  }

  if (cycleTime < leftHoldStart) {
    const progress = (cycleTime - leftTravelStart) / CAMERA_FEED_PAN_TRAVEL_MS
    return 1 - progress * 2
  }

  return -1
}

function getCameraSwitchStaticBoost(timestamp: number, transitionStartedAtMs: number) {
  if (transitionStartedAtMs <= 0) {
    return 0
  }

  const elapsedMs = timestamp - transitionStartedAtMs

  if (elapsedMs < 0 || elapsedMs > CAMERA_SWITCH_STATIC_DURATION_MS) {
    return 0
  }

  const progress = elapsedMs / CAMERA_SWITCH_STATIC_DURATION_MS

  return Math.sin(progress * Math.PI) * CAMERA_SWITCH_STATIC_STRENGTH
}

export function useCameraFeedCanvas({
  baseImageSrc,
  layers,
  panCycleStartedAtMs,
  switchTransitionStartedAtMs,
}: UseCameraFeedCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const orderedImageSources = useMemo(
    () => [
      baseImageSrc,
      ...layers
        .slice()
        .sort((layerA, layerB) => layerA.renderOrder - layerB.renderOrder)
        .map((layer) => layer.imageSrc),
    ],
    [baseImageSrc, layers],
  )
  const fisheyeMap = useMemo(
    () =>
      createFisheyeMap(
        CAMERA_FEED_RENDER_WIDTH,
        CAMERA_FEED_RENDER_HEIGHT,
        CAMERA_FEED_FISHEYE_STRENGTH,
      ),
    [],
  )

  useEffect(() => {
    let didCancel = false

    Promise.all(
      orderedImageSources.map(
        (imageSrc) =>
          new Promise<HTMLImageElement>((resolve) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.src = imageSrc
          }),
      ),
    ).then((loadedImages) => {
      if (!didCancel) {
        setImages(loadedImages)
      }
    })

    return () => {
      didCancel = true
    }
  }, [orderedImageSources])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas || images.length === 0) {
      return undefined
    }

    canvas.width = CAMERA_FEED_RENDER_WIDTH
    canvas.height = CAMERA_FEED_RENDER_HEIGHT

    if (!bufferCanvasRef.current) {
      bufferCanvasRef.current = document.createElement('canvas')
    }

    const targetContext = canvas.getContext('2d', { willReadFrequently: true })
    const bufferContext = bufferCanvasRef.current.getContext('2d', {
      willReadFrequently: true,
    })

    if (!targetContext || !bufferContext) {
      return undefined
    }

    let animationFrameId = 0
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      const cossenoChiado = 1
      const switchStaticBoost = getCameraSwitchStaticBoost(
        performance.now(),
        switchTransitionStartedAtMs,
      )

      renderFisheyeCompositeFrame({
        bufferCanvas: bufferCanvasRef.current as HTMLCanvasElement,
        bufferContext,
        images,
        map: fisheyeMap,
        pan: 0,
        targetContext,
        tvStaticFrame: cossenoChiado,
        tvStaticSignal: Math.cos(cossenoChiado) * 0.4 + 0.6,
        tvStaticStrength: CAMERA_FEED_TV_STATIC_STRENGTH + switchStaticBoost,
      })

      return undefined
    }

    let cossenoChiado = 0

    const renderFrame = (timestamp: number) => {
      cossenoChiado += 0.02
      const switchStaticBoost = getCameraSwitchStaticBoost(
        timestamp,
        switchTransitionStartedAtMs,
      )

      renderFisheyeCompositeFrame({
        bufferCanvas: bufferCanvasRef.current as HTMLCanvasElement,
        bufferContext,
        images,
        map: fisheyeMap,
        pan: getCameraPan(timestamp - panCycleStartedAtMs),
        targetContext,
        tvStaticFrame: cossenoChiado,
        tvStaticSignal: Math.cos(cossenoChiado) * 0.4 + 0.6,
        tvStaticStrength: CAMERA_FEED_TV_STATIC_STRENGTH + switchStaticBoost,
      })

      animationFrameId = window.requestAnimationFrame(renderFrame)
    }

    animationFrameId = window.requestAnimationFrame(renderFrame)

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [fisheyeMap, images, panCycleStartedAtMs, switchTransitionStartedAtMs])

  return { canvasRef }
}
