import type { CSSProperties } from 'react'
import { PAN_HITBOX_WIDTH_PERCENT } from '../constants'

type DebugHitboxesProps = {
  pan: number
  panDirection: number
}

export function DebugHitboxes({ pan, panDirection }: DebugHitboxesProps) {
  const style = {
    '--debug-hitbox-width': `${PAN_HITBOX_WIDTH_PERCENT}%`,
  } as CSSProperties

  return (
    <div className="debug-hitboxes" style={style} aria-hidden="true">
      <div className="debug-hitbox debug-hitbox--left">
        <span>PAN LEFT</span>
      </div>
      <div className="debug-hitbox debug-hitbox--right">
        <span>PAN RIGHT</span>
      </div>
      <div className="debug-center-line" />
      <div className="debug-readout">
        pan {pan.toFixed(2)} / dir {panDirection.toFixed(0)}
      </div>
    </div>
  )
}
