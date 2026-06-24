import {
  CAMERA_DEFINITIONS,
  CAMERA_MAP_IMAGE_SRC,
  type CameraDefinition,
  type CameraId,
} from '../cameraData'

type CameraMapProps = {
  activeCameraId: CameraId
  onCameraSelect: (cameraId: CameraId) => void
}

export function CameraMap({ activeCameraId, onCameraSelect }: CameraMapProps) {
  return (
    <nav className="camera-map" aria-label="Camera map">
      <div className="camera-map__layout">
        <img
          className="camera-map__base"
          draggable="false"
          src={CAMERA_MAP_IMAGE_SRC}
          alt=""
        />
        {CAMERA_DEFINITIONS.map((camera) => (
          <CameraMapButton
            key={camera.id}
            camera={camera}
            isActive={camera.id === activeCameraId}
            onCameraSelect={onCameraSelect}
          />
        ))}
      </div>
    </nav>
  )
}

type CameraMapButtonProps = {
  camera: CameraDefinition
  isActive: boolean
  onCameraSelect: (cameraId: CameraId) => void
}

function CameraMapButton({
  camera,
  isActive,
  onCameraSelect,
}: CameraMapButtonProps) {
  return (
    <button
      type="button"
      className="camera-map__button"
      aria-pressed={isActive}
      aria-label={camera.label}
      onClick={() => onCameraSelect(camera.id)}
      style={{
        left: `${camera.mapButton.leftPercent}%`,
        top: `${camera.mapButton.topPercent}%`,
        width: `${camera.mapButton.widthPercent}%`,
      }}
    >
      <img
        draggable="false"
        src={isActive ? camera.mapButton.pressedSrc : camera.mapButton.defaultSrc}
        alt=""
      />
    </button>
  )
}
