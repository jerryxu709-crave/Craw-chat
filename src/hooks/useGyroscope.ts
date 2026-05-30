import { useEffect, useRef, useState } from 'react'

export function useGyroscope(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [needsPermission, setNeedsPermission] = useState(false)
  const requestFnRef = useRef<(() => Promise<void>) | null>(null)

  useEffect(() => {
    const apply = (gx: number, gy: number) => {
      const el = containerRef.current
      if (!el) return
      el.style.setProperty('--gx', gx.toFixed(3))
      el.style.setProperty('--gy', gy.toFixed(3))
    }

    const onOrientation = (e: DeviceOrientationEvent) => {
      const gx = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 22))
      const gy = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 45) / 35))
      apply(gx, gy)
    }

    const onMouse = (e: MouseEvent) => {
      apply(
        (e.clientX / window.innerWidth - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      )
    }

    const doe = DeviceOrientationEvent as any
    const hasPermissionAPI = typeof doe.requestPermission === 'function'

    let cleanupActive: (() => void) | null = null
    let cleanupProbe: (() => void) | null = null

    const startOrientation = () => {
      window.addEventListener('deviceorientation', onOrientation, true)
      cleanupActive = () => window.removeEventListener('deviceorientation', onOrientation, true)
    }

    const startMouse = () => {
      window.addEventListener('mousemove', onMouse)
      cleanupActive = () => window.removeEventListener('mousemove', onMouse)
    }

    // Probe: see if events arrive naturally within 900ms
    let gotEvent = false
    const probe = (e: DeviceOrientationEvent) => { gotEvent = true; onOrientation(e) }
    window.addEventListener('deviceorientation', probe, { once: true, capture: true })
    cleanupProbe = () => window.removeEventListener('deviceorientation', probe, true)

    const timer = setTimeout(() => {
      cleanupProbe?.()
      cleanupProbe = null

      if (gotEvent) {
        startOrientation()
      } else if (hasPermissionAPI) {
        requestFnRef.current = async () => {
          try {
            const result = await doe.requestPermission()
            if (result === 'granted') {
              setNeedsPermission(false)
              startOrientation()
            }
          } catch { /* denied */ }
        }
        setNeedsPermission(true)
      } else {
        startMouse()
      }
    }, 900)

    return () => {
      clearTimeout(timer)
      cleanupProbe?.()
      cleanupActive?.()
    }
  }, [containerRef])

  const requestPermission = () => { requestFnRef.current?.() }

  return { needsPermission, requestPermission }
}
