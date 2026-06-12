import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { makeGlowTexture } from './glow'
import { motionOK } from '../../lib/motion'

interface AuroraFieldProps {
  isDark: boolean
}

const COUNT = 1100

/**
 * Persistent WebGL constellation behind the whole app: a slowly drifting
 * particle field in brand colours with gentle mouse parallax. Lazy-loaded,
 * DPR-capped, paused when the tab is hidden, single static frame under
 * prefers-reduced-motion.
 */
export default function AuroraField({ isDark }: AuroraFieldProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(window.innerWidth, window.innerHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      120,
    )
    camera.position.z = 26

    // ── Particle cloud: wide ellipsoid shell in brand colours ──
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const palette = [
      new THREE.Color('#5eead4'),
      new THREE.Color('#2884c6'),
      new THREE.Color('#7cb6bc'),
      new THREE.Color('#bcd9f0'),
      new THREE.Color('#c08a1e'),
    ]
    const weights = [0.26, 0.3, 0.22, 0.16, 0.06]
    const pick = () => {
      let r = Math.random()
      for (let i = 0; i < weights.length; i++) {
        if ((r -= weights[i]) <= 0) return palette[i]
      }
      return palette[0]
    }
    for (let i = 0; i < COUNT; i++) {
      const r = 14 + Math.random() * 22
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.6
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.7
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 6
      const c = pick()
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const sprite = makeGlowTexture()
    const material = new THREE.PointsMaterial({
      size: 0.55,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.85 : 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    materialRef.current = material
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // ── Interaction state ──
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    let hidden = document.hidden
    const onVisibility = () => {
      hidden = document.hidden
      if (!hidden && motionOK()) loop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const clock = new THREE.Clock()
    const render = () => {
      const t = clock.getElapsedTime()
      eased.x += (target.x - eased.x) * 0.03
      eased.y += (target.y - eased.y) * 0.03
      points.rotation.y = t * 0.016 + eased.x * 0.12
      points.rotation.x = Math.sin(t * 0.05) * 0.05 - eased.y * 0.08
      points.position.y = Math.sin(t * 0.11) * 0.6
      renderer.render(scene, camera)
    }
    const loop = () => {
      if (hidden) return
      render()
      raf = requestAnimationFrame(loop)
    }

    if (motionOK()) loop()
    else render() // single static frame

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      geometry.dispose()
      material.dispose()
      sprite.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
    // The scene is built once; theme flips only retune the material below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.opacity = isDark ? 0.85 : 0.4
    }
  }, [isDark])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[1]"
    />
  )
}
