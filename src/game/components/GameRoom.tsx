import { useCallback, useRef, useState } from 'react'
import {
  BACKGROUND_NOISE_SRC,
  BACKGROUND_NOISE_VOLUME,
  DEBUG_HITBOXES,
  FISHEYE_RENDER_HEIGHT,
  FISHEYE_RENDER_WIDTH,
  NIGHT_NUMBER,
  ROOM_IMAGE_SRC,
} from '../constants'
import { useFisheyeRoomCanvas } from '../hooks/useFisheyeRoomCanvas'
import { useLoopingSound } from '../hooks/useLoopingSound'
import { useNightClock } from '../hooks/useNightClock'
import { useRoomPan } from '../hooks/useRoomPan'
import { CameraPrompt } from './CameraPrompt'
import { CameraTodoScreen } from './CameraTodoScreen'
import { DebugHitboxes } from './DebugHitboxes'
import { GameHud } from './GameHud'

type GameScreen = 'room' | 'cameras'
const CAMERA_SCREEN_TOGGLE_COOLDOWN_MS = 350

export function GameRoom() {
  const [screen, setScreen] = useState<GameScreen>('room')
  const lastScreenToggleAtRef = useRef(Number.NEGATIVE_INFINITY)
  const { timeLabel } = useNightClock()

  const setCameraScreen = useCallback((nextScreen: GameScreen) => {
    const now = performance.now()

    if (now - lastScreenToggleAtRef.current < CAMERA_SCREEN_TOGGLE_COOLDOWN_MS) {
      return
    }

    lastScreenToggleAtRef.current = now
    setScreen(nextScreen)
  }, [])

  const openCameras = useCallback(() => setCameraScreen('cameras'), [setCameraScreen])
  const closeCameras = useCallback(() => setCameraScreen('room'), [setCameraScreen])

  return (
    <main className="game-shell">
      <section className="game-frame" aria-label="FNAF office">
        <OfficeRoom
          isActive={screen === 'room'}
          time={timeLabel}
          onOpenCameras={openCameras}
        />
        {screen === 'cameras' && (
          <CameraTodoScreen time={timeLabel} onCloseCameras={closeCameras} />
        )}
      </section>
    </main>
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
        className="room-canvas"
        width={FISHEYE_RENDER_WIDTH}
        height={FISHEYE_RENDER_HEIGHT}
        aria-label="Security office"
      />

      {!isLoaded && <div className="room-loading">LOADING</div>}

      {isActive && <CameraPrompt pan={pan} onOpenCameras={onOpenCameras} />}
      <div className="room-shading" aria-hidden="true" />
      <div className="room-scanlines" aria-hidden="true" />
      <GameHud night={NIGHT_NUMBER} time={time} />
      {DEBUG_HITBOXES && <DebugHitboxes pan={pan} panDirection={panDirection} />}
    </div>
  )
}
