// بسم الله الرحمن الرحيم
// 3D Brain Viewer — real anatomical model colored by TRIBE v2 data

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/OBJLoader.js'

let scene, camera, renderer, brainGroup
let initialized = false

const PAPER = new THREE.Color(0xf5f0e6)
const ACCENT = new THREE.Color(0x2c3e6b)
const WARM = new THREE.Color(0xc44020)

export async function initBrain3DReal(canvas) {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0xf5f0e6, 1)
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
  camera.position.set(0, 30, 120)
  camera.lookAt(0, 10, 0)

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dir = new THREE.DirectionalLight(0xffffff, 0.8)
  dir.position.set(50, 80, 60)
  scene.add(dir)
  const back = new THREE.DirectionalLight(0x8090b0, 0.3)
  back.position.set(-30, -20, -40)
  scene.add(back)

  // Load brain OBJ
  const loader = new OBJLoader()
  try {
    const obj = await new Promise((resolve, reject) => {
      loader.load('static/brain_vertex_low.obj', resolve, undefined, reject)
    })
    
    brainGroup = obj
    // Center the model
    const box = new THREE.Box3().setFromObject(obj)
    const center = box.getCenter(new THREE.Vector3())
    obj.position.sub(center)
    
    // Set default material — semi-transparent brain
    obj.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhongMaterial({
          color: 0xd8d0c4,
          transparent: true,
          opacity: 0.85,
          shininess: 30,
          vertexColors: false
        })
        // Enable per-vertex coloring
        const colors = new Float32Array(child.geometry.attributes.position.count * 3)
        for (let i = 0; i < colors.length; i += 3) {
          colors[i] = 0.85; colors[i+1] = 0.82; colors[i+2] = 0.77
        }
        child.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      }
    })
    
    scene.add(obj)
    initialized = true
    renderBrain3D()
    console.log('3D brain model loaded:', box.getSize(new THREE.Vector3()))
  } catch(e) {
    console.error('Failed to load brain model:', e)
  }
}

export function updateBrain3DReal(brainState, time) {
  if (!initialized || !brainGroup) return
  
  // Rotate slowly
  brainGroup.rotation.y = (time || 0) * 0.0002
  
  // Color vertices based on brain state regions
  // Map vertex Y position to brain regions:
  // Top (high Y) = parietal/frontal
  // Middle = temporal/limbic  
  // Bottom (low Y) = temporal/occipital
  // Front (high Z) = frontal
  // Back (low Z) = occipital
  brainGroup.traverse(child => {
    if (!child.isMesh || !child.geometry.attributes.color) return
    
    const pos = child.geometry.attributes.position
    const col = child.geometry.attributes.color
    const count = pos.count
    
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      
      // Determine region based on position
      let activation = 0
      const absX = Math.abs(x)
      
      if (z > 10) {
        // Frontal
        activation = brainState.contemplation || 0
      } else if (z < -10) {
        // Occipital
        activation = Math.max(brainState.contemplation || 0, 0.1)
      } else if (absX > 20 && y < 10) {
        // Temporal
        activation = brainState.auditory || 0
      } else if (y > 20) {
        // Parietal
        activation = brainState.memory || 0
      } else {
        // Limbic/deep
        activation = brainState.emotion || 0
      }
      
      // Lerp from base grey to accent+warm based on activation
      const base_r = 0.85, base_g = 0.82, base_b = 0.77
      const hot_r = 0.8 + activation * 0.2
      const hot_g = 0.3 * (1 - activation) + 0.82 * (1 - activation)
      const hot_b = 0.15 * activation + 0.77 * (1 - activation)
      
      col.setXYZ(i,
        base_r + (hot_r - base_r) * activation,
        base_g + (hot_g - base_g) * activation,
        base_b + (hot_b - base_b) * activation
      )
    }
    
    col.needsUpdate = true
    child.material.vertexColors = true
    child.material.needsUpdate = true
  })
  
  renderBrain3D()
}

export function renderBrain3D() {
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

// Handle resize
export function resizeBrain3D(canvas) {
  if (!renderer || !canvas) return
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
  camera.aspect = canvas.clientWidth / canvas.clientHeight
  camera.updateProjectionMatrix()
  renderBrain3D()
}
