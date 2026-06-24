import { useEffect, useMemo, useState } from 'react'
import {
  CAMERA_NOISE_SRC,
  CAMERA_NOISE_VOLUME,
  DEBUG_CAMERA_POSES,
  NIGHT_NUMBER,
} from '../constants'
import {
  CAMERA_BY_ID,
  DEFAULT_CAMERA_ID,
  type AnimatronicId,
  type CameraId,
  type CameraPoseSelections,
} from '../cameraData'
import { useLoopingSound } from '../hooks/useLoopingSound'
import { CameraDebugPanel } from './CameraDebugPanel'
import { CameraFeed } from './CameraFeed'
import { CameraMap } from './CameraMap'
import { GameHud } from './GameHud'

type CameraSystemScreenProps = {
  isTransitioning: boolean
  onCloseCameras: () => void
  time: string
}

export function CameraSystemScreen({
  isTransitioning,
  onCloseCameras,
  time,
}: CameraSystemScreenProps) {
  const [activeCameraId, setActiveCameraId] =
    useState<CameraId>(DEFAULT_CAMERA_ID)
  const [poseSelections, setPoseSelections] = useState<CameraPoseSelections>({})
  const [panCycleStartedAtMs] = useState(() => performance.now())
  const activeCamera = CAMERA_BY_ID[activeCameraId]

  useLoopingSound({
    src: CAMERA_NOISE_SRC,
    volume: CAMERA_NOISE_VOLUME,
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseCameras()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCloseCameras])

  const activePoseLayers = useMemo(() => {
    if (!DEBUG_CAMERA_POSES) {
      return []
    }

    const activeSelections = poseSelections[activeCamera.id] ?? {}

    return (
      activeCamera.animatronics?.flatMap((animatronic) => {
        const selectedPoseId = activeSelections[animatronic.id]
        const selectedPose = animatronic.poses.find(
          (pose) => pose.id === selectedPoseId,
        )

        return selectedPose
          ? [
              {
                imageSrc: selectedPose.imageSrc,
                renderOrder: animatronic.renderOrder,
              },
            ]
          : []
      }) ?? []
    )
  }, [activeCamera, poseSelections])

  const handlePoseSelect = (
    animatronicId: AnimatronicId,
    poseId: string | null,
  ) => {
    setPoseSelections((currentSelections) => {
      const currentCameraSelections = currentSelections[activeCamera.id] ?? {}
      const nextCameraSelections = { ...currentCameraSelections }

      if (poseId) {
        nextCameraSelections[animatronicId] = poseId
      } else {
        delete nextCameraSelections[animatronicId]
      }

      return {
        ...currentSelections,
        [activeCamera.id]: nextCameraSelections,
      }
    })
  }

  return (
    <div className="camera-system-screen" aria-label="Camera system">
      <CameraFeed
        activePoseLayers={activePoseLayers}
        camera={activeCamera}
        panCycleStartedAtMs={panCycleStartedAtMs}
      />
      <div className="camera-feed-frame" aria-hidden="true" />

      <div className="camera-system-screen__label">
        <span>{activeCamera.label}</span>
        <small className="camera-live-status">
          {activeCamera.hasImage && (
            <span className="camera-live-status__dot" aria-hidden="true" />
          )}
          <span>{activeCamera.hasImage ? 'LIVE' : 'NO SIGNAL'}</span>
        </small>
      </div>

      <CameraMap
        activeCameraId={activeCameraId}
        onCameraSelect={setActiveCameraId}
      />

      {DEBUG_CAMERA_POSES && (
        <CameraDebugPanel
          camera={activeCamera}
          onPoseSelect={handlePoseSelect}
          selections={poseSelections}
        />
      )}

      <button
        type="button"
        className="camera-monitor-button camera-monitor-button--close"
        aria-label="Exit camera mode"
        disabled={isTransitioning}
        onFocus={onCloseCameras}
        onPointerEnter={onCloseCameras}
      >
        <span className="camera-monitor-button__chevron" aria-hidden="true" />
        <span className="camera-monitor-button__chevron" aria-hidden="true" />
      </button>

      <GameHud night={NIGHT_NUMBER} time={time} />
    </div>
  )
}
