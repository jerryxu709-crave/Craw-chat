import { useEffect, useRef, useState } from 'react'
import { Compass } from 'lucide-react'

export function SoulBackground() {
  const bgRef = useRef<HTMLDivElement>(null)
  const [needsPermission, setNeedsPermission] = useState(false)
  const requestFnRef = useRef<(() => Promise<void>) | null>(null)

  useEffect(() => {
    const el = bgRef.current
    if (!el) return

    const applyGyro = (gx: number, gy: number) => {
      el.style.setProperty('--gx', gx.toFixed(3))
      el.style.setProperty('--gy', gy.toFixed(3))
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // gamma: left-right (-90 to 90), beta: front-back (-180 to 180)
      const gx = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 25))
      const gy = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 45) / 40))
      applyGyro(gx, gy)
    }

    const handleMouse = (e: MouseEvent) => {
      applyGyro(
        (e.clientX / window.innerWidth - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      )
    }

    const doe = DeviceOrientationEvent as any
    const hasPermissionAPI = typeof doe.requestPermission === 'function'

    let activeCleanup: (() => void) | null = null
    let probeCleanup: (() => void) | null = null

    const startOrientation = () => {
      window.addEventListener('deviceorientation', handleOrientation, true)
      activeCleanup = () => window.removeEventListener('deviceorientation', handleOrientation, true)
    }

    const startMouse = () => {
      window.addEventListener('mousemove', handleMouse)
      activeCleanup = () => window.removeEventListener('mousemove', handleMouse)
    }

    // Probe: see if orientation events fire naturally within 800ms
    let gotEvent = false
    const probe = (e: DeviceOrientationEvent) => {
      gotEvent = true
      handleOrientation(e)
    }
    window.addEventListener('deviceorientation', probe, { once: true, capture: true })
    probeCleanup = () => window.removeEventListener('deviceorientation', probe, true)

    const timer = setTimeout(() => {
      probeCleanup?.()
      probeCleanup = null

      if (gotEvent) {
        startOrientation()
      } else if (hasPermissionAPI) {
        // iOS 13+: need user gesture to call requestPermission
        requestFnRef.current = async () => {
          try {
            const result = await doe.requestPermission()
            if (result === 'granted') {
              setNeedsPermission(false)
              startOrientation()
            }
          } catch { /* denied or dismissed */ }
        }
        setNeedsPermission(true)
      } else {
        // Desktop without gyro: mouse parallax
        startMouse()
      }
    }, 800)

    return () => {
      clearTimeout(timer)
      probeCleanup?.()
      activeCleanup?.()
    }
  }, [])

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
      </div>

      {needsPermission && (
        <button
          onClick={() => requestFnRef.current?.()}
          className="absolute bottom-28 right-4 z-10 p-2 rounded-full transition-opacity"
          style={{
            opacity: 0.35,
            color: 'var(--color-crow-muted)',
            border: '1px solid var(--color-crow-border)',
            background: 'var(--color-crow-surface)',
            pointerEvents: 'auto',
          }}
          aria-label="开启重力感应"
          title="开启重力感应"
        >
          <Compass size={13} />
        </button>
      )}
    </>
  )
}
