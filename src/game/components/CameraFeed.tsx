import type { CameraDefinition } from '../cameraData'
import {
  type CameraFeedLayer,
  useCameraFeedCanvas,
} from '../hooks/useCameraFeedCanvas'

type CameraFeedProps = {
  activePoseLayers: CameraFeedLayer[]
  camera: CameraDefinition
  panCycleStartedAtMs: number
}

export function CameraFeed({
  activePoseLayers,
  camera,
  panCycleStartedAtMs,
}: CameraFeedProps) {
  return (
    <div className="camera-feed" aria-label={`${camera.label} feed`}>
      {camera.hasImage ? (
        <CameraFeedCanvas
          camera={camera}
          layers={activePoseLayers}
          panCycleStartedAtMs={panCycleStartedAtMs}
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
}

function CameraFeedCanvas({
  camera,
  layers,
  panCycleStartedAtMs,
}: CameraFeedCanvasProps) {
  const { canvasRef } = useCameraFeedCanvas({
    baseImageSrc: camera.imageSrc,
    layers,
    panCycleStartedAtMs,
  })

  return (
    <canvas
      ref={canvasRef}
      className="camera-feed__canvas"
      aria-label={`${camera.label} video`}
    />
  )
}
