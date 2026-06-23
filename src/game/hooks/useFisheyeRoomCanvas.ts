import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FISHEYE_RENDER_HEIGHT,
  FISHEYE_RENDER_WIDTH,
  FISHEYE_STRENGTH,
} from '../constants'
import { createFisheyeMap, renderFisheyeFrame } from '../rendering/fisheye'

type UseFisheyeRoomCanvasOptions = {
  imageSrc: string
  pan: number
}

export function useFisheyeRoomCanvas({ imageSrc, pan }: UseFisheyeRoomCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const fisheyeMap = useMemo(
    () => createFisheyeMap(FISHEYE_RENDER_WIDTH, FISHEYE_RENDER_HEIGHT, FISHEYE_STRENGTH),
    [],
  )

  useEffect(() => {
    const image = new Image()
    let didCancel = false

    image.onload = () => {
      if (didCancel) {
        return
      }

      imageRef.current = image
      setIsLoaded(true)
    }

    image.src = imageSrc

    return () => {
      didCancel = true
      image.onload = null
    }
  }, [imageSrc])

  useEffect(() => {
    const canvas = canvasRef.current
    const image = imageRef.current

    if (!canvas || !image || !isLoaded) {
      return
    }

    canvas.width = FISHEYE_RENDER_WIDTH
    canvas.height = FISHEYE_RENDER_HEIGHT

    if (!bufferCanvasRef.current) {
      bufferCanvasRef.current = document.createElement('canvas')
    }

    const targetContext = canvas.getContext('2d')
    const bufferContext = bufferCanvasRef.current.getContext('2d', { willReadFrequently: true })

    if (!targetContext || !bufferContext) {
      return
    }

    renderFisheyeFrame({
      bufferCanvas: bufferCanvasRef.current,
      bufferContext,
      image,
      map: fisheyeMap,
      pan,
      targetContext,
    })
  }, [fisheyeMap, isLoaded, pan])

  return { canvasRef, isLoaded }
}
