import { CAMERA_PROMPT_MAX_PAN, CAMERA_PROMPT_MIN_PAN } from '../constants'

type CameraPromptProps = {
  onOpenCameras: () => void
  pan: number
}

export function CameraPrompt({ onOpenCameras, pan }: CameraPromptProps) {
  const shouldShowPrompt = pan >= CAMERA_PROMPT_MIN_PAN && pan <= CAMERA_PROMPT_MAX_PAN

  if (!shouldShowPrompt) {
    return null
  }

  return (
    <button
      type="button"
      className="camera-monitor-button camera-monitor-button--open"
      aria-label="Open camera mode"
      onFocus={onOpenCameras}
      onPointerEnter={onOpenCameras}
    >
      <span className="camera-monitor-button__chevron" aria-hidden="true" />
      <span className="camera-monitor-button__chevron" aria-hidden="true" />
    </button>
  )
}
