import { useEffect, useRef, useState, type CSSProperties } from 'react'
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

export default function TechnologyGlobe() {
  const globeRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(globe)
    return () => observer.disconnect()
  }, [])

  return (
    <div id="tecnologias" className="technology-globe" ref={globeRef}>
      <ul
        className="technology-orbit"
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
