import type {
  AnimatronicId,
  CameraDefinition,
  CameraPoseSelections,
} from '../cameraData'

type CameraDebugPanelProps = {
  camera: CameraDefinition
  onPoseSelect: (animatronicId: AnimatronicId, poseId: string | null) => void
  selections: CameraPoseSelections
}

export function CameraDebugPanel({
  camera,
  onPoseSelect,
  selections,
}: CameraDebugPanelProps) {
  const activeSelections = selections[camera.id] ?? {}
  const animatronics = camera.animatronics ?? []

  return (
    <aside className="camera-debug-panel" aria-label="Camera debug poses">
      <div className="camera-debug-panel__title">DEBUG POSES</div>
      {animatronics.length > 0 ? (
        animatronics.map((animatronic) => (
          <div className="camera-debug-panel__group" key={animatronic.id}>
            <span>{animatronic.label}</span>
            <div className="camera-debug-panel__options">
              <button
                type="button"
                className="camera-debug-panel__option"
                aria-pressed={!activeSelections[animatronic.id]}
                onClick={() => onPoseSelect(animatronic.id, null)}
              >
                OFF
              </button>
              {animatronic.poses.map((pose) => (
                <button
                  type="button"
                  className="camera-debug-panel__option"
                  aria-pressed={activeSelections[animatronic.id] === pose.id}
                  key={pose.id}
                  onClick={() => onPoseSelect(animatronic.id, pose.id)}
                >
                  {pose.label}
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="camera-debug-panel__empty">NO POSES</div>
      )}
    </aside>
  )
}
