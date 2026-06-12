import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { makeGlowTexture } from './glow'
import { gsap, motionOK } from '../../lib/motion'

const STRAND_POINTS = 96
const HELIX_TURNS = 2.6
const HELIX_HEIGHT = 13
const HELIX_RADIUS = 2.5
const SPARKLE_COUNT = 240

/**
 * Hero centrepiece: a luminous DNA double-helix — genetics, newborn
 * screening, the thread of life — slowly revolving inside a particle halo.
 * Pointer-tilt interactive; clicking sends a pulse through the strand.
 */
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const setSize = () => {
      const { clientWidth, clientHeight } = mount
      renderer.setSize(clientWidth, clientHeight)
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
    }
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 80)
    camera.position.set(0, 0, 15)

    const group = new THREE.Group()
    scene.add(group)
    group.rotation.z = 0.32

    const sprite = makeGlowTexture()

    // ── Helix strands ──
    const strandGeo = (phase: number) => {
      const pos = new Float32Array(STRAND_POINTS * 3)
      for (let i = 0; i < STRAND_POINTS; i++) {
        const t = i / (STRAND_POINTS - 1)
        const angle = t * Math.PI * 2 * HELIX_TURNS + phase
        pos[i * 3] = Math.cos(angle) * HELIX_RADIUS
        pos[i * 3 + 1] = (t - 0.5) * HELIX_HEIGHT
        pos[i * 3 + 2] = Math.sin(angle) * HELIX_RADIUS
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      return g
    }
    const strandMat = (color: string, size: number) =>
      new THREE.PointsMaterial({
        color,
        size,
        map: sprite,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })

    const geoA = strandGeo(0)
    const geoB = strandGeo(Math.PI)
    const matA = strandMat('#5eead4', 0.42)
    const matB = strandMat('#2884c6', 0.42)
    group.add(new THREE.Points(geoA, matA))
    group.add(new THREE.Points(geoB, matB))

    // ── Rungs between the strands ──
    const rungEvery = 4
    const rungCount = Math.floor(STRAND_POINTS / rungEvery)
    const rungPos = new Float32Array(rungCount * 6)
    for (let r = 0; r < rungCount; r++) {
      const i = r * rungEvery
      const t = i / (STRAND_POINTS - 1)
      const angle = t * Math.PI * 2 * HELIX_TURNS
      const y = (t - 0.5) * HELIX_HEIGHT
      rungPos[r * 6] = Math.cos(angle) * HELIX_RADIUS
      rungPos[r * 6 + 1] = y
      rungPos[r * 6 + 2] = Math.sin(angle) * HELIX_RADIUS
      rungPos[r * 6 + 3] = Math.cos(angle + Math.PI) * HELIX_RADIUS
      rungPos[r * 6 + 4] = y
      rungPos[r * 6 + 5] = Math.sin(angle + Math.PI) * HELIX_RADIUS
    }
    const rungGeo = new THREE.BufferGeometry()
    rungGeo.setAttribute('position', new THREE.BufferAttribute(rungPos, 3))
    const rungMat = new THREE.LineBasicMaterial({
      color: '#9fd4e8',
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    })
    group.add(new THREE.LineSegments(rungGeo, rungMat))

    // ── Ambient sparkles around the helix ──
    const sparklePos = new Float32Array(SPARKLE_COUNT * 3)
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const r = 4.5 + Math.random() * 7
      const theta = Math.random() * Math.PI * 2
      sparklePos[i * 3] = Math.cos(theta) * r
      sparklePos[i * 3 + 1] = (Math.random() - 0.5) * 15
      sparklePos[i * 3 + 2] = Math.sin(theta) * r - 1
    }
    const sparkleGeo = new THREE.BufferGeometry()
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3))
    const sparkleMat = new THREE.PointsMaterial({
      color: '#e8c476',
      size: 0.16,
      map: sprite,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat)
    scene.add(sparkles)

    // ── Soft core glow ──
    const coreMat = new THREE.SpriteMaterial({
      map: sprite,
      color: '#3aa3b8',
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const core = new THREE.Sprite(coreMat)
    core.scale.setScalar(11)
    scene.add(core)

    setSize()

    // ── Interaction: pointer tilt + click pulse ──
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }
    const onPointer = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect()
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const speed = { v: 0.22 }
    const onClick = () => {
      if (!motionOK()) return
      gsap.to(speed, { v: 1.6, duration: 0.25, ease: 'power2.out' })
      gsap.to(speed, { v: 0.22, duration: 1.6, ease: 'power3.out', delay: 0.25 })
      gsap.fromTo(
        coreMat,
        { opacity: 0.7 },
        { opacity: 0.32, duration: 1.2, ease: 'power2.out' },
      )
    }
    mount.addEventListener('pointermove', onPointer, { passive: true })
    mount.addEventListener('click', onClick)

    const ro = new ResizeObserver(setSize)
    ro.observe(mount)

    let raf = 0
    const clock = new THREE.Clock()
    const render = () => {
      const t = clock.getElapsedTime()
      const dt = clock.getDelta()
      eased.x += (target.x - eased.x) * 0.04
      eased.y += (target.y - eased.y) * 0.04
      group.rotation.y += (0.0045 + speed.v * 0.004) * (1 + dt)
      group.rotation.x = eased.y * 0.22
      group.rotation.z = 0.32 + eased.x * 0.1
      sparkles.rotation.y = -t * 0.02
      coreMat.opacity = Math.max(coreMat.opacity, 0.26 + Math.sin(t * 1.6) * 0.05)
      renderer.render(scene, camera)
    }
    const loop = () => {
      render()
      raf = requestAnimationFrame(loop)
    }
    if (motionOK()) loop()
    else render()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mount.removeEventListener('pointermove', onPointer)
      mount.removeEventListener('click', onClick)
      ;[geoA, geoB, rungGeo, sparkleGeo].forEach((g) => g.dispose())
      ;[matA, matB, rungMat, sparkleMat, coreMat].forEach((m) => m.dispose())
      sprite.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="absolute inset-0 cursor-pointer"
    />
  )
}
