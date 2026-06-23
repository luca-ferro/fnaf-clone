import { useEffect } from 'react'
import { CAMERA_NOISE_SRC, CAMERA_NOISE_VOLUME, NIGHT_NUMBER } from '../constants'
import { useLoopingSound } from '../hooks/useLoopingSound'
import { GameHud } from './GameHud'

type CameraTodoScreenProps = {
  isTransitioning: boolean
  onCloseCameras: () => void
  time: string
}

export function CameraTodoScreen({
  isTransitioning,
  onCloseCameras,
  time,
}: CameraTodoScreenProps) {
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

  return (
    <div className="camera-todo-screen" aria-label="Camera system placeholder">
      <div className="camera-todo-screen__panel">
        <span>CAMERAS TODO</span>
      </div>
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
      <div className="camera-todo-screen__status">SYSTEM STANDBY</div>
      <GameHud night={NIGHT_NUMBER} time={time} />
    </div>
  )
}
