import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import './TechnologyGlobe.css'

const technologies = [
  ['javascript', 'JavaScript', '#f7df1e', 45, -38],
  ['typescript', 'TypeScript', '#3178c6', 0, 28],
  ['react', 'React', '#61dafb', 45, 202],
  ['vuedotjs', 'Vue.js', '#42b883', 45, 82],
  ['nextdotjs', 'Next.js', '#d9e3ed', 0, 148],
  ['tailwindcss', 'Tailwind CSS', '#38bdf8', 0, 268],
  ['sass', 'Sass', '#df85b2', -45, -16],
  ['threedotjs', 'Three.js', '#bfcfe0', -45, 104],
  ['gsap', 'GSAP', '#a9e733', -45, 224],
] as const

const restingPitch = -8

export default function TechnologyGlobe() {
  const globeRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLUListElement>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const globe = globeRef.current
    const orbit = orbitRef.current
    if (!globe || !orbit) return

    const angles = { yaw: 0, pitch: restingPitch }
    let targetYaw = angles.yaw
    let targetPitch = angles.pitch
    let previousPointer: { x: number; y: number } | null = null

    const turn = gsap.quickTo(angles, 'yaw', {
      duration: 0.24,
      ease: 'power3.out',
      onUpdate: () => orbit.style.setProperty('--orbit-yaw', `${angles.yaw}deg`),
    })
    const tilt = gsap.quickTo(angles, 'pitch', {
      duration: 0.32,
      ease: 'power3.out',
      onUpdate: () => orbit.style.setProperty('--orbit-pitch', `${angles.pitch}deg`),
    })

    const steer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return

      const point = { x: event.clientX, y: event.clientY }
      if (!previousPointer) {
        orbit.dataset.steering = ''
        tilt.tween.pause()
        targetYaw = angles.yaw
        targetPitch = angles.pitch
      } else {
        const sensitivity = 150 / globe.clientWidth
        targetYaw += (point.x - previousPointer.x) * sensitivity
        targetPitch = gsap.utils.clamp(
          -53,
          37,
          targetPitch - (point.y - previousPointer.y) * sensitivity,
        )
        turn(targetYaw)
        tilt(targetPitch)
      }
      previousPointer = point
    }

    const resumeOrbit = () => {
      if (!previousPointer) return

      previousPointer = null
      turn.tween.pause()
      delete orbit.dataset.steering
      tilt(restingPitch)
    }

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
      if (!entry.isIntersecting) resumeOrbit()
    })
    observer.observe(globe)
    globe.addEventListener('pointerenter', steer)
    globe.addEventListener('pointermove', steer, { passive: true })
    globe.addEventListener('pointerleave', resumeOrbit)
    globe.addEventListener('pointercancel', resumeOrbit)
    window.addEventListener('blur', resumeOrbit)

    return () => {
      observer.disconnect()
      globe.removeEventListener('pointerenter', steer)
      globe.removeEventListener('pointermove', steer)
      globe.removeEventListener('pointerleave', resumeOrbit)
      globe.removeEventListener('pointercancel', resumeOrbit)
      window.removeEventListener('blur', resumeOrbit)
      turn.tween.kill()
      tilt.tween.kill()
      delete orbit.dataset.steering
      orbit.style.removeProperty('--orbit-yaw')
      orbit.style.removeProperty('--orbit-pitch')
    }
  }, [])

  return (
    <div id="tecnologias" className="technology-globe" ref={globeRef}>
      <ul
        className="technology-orbit"
        ref={orbitRef}
        role="list"
        aria-label="Tecnologias"
        data-paused={!inView || undefined}
      >
        {technologies.map(([slug, name, color, latitude, longitude]) => (
          <li
            key={slug}
            className="technology-card"
            style={{
              '--technology-icon': `url(/icons/${slug}.svg)`,
              '--technology-color': color,
              '--latitude': `${latitude}deg`,
              '--longitude': `${longitude}deg`,
            } as CSSProperties}
          >
            <span className="technology-face">
              <span className="technology-mark" aria-hidden="true">
                <span className="technology-icon" />
              </span>
              <span>{name}</span>
            </span>
            <span className="technology-back" aria-hidden="true">
              <span className="technology-icon" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
