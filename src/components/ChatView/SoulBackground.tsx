interface SoulBackgroundProps {
  bgRef: React.RefObject<HTMLDivElement | null>
  needsPermission: boolean
  onRequestPermission: () => void
}

export function SoulBackground({ bgRef, needsPermission, onRequestPermission }: SoulBackgroundProps) {
  return (
    <>
      <div
        ref={bgRef}
        aria-hidden="true"
        className="soul-bg"
        style={{ '--gx': '0', '--gy': '0' } as React.CSSProperties}
      >
        <div className="soul soul-1" />
        <div className="soul soul-2" />
        <div className="soul soul-3" />
        <div className="soul soul-4" />
      </div>

      {needsPermission && (
        <button
          onClick={onRequestPermission}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full text-xs transition-opacity"
          style={{
            color: 'var(--color-crow-muted)',
            border: '1px solid var(--color-crow-border)',
            background: 'var(--color-crow-surface)',
            opacity: 0.75,
            pointerEvents: 'auto',
          }}
        >
          开启重力感应
        </button>
      )}
    </>
  )
}
