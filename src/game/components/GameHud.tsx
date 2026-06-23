type GameHudProps = {
  night: number
  time: string
}

export function GameHud({ night, time }: GameHudProps) {
  return (
    <aside className="game-hud" aria-label="Night status">
      <div className="game-hud__time">{time}</div>
      <div className="game-hud__night">Night {night}</div>
    </aside>
  )
}
