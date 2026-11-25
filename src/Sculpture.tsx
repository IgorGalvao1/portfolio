import { useEffect, useRef, useState } from 'react'
import { Atom, Hand, Pause, Play } from 'lucide-react'
import type { mountSculpture } from './sculpture'

export function Sculpture() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<ReturnType<typeof mountSculpture> | null>(null)
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let active = true
    const element = canvas.current!
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    const stopOnPreferenceChange = () => {
      if (reducedMotion.matches) setPlaying(false)
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      scene.current?.dispose()
      scene.current = null
      setReady(false)
      setPlaying(false)
    }
    element.addEventListener('webglcontextlost', contextLost)
    reducedMotion.addEventListener('change', stopOnPreferenceChange)
    import('./sculpture')
      .then(({ mountSculpture }) => {
        if (!active) return
        scene.current = mountSculpture(element)
        setReady(true)
        setPlaying(!reducedMotion.matches)
      })
      .catch(() => {
        if (active) setReady(false)
      })
    return () => {
      active = false
      scene.current?.dispose()
      scene.current = null
      element.removeEventListener('webglcontextlost', contextLost)
      reducedMotion.removeEventListener('change', stopOnPreferenceChange)
    }
  }, [])

  useEffect(() => {
    scene.current?.setPlaying(playing)
  }, [playing])

  const finishDrag = () => {
    pointer.current = null
    scene.current?.setDragging(false)
  }

  return (
    <div className="sculpture" data-visual>
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-meta">
        <span className="scene-tag">
          <Atom size={15} /> Estudo de forma
        </span>
        <span>Three.js</span>
      </div>
      <div className="scene-stage">
        <i className="register nw" />
        <i className="register ne" />
        <i className="register sw" />
        <i className="register se" />
        {!ready && (
          <img
            className="scene-still"
            src="/forma.webp"
            width="880"
            height="720"
            alt="Escultura de cobre com três curvas entrelaçadas"
          />
        )}
        <canvas
          ref={canvas}
          className={ready ? 'live' : ''}
          role="img"
          aria-hidden={!ready}
          tabIndex={ready ? 0 : -1}
          aria-label="Nó tridimensional de cobre. Arraste ou use as setas do teclado para girar."
          onKeyDown={(event) => {
            const offset: Record<string, [number, number]> = {
              ArrowLeft: [-12, 0],
              ArrowRight: [12, 0],
              ArrowUp: [0, -12],
              ArrowDown: [0, 12],
            }
            if (!offset[event.key]) return
            event.preventDefault()
            scene.current?.rotate(...offset[event.key])
          }}
          onPointerDown={(event) => {
            if (!ready || !event.isPrimary || event.button !== 0) return
            event.currentTarget.setPointerCapture(event.pointerId)
            pointer.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
            }
            scene.current?.setDragging(true)
          }}
          onPointerMove={(event) => {
            const start = pointer.current
            if (!start || start.id !== event.pointerId) return
            scene.current?.rotate(
              event.clientX - start.x,
              event.clientY - start.y,
            )
            start.x = event.clientX
            start.y = event.clientY
          }}
          onPointerCancel={finishDrag}
          onLostPointerCapture={finishDrag}
          onPointerUp={finishDrag}
        />
      </div>
      <div className="scene-controls">
        <span>
          {ready ? (
            <>
              <Hand size={14} />
              Arraste para girar
            </>
          ) : (
            'Nó toroidal'
          )}
        </span>
        {ready && (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pausar rotação' : 'Iniciar rotação'}
            title={playing ? 'Pausar rotação' : 'Iniciar rotação'}
          >
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
        )}
      </div>
    </div>
  )
}
