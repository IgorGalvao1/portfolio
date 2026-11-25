import {
  Mesh,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three'

// A machined copper finish. The highlights follow the surface as the visitor rotates it.
const vertexShader = `
  varying vec3 normalView;
  varying vec2 surfaceUv;
  void main() {
    normalView = normalize(normalMatrix * normal);
    surfaceUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  varying vec3 normalView;
  varying vec2 surfaceUv;
  void main() {
    vec3 n = normalize(normalView);
    vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
    float key = max(0.0, dot(n, normalize(vec3(-0.55, 0.85, 0.75))));
    float rim = pow(1.0 - max(n.z, 0.0), 2.4);
    float strip = exp(-pow((r.y + 0.32*r.x - 0.34) / 0.33, 2.0));
    float narrow = exp(-pow((r.x + 0.23*r.y + 0.48) / 0.24, 2.0));
    vec3 copper = mix(vec3(0.12, 0.034, 0.013), vec3(0.96, 0.38, 0.16), 0.15 + 0.85*key);
    copper += strip * vec3(0.61, 0.55, 0.46) + narrow * vec3(0.19, 0.11, 0.07);
    copper += rim * vec3(0.17, 0.09, 0.045);
    float ringCoord = surfaceUv.x * 170.0;
    float ring = 1.0 - smoothstep(0.13, 0.13 + min(fwidth(ringCoord), 0.20), abs(fract(ringCoord) - 0.5));
    float grooves = mix(1.0, 0.37, ring);
    vec3 color = copper * grooves + vec3(0.12, 0.065, 0.026) * (1.0 - ring) * key;
    gl_FragColor = vec4(color, 1.0);
  }
`

export function mountSculpture(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  if (!context) throw new Error('WebGL 2 indisponível')
  const renderer = new WebGLRenderer({ canvas, context })
  let shaderFailed = false
  renderer.debug.onShaderError = () => {
    shaderFailed = true
  }
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
  const scene = new Scene()
  const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 20)
  camera.position.z = 8
  const geometry = new TorusKnotGeometry(1, 0.39, 384, 48, 2, 3)
  geometry.center()
  const material = new ShaderMaterial({ vertexShader, fragmentShader })
  const sculpture = new Mesh(geometry, material)
  sculpture.rotation.set(0.4, 0.1, -0.15)
  sculpture.scale.x = 1.12
  scene.add(sculpture)

  let frame = 0
  let previous = 0
  let autoRotate = false
  let inView = false
  let dragging = false
  let destroyed = false
  const draw = () => renderer.render(scene, camera)
  const animate = (time: number) => {
    frame = 0
    if (destroyed || !autoRotate || !inView || dragging || document.hidden)
      return
    if (!previous || time - previous >= 1000 / 30) {
      if (previous)
        sculpture.rotation.z += Math.min(time - previous, 80) * 0.000055
      previous = time
      draw()
    }
    frame = requestAnimationFrame(animate)
  }
  const syncAnimation = () => {
    cancelAnimationFrame(frame)
    previous = 0
    if (autoRotate && inView && !dragging && !document.hidden)
      frame = requestAnimationFrame(animate)
  }
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    const aspect = width / height
    const scale = Math.max(2.05, 2.29 / aspect)
    camera.left = -scale * aspect
    camera.right = scale * aspect
    camera.top = scale
    camera.bottom = -scale
    camera.updateProjectionMatrix()
    draw()
  }
  resize()
  if (shaderFailed) {
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    throw new Error('O dispositivo não conseguiu renderizar a escultura')
  }
  const sizeObserver = new ResizeObserver(resize)
  sizeObserver.observe(canvas)
  const viewObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    syncAnimation()
  })
  viewObserver.observe(canvas)
  document.addEventListener('visibilitychange', syncAnimation)

  return {
    rotate(dx: number, dy: number) {
      sculpture.rotation.y += dx * 0.009
      sculpture.rotation.x += dy * 0.009
      draw()
    },
    setPlaying(value: boolean) {
      autoRotate = value
      syncAnimation()
    },
    setDragging(value: boolean) {
      dragging = value
      syncAnimation()
    },
    dispose() {
      destroyed = true
      cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      viewObserver.disconnect()
      document.removeEventListener('visibilitychange', syncAnimation)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}
