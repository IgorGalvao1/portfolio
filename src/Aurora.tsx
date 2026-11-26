/*! Aurora adapted from React Bits by David Haz. See /licenses/react-bits.txt. */
import { useEffect, useRef, type CSSProperties } from 'react'
import './Aurora.css'

const MAX_STOPS = 5;
const MAX_LAYERS = 3;
const INTRO_SECONDS = 2.4;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uStops[${MAX_STOPS}];
uniform int uStopCount;
uniform float uAmplitude;
uniform float uBlend;
uniform float uHeight;
uniform float uScale;
uniform float uGlow;
uniform float uBrightness;
uniform int uLayers;
uniform float uFlip;
uniform vec2 uPointer;
uniform float uReveal;
uniform float uOpacity;
uniform float uLightMode;
out vec4 outColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float smootherstep(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);
  int i = int(min(floor(x), float(uStopCount - 2)));
  float f = x - float(i);
  f = f * f * (3.0 - 2.0 * f);
  vec3 lch = mix(uStops[i], uStops[i + 1], f);
  lch.x = mix(lch.x, min(lch.x, 0.7), uLightMode);
  return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float y = 1.0 - frag.y / uResolution.y;
  y = mix(y, 1.0 - y, uFlip);
  float u = frag.x / uResolution.x;
  float X = (frag.x - uResolution.x * 0.5) / uResolution.y;
  float t = uTime;
  float reach = uPointer.y * exp(-pow((X - uPointer.x) / 0.38, 2.0));

  vec3 glow = vec3(0.0);
  float cover = 0.0;
  for (int k = 0; k < ${MAX_LAYERS}; k++) {
    if (k >= uLayers) break;
    float layer = float(k);
    float seed = layer * 13.7;
    float pace = t * (1.0 - layer * 0.18);
    float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));
    float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72
      + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;
    float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;
    hem += reach * 0.08 * (layer < 0.5 ? 1.0 : 0.4);
    hem = mix(-0.25, hem, uReveal);

    float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);
    float rise = hem - y;
    float low = -soft - uGlow * 0.14;
    float high = 0.26 + soft * 0.6;
    float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);
    float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));
    float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);
    alpha = clamp(alpha * (1.0 + reach * 0.25 * smootherstep(0.9, 0.0, abs(y - hem))), 0.0, 1.0);

    vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);
    glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);
    cover = 1.0 - (1.0 - cover) * (1.0 - alpha);
  }

  float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;
  float strength = clamp(uBrightness, 0.0, 2.0);
  glow *= fade * min(strength, 1.0);
  cover *= fade * min(strength, 1.0);
  glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));
  float dither = (hash(frag) - 0.5) / 255.0;

  if (uLightMode > 0.5) {
    vec3 tint = cover > 0.0001 ? glow / cover : vec3(0.0);
    cover *= smootherstep(0.0, 0.25, cover);
    float alpha = cover * 0.7;
    outColor = vec4(tint * alpha + dither, clamp(alpha + dither, 0.0, 1.0));
    return;
  }
  outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));
}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toOklch = (rgb: number[]): [number, number, number] => {
  const [r, g, b] = rgb.map(c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lab = [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
  return [lab[0], Math.hypot(lab[1], lab[2]), Math.atan2(lab[2], lab[1])];
};

const unwrapHues = (stops: [number, number, number][]) => {
  const known = stops.findIndex(stop => stop[1] > 0.02);
  const anchor = known === -1 ? 0 : stops[known][2];
  let previous = anchor;
  return stops.map(stop => {
    let hue = stop[1] > 0.02 ? stop[2] : previous;
    while (hue - previous > Math.PI) hue -= Math.PI * 2;
    while (hue - previous < -Math.PI) hue += Math.PI * 2;
    previous = hue;
    return [stop[0], stop[1], hue];
  });
};

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

function createAurora(gl: WebGL2RenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  const buffer = gl.createBuffer()
  const vao = gl.createVertexArray()

  const dispose = () => {
    gl.deleteProgram(program)
    gl.deleteBuffer(buffer)
    gl.deleteVertexArray(vao)
  }

  if (program && vertex && fragment) {
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.bindAttribLocation(program, 0, 'aPosition')
    gl.linkProgram(program)
  }
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!program || !buffer || !vao || !gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose()
    return null
  }

  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  for (let index = 0; index < count; index += 1) {
    const uniform = gl.getActiveUniform(program, index)
    if (uniform) {
      uniforms[uniform.name.replace('[0]', '')] = gl.getUniformLocation(program, uniform.name)
    }
  }

  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  return { program, vao, uniforms, dispose }
}

const defaultStops = ['#5227FF', '#7cff67', '#5227FF']

function readPalette(stops: readonly string[]) {
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const colors = stops.filter(Boolean).slice(0, MAX_STOPS)
  if (colors.length === 0) colors.push(...defaultStops)
  if (colors.length === 1) colors.push(colors[0])

  const palette = new Float32Array(MAX_STOPS * 3)
  const stopsInOklch = colors.map((color) => {
    if (!probe) return toOklch([1, 1, 1])
    probe.clearRect(0, 0, 1, 1)
    probe.fillStyle = '#ffffff'
    probe.fillStyle = color
    probe.fillRect(0, 0, 1, 1)
    const [red, green, blue] = probe.getImageData(0, 0, 1, 1).data
    return toOklch([red / 255, green / 255, blue / 255])
  })

  unwrapHues(stopsInOklch).forEach((stop, index) => palette.set(stop, index * 3))
  return { palette, stopCount: colors.length }
}

type AuroraProps = {
  colorStops?: readonly string[]
  amplitude?: number
  blend?: number
  height?: number
  speed?: number
  scale?: number
  glow?: number
  brightness?: number
  layers?: number
  direction?: 'top' | 'bottom'
  mouseInteraction?: boolean
  intro?: boolean
  opacity?: number
  lightMode?: boolean
  time?: number
  paused?: boolean
  dpr?: number
  className?: string
  style?: CSSProperties
}

export default function Aurora({
  colorStops = defaultStops,
  amplitude = 1,
  blend = 0.5,
  height = 0.45,
  speed = 1,
  scale = 1,
  glow = 0.6,
  brightness = 1,
  layers = 1,
  direction = 'top',
  mouseInteraction = true,
  intro = true,
  opacity = 1,
  lightMode = false,
  time,
  paused = false,
  dpr,
  className = '',
  style,
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const refreshRef = useRef<() => void>(null)
  const settings = {
    colorStops,
    amplitude: Math.max(0, amplitude),
    blend: clamp(blend, 0, 1),
    height: clamp(height, 0, 1),
    speed,
    scale: Math.max(0.1, scale),
    glow: Math.max(0, glow),
    brightness: Math.max(0, brightness),
    layers: clamp(Math.round(layers), 1, MAX_LAYERS),
    flip: direction === 'bottom' ? 1 : 0,
    mouseInteraction,
    intro,
    opacity: clamp(opacity, 0, 1),
    lightMode,
    time,
    paused,
    dpr,
  }
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
    refreshRef.current?.()
  })

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    })
    if (!gl) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let renderer = createAurora(gl)
    let paletteKey = JSON.stringify(settingsRef.current.colorStops)
    let { palette, stopCount } = readPalette(settingsRef.current.colorStops)
    let visible = true
    let raf = 0
    let lastFrame = 0
    let clock = 0
    let reveal = settingsRef.current.intro && !reducedMotion.matches ? 0 : 1
    let pointerTarget = 0
    let pointerX = 0
    let reach = 0
    let pointerInside = false

    const draw = () => {
      if (!renderer || gl.isContextLost()) return
      const s = settingsRef.current
      const { program, vao, uniforms: u } = renderer
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(program)
      gl.bindVertexArray(vao)
      gl.uniform2f(u.uResolution, canvas.width, canvas.height)
      gl.uniform1f(u.uTime, s.time === undefined ? clock : s.time * s.speed * 0.1)
      gl.uniform3fv(u.uStops, palette)
      gl.uniform1i(u.uStopCount, stopCount)
      gl.uniform1f(u.uAmplitude, s.amplitude)
      gl.uniform1f(u.uBlend, s.blend)
      gl.uniform1f(u.uHeight, s.height)
      gl.uniform1f(u.uScale, s.scale)
      gl.uniform1f(u.uGlow, s.glow)
      gl.uniform1f(u.uBrightness, s.brightness)
      gl.uniform1i(u.uLayers, s.layers)
      gl.uniform1f(u.uFlip, s.flip)
      gl.uniform2f(u.uPointer, pointerX, reach)
      gl.uniform1f(u.uReveal, 1 - Math.pow(1 - reveal, 3))
      gl.uniform1f(u.uOpacity, s.opacity)
      gl.uniform1f(u.uLightMode, s.lightMode ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!container.hasAttribute('data-aurora-ready')) {
        container.setAttribute('data-aurora-ready', '')
      }
    }

    function frame(now: number) {
      raf = 0
      const s = settingsRef.current
      const dt = lastFrame ? clamp((now - lastFrame) / 1000, 0, 0.05) : 0
      const animate = !s.paused && !reducedMotion.matches
      const engaged = s.mouseInteraction && pointerInside
      lastFrame = animate ? now : 0

      if (animate) {
        clock += dt * s.speed
        pointerX += (pointerTarget - pointerX) * (1 - Math.exp(-dt / 0.6))
        reach += (Number(engaged) - reach) * (1 - Math.exp(-dt / (engaged ? 0.9 : 1.4)))
      } else if (reducedMotion.matches) {
        reach = 0
      }
      reveal = s.intro && animate ? Math.min(1, reveal + dt / INTRO_SECONDS) : 1
      draw()
      if (animate) wake()
    }

    function wake() {
      if (!raf && renderer && visible && !document.hidden) {
        raf = requestAnimationFrame(frame)
      }
    }

    function stop() {
      cancelAnimationFrame(raf)
      raf = 0
      lastFrame = 0
    }

    const resize = () => {
      const ratio = clamp(settingsRef.current.dpr ?? window.devicePixelRatio ?? 1, 0.5, 2)
      const width = Math.max(1, Math.round(container.clientWidth * ratio))
      const height = Math.max(1, Math.round(container.clientHeight * ratio))
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      wake()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return
      const s = settingsRef.current
      if (!s.mouseInteraction || s.paused || !visible) return
      const { left, top, right, bottom, width, height } = container.getBoundingClientRect()
      const wasInside = pointerInside
      pointerInside = event.clientX >= left && event.clientX <= right &&
        event.clientY >= top && event.clientY <= bottom
      if (!pointerInside) return
      pointerTarget = (event.clientX - left - width / 2) / Math.max(1, height)
      if (!wasInside && reach < 0.01) pointerX = pointerTarget
    }

    const onPointerLeave = () => {
      pointerInside = false
    }

    const onVisibility = () => {
      stop()
      onPointerLeave()
      wake()
    }

    const onContextLost = (event: Event) => {
      event.preventDefault()
      stop()
      renderer = null
      container.removeAttribute('data-aurora-ready')
    }

    const onContextRestored = () => {
      renderer = createAurora(gl)
      resize()
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      onVisibility()
    })
    const resizeObserver = new ResizeObserver(resize)
    observer.observe(container)
    resizeObserver.observe(container)
    reducedMotion.addEventListener('change', onVisibility)
    document.addEventListener('visibilitychange', onVisibility)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', resize)
    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)
    resize()

    refreshRef.current = () => {
      const stops = settingsRef.current.colorStops
      const key = JSON.stringify(stops)
      if (paletteKey !== key) {
        paletteKey = key
        const next = readPalette(stops)
        palette = next.palette
        stopCount = next.stopCount
      }
      resize()
    }

    return () => {
      stop()
      refreshRef.current = null
      container.removeAttribute('data-aurora-ready')
      observer.disconnect()
      resizeObserver.disconnect()
      reducedMotion.removeEventListener('change', onVisibility)
      document.removeEventListener('visibilitychange', onVisibility)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      renderer?.dispose()
    }
  }, [])

  return (
    <div className={`aurora-container ${className}`} ref={containerRef} style={style} aria-hidden="true">
      <canvas className="aurora-canvas" ref={canvasRef} />
    </div>
  )
}

