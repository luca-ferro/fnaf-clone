import type { CSSProperties } from 'react'
import type { CameraDefinition } from '../cameraData'
import {
  CAMERA_FEED_BRIGHTNESS,
  CAMERA_FEED_SATURATION,
} from '../constants'
import {
  type CameraFeedLayer,
  useCameraFeedCanvas,
} from '../hooks/useCameraFeedCanvas'

type CameraFeedProps = {
  activePoseLayers: CameraFeedLayer[]
  camera: CameraDefinition
  panCycleStartedAtMs: number
  switchTransitionStartedAtMs: number
}

export function CameraFeed({
  activePoseLayers,
  camera,
  panCycleStartedAtMs,
  switchTransitionStartedAtMs,
}: CameraFeedProps) {
  return (
    <div className="camera-feed" aria-label={`${camera.label} feed`}>
      {camera.hasImage ? (
        <CameraFeedCanvas
          camera={camera}
          layers={activePoseLayers}
          panCycleStartedAtMs={panCycleStartedAtMs}
          switchTransitionStartedAtMs={switchTransitionStartedAtMs}
        />
      ) : (
        <div className="camera-feed__missing">
          <span>{camera.label}</span>
          <strong>NO SIGNAL</strong>
        </div>
      )}
    </div>
  )
}

type CameraFeedCanvasProps = {
  camera: CameraDefinition
  layers: CameraFeedLayer[]
  panCycleStartedAtMs: number
  switchTransitionStartedAtMs: number
}

function CameraFeedCanvas({
  camera,
  layers,
  panCycleStartedAtMs,
  switchTransitionStartedAtMs,
}: CameraFeedCanvasProps) {
  const canvasStyle = {
    '--camera-feed-brightness': camera.brightness ?? CAMERA_FEED_BRIGHTNESS,
    '--camera-feed-saturation': camera.saturation ?? CAMERA_FEED_SATURATION,
  } as CSSProperties

  const { canvasRef } = useCameraFeedCanvas({
    baseImageSrc: camera.imageSrc,
    layers,
    panCycleStartedAtMs,
    switchTransitionStartedAtMs,
  })

  return (
    <canvas
      ref={canvasRef}
      className="camera-feed__canvas"
      style={canvasStyle}
      aria-label={`${camera.label} video`}
    />
  )
}
