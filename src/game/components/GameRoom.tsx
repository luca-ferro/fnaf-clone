import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BACKGROUND_NOISE_SRC,
  BACKGROUND_NOISE_VOLUME,
  CAMERA_UP_SFX_SRC,
  CAMERA_UP_SFX_VOLUME,
  DEBUG_HITBOXES,
  ENABLE_ROOM_CRT_FILTER,
  FISHEYE_RENDER_HEIGHT,
  FISHEYE_RENDER_WIDTH,
  NIGHT_NUMBER,
  ROOM_IMAGE_SRC,
} from '../constants'
import { useFisheyeRoomCanvas } from '../hooks/useFisheyeRoomCanvas'
import { useLoopingSound } from '../hooks/useLoopingSound'
import { useNightClock } from '../hooks/useNightClock'
import { useRoomPan } from '../hooks/useRoomPan'
import { useSoundEffect } from '../hooks/useSoundEffect'
import { CameraPrompt } from './CameraPrompt'
import { CameraSystemScreen } from './CameraSystemScreen'
import { DebugHitboxes } from './DebugHitboxes'
import { GameHud } from './GameHud'

type GameScreen = 'room' | 'cameras'
type CameraTransition = 'idle' | 'entering' | 'exiting'

const CAMERA_STATIC_TRANSITION_MS = 720
const CAMERA_STATIC_SCREEN_SWAP_MS = 260
const CAMERA_SCREEN_TOGGLE_COOLDOWN_MS = CAMERA_STATIC_TRANSITION_MS + 200

export function GameRoom() {
  const [screen, setScreen] = useState<GameScreen>('room')
  const [cameraTransition, setCameraTransition] =
    useState<CameraTransition>('idle')
  const lastScreenToggleAtRef = useRef(Number.NEGATIVE_INFINITY)
  const { timeLabel } = useNightClock()
  const playCameraUpSfx = useSoundEffect({
    src: CAMERA_UP_SFX_SRC,
    volume: CAMERA_UP_SFX_VOLUME,
  })
  const isCameraTransitioning = cameraTransition !== 'idle'

  const canStartCameraTransition = useCallback(() => {
    const now = performance.now()

    if (now - lastScreenToggleAtRef.current < CAMERA_SCREEN_TOGGLE_COOLDOWN_MS) {
      return false
    }

    lastScreenToggleAtRef.current = now
    return true
  }, [])

  const openCameras = useCallback(() => {
    if (!canStartCameraTransition()) {
      return
    }

    setScreen('cameras')
    setCameraTransition('entering')
    playCameraUpSfx()
  }, [canStartCameraTransition, playCameraUpSfx])

  const closeCameras = useCallback(() => {
    if (!canStartCameraTransition()) {
      return
    }

    setCameraTransition('exiting')
    playCameraUpSfx()
  }, [canStartCameraTransition, playCameraUpSfx])

  useEffect(() => {
    if (cameraTransition === 'idle') {
      return undefined
    }

    const timeoutIds = [
      window.setTimeout(() => {
        setCameraTransition('idle')
      }, CAMERA_STATIC_TRANSITION_MS),
    ]

    if (cameraTransition === 'exiting') {
      timeoutIds.push(
        window.setTimeout(() => {
          setScreen('room')
        }, CAMERA_STATIC_SCREEN_SWAP_MS),
      )
    }

    return () => timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
  }, [cameraTransition])

  return (
    <main className="game-shell">
      <section className="game-frame" aria-label="FNAF office">
        <OfficeRoom
          isActive={screen === 'room'}
          time={timeLabel}
          onOpenCameras={openCameras}
        />
        {screen === 'cameras' && (
          <CameraSystemScreen
            isTransitioning={isCameraTransitioning}
            time={timeLabel}
            onCloseCameras={closeCameras}
          />
        )}
        {isCameraTransitioning && (
          <CameraStaticTransition transition={cameraTransition} />
        )}
      </section>
    </main>
  )
}

type CameraStaticTransitionProps = {
  transition: Exclude<CameraTransition, 'idle'>
}

function CameraStaticTransition({ transition }: CameraStaticTransitionProps) {
  return (
    <div
      className={`camera-static-transition camera-static-transition--${transition}`}
      aria-hidden="true"
    >
      <div className="camera-static-transition__grain" />
      <div className="camera-static-transition__bands" />
    </div>
  )
}

type OfficeRoomProps = {
  isActive: boolean
  onOpenCameras: () => void
  time: string
}

function OfficeRoom({ isActive, onOpenCameras, time }: OfficeRoomProps) {
  const { pan, panDirection, stageProps } = useRoomPan()
  useLoopingSound({
    enabled: isActive,
    src: BACKGROUND_NOISE_SRC,
    volume: BACKGROUND_NOISE_VOLUME,
  })
  const { canvasRef, isLoaded } = useFisheyeRoomCanvas({
    imageSrc: ROOM_IMAGE_SRC,
    pan,
  })

  return (
    <div className="office-stage" aria-hidden={!isActive} {...stageProps}>
      <canvas
        ref={canvasRef}
        className={
          ENABLE_ROOM_CRT_FILTER
            ? 'room-canvas room-canvas--filtered'
            : 'room-canvas'
        }
        width={FISHEYE_RENDER_WIDTH}
        height={FISHEYE_RENDER_HEIGHT}
        aria-label="Security office"
      />

      {!isLoaded && <div className="room-loading">LOADING</div>}

      {isActive && <CameraPrompt pan={pan} onOpenCameras={onOpenCameras} />}
      {ENABLE_ROOM_CRT_FILTER && (
        <div className="room-shading" aria-hidden="true" />
      )}
      {ENABLE_ROOM_CRT_FILTER && (
        <div className="room-scanlines" aria-hidden="true" />
      )}
      <GameHud night={NIGHT_NUMBER} time={time} />
      {isActive && DEBUG_HITBOXES && (
        <DebugHitboxes pan={pan} panDirection={panDirection} />
      )}
    </div>
  )
}
