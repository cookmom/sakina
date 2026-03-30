// بسم الله الرحمن الرحيم
// Real cortical surface renderer — fsaverage5 mesh in Three.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'

let scene, camera, renderer, brainMesh, regionColors
let meshData = null, regionData = null

// Region → brain state mapping
const REGION_MAP = {
  1: 'contemplation',  // frontal
  2: 'auditory',       // temporal (auditory + language)
  3: 'memory',         // parietal
  4: 'contemplation',  // occipital (visual — map to contemplation for audio)
  5: 'emotion'         // limbic
}

const BASE_COLOR = new THREE.Color(0.92, 0.90, 0.86) // paper
const ACCENT = new THREE.Color(0.17, 0.24, 0.42) // #2c3e6b

export async function initBrainMesh(canvas) {
  // Load mesh data
  const [meshRes, regionRes] = await Promise.all([
    fetch('brain-mesh.json').then(r => r.json()),
    fetch('brain-regions.json').then(r => r.json())
  ])
  meshData = meshRes
  regionData = regionRes

  // Setup Three.js
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0xf5f0e6, 1)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.set(0, 0, 2.8)

  // Build geometry
  const geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array(meshData.vertices)
  const indices = new Uint32Array(meshData.faces)
  
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.computeVertexNormals()

  // Per-vertex colors
  const colors = new Float32Array(meshData.nVertices * 3)
  for (let i = 0; i < meshData.nVertices; i++) {
    colors[i * 3] = BASE_COLOR.r
    colors[i * 3 + 1] = BASE_COLOR.g
    colors[i * 3 + 2] = BASE_COLOR.b
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 20,
    transparent: true,
    opacity: 0.95
  })

  brainMesh = new THREE.Mesh(geometry, material)
  scene.add(brainMesh)

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambient)
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(2, 3, 4)
  scene.add(dir)
  const back = new THREE.DirectionalLight(0x8090b0, 0.3)
  back.position.set(-2, -1, -3)
  scene.add(back)

  regionColors = colors
  resize()
  window.addEventListener('resize', resize)
}

function resize() {
  if (!renderer) return
  const canvas = renderer.domElement
  const w = canvas.clientWidth, h = canvas.clientHeight
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

export function updateBrainMesh(brainState, time) {
  if (!brainMesh || !regionColors || !regionData) return

  // Color vertices based on brain state
  for (let i = 0; i < regionData.length; i++) {
    const region = regionData[i]
    const stateKey = REGION_MAP[region]
    const activation = stateKey ? (brainState[stateKey] || 0) : 0

    // Lerp from base paper color to accent blue based on activation
    const r = BASE_COLOR.r + (ACCENT.r - BASE_COLOR.r) * activation
    const g = BASE_COLOR.g + (ACCENT.g - BASE_COLOR.g) * activation
    const b = BASE_COLOR.b + (ACCENT.b - BASE_COLOR.b) * activation

    regionColors[i * 3] = r
    regionColors[i * 3 + 1] = g
    regionColors[i * 3 + 2] = b
  }

  brainMesh.geometry.attributes.color.needsUpdate = true

  // Slow rotation
  brainMesh.rotation.y = (time || 0) * 0.0003

  renderer.render(scene, camera)
}

export function renderBrainMesh() {
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}
