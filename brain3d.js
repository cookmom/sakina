// brain3d.js — 3D Brain Visualization for Sakina
// Three.js — simplified brain mesh with region highlights

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'

const ACCENT  = 0x2c3e6b
const PAPER   = 0xf5f0e6
const PAPER_C = new THREE.Color(PAPER)

// Brain region definitions: normalized position on unit sphere
// Anatomy is approximate but directionally correct
const REGION_DEFS = {
  contemplation: { pos: [ 0.00,  0.38,  0.92] }, // Frontal lobe — anterior/superior
  auditory:      { pos: [-0.92, -0.05,  0.30] }, // Temporal L — lateral
  language:      { pos: [ 0.92, -0.05,  0.30] }, // Temporal R — lateral (Broca/Wernicke)
  emotion:       { pos: [ 0.00, -0.65,  0.05] }, // Limbic — inferior inner
  memory:        { pos: [ 0.00,  0.30, -0.92] }, // Parietal — posterior superior
}

// Brain ellipsoid scale (makes it look more brain-shaped than a perfect sphere)
const BRAIN_SCALE = new THREE.Vector3(1.12, 0.82, 1.05)

let renderer, scene, camera, clock
let brainGroup, regionNodes = {}
let _running = false, _animId = null

export function initBrain3D(canvas) {
  if (renderer) return  // already initialised

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(PAPER, 1)

  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50)
  camera.position.set(0, 0.5, 3.3)
  camera.lookAt(0, 0, 0)
  clock  = new THREE.Clock()

  // ── Lighting ──────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xf5eedc, 0.65)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight(0xffffff, 0.95)
  sun.position.set(2, 3, 2)
  scene.add(sun)

  const rim = new THREE.DirectionalLight(ACCENT, 0.35)
  rim.position.set(-2, -1, -2)
  scene.add(rim)

  // ── Brain group ───────────────────────────────────────────
  brainGroup = new THREE.Group()
  scene.add(brainGroup)

  // Main body — phong, slightly transparent
  const bodyGeo = new THREE.SphereGeometry(1, 52, 40)
  const bodyMat = new THREE.MeshPhongMaterial({
    color:             0xede8dc,
    emissive:          ACCENT,
    emissiveIntensity: 0.025,
    shininess:         18,
    transparent:       true,
    opacity:           0.88,
    side:              THREE.FrontSide,
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.scale.copy(BRAIN_SCALE)
  brainGroup.add(body)

  // Fine wireframe overlay — gives the "mesh-of-cortex" look
  const wireGeo = new THREE.SphereGeometry(1.006, 30, 22)
  const wireMat = new THREE.MeshBasicMaterial({
    color:       ACCENT,
    wireframe:   true,
    transparent: true,
    opacity:     0.038,
  })
  const wire = new THREE.Mesh(wireGeo, wireMat)
  wire.scale.copy(BRAIN_SCALE)
  brainGroup.add(wire)

  // ── Region glow nodes ─────────────────────────────────────
  Object.entries(REGION_DEFS).forEach(([key, def]) => {
    const geo = new THREE.SphereGeometry(0.19, 18, 14)
    const mat = new THREE.MeshPhongMaterial({
      color:             ACCENT,
      emissive:          ACCENT,
      emissiveIntensity: 0,
      transparent:       true,
      opacity:           0,
      shininess:         80,
      depthWrite:        false,
    })
    const mesh = new THREE.Mesh(geo, mat)

    // Place node on ellipsoid surface (90% radius so it's slightly inside)
    const [nx, ny, nz] = def.pos
    mesh.position.set(
      nx * BRAIN_SCALE.x * 0.90,
      ny * BRAIN_SCALE.y * 0.90,
      nz * BRAIN_SCALE.z * 0.90
    )
    brainGroup.add(mesh)
    regionNodes[key] = { mesh, mat }
  })

  // Initial resize
  resize3D(canvas.parentElement)
}

// ── Public API ────────────────────────────────────────────────

export function updateBrainState3D(brain) {
  if (!renderer) return
  Object.entries(regionNodes).forEach(([key, { mat }]) => {
    const v = Math.max(0, Math.min(1, brain[key] ?? 0))
    mat.emissiveIntensity = v * 3.2
    mat.opacity           = v < 0.04 ? 0 : 0.1 + v * 0.68
    mat.needsUpdate       = true
  })
}

export function resize3D(container) {
  if (!renderer || !container) return
  const w = container.clientWidth
  const h = container.clientHeight || w  // fallback to square
  renderer.setSize(w, h)
  if (camera) {
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
}

export function startBrain3D() {
  if (_running) return
  _running = true
  ;(function loop() {
    if (!_running) return
    _animId = requestAnimationFrame(loop)
    const t = clock.getElapsedTime()
    if (brainGroup) {
      brainGroup.rotation.y = t * 0.19
      brainGroup.rotation.x = Math.sin(t * 0.11) * 0.055
    }
    renderer.render(scene, camera)
  })()
}

export function stopBrain3D() {
  _running = false
  if (_animId) { cancelAnimationFrame(_animId); _animId = null }
}

export function disposeBrain3D() {
  stopBrain3D()
  if (renderer) { renderer.dispose(); renderer = null }
}
