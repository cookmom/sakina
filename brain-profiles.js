// بسم الله الرحمن الرحيم
// SVG Brain Profiles — Side, Front, Top views with animated regions

const ACCENT = '#2c3e6b'

function regionColor(val) {
  const r = Math.round(245 - (245 - 44) * val)
  const g = Math.round(240 - (240 - 62) * val)
  const b = Math.round(230 - (230 - 107) * val)
  return `rgb(${r},${g},${b})`
}

function ellipse(cx, cy, rx, ry, val, label) {
  const sw = (0.5 + val).toFixed(1)
  const op = (0.3 + val * 0.5).toFixed(2)
  const fill = regionColor(val)
  let html = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${ACCENT}" stroke-width="${sw}" opacity="${op}"/>`
  if (label) {
    html += `<text x="${cx}" y="${cy + 3}" font-size="7" fill="${ACCENT}" text-anchor="middle" opacity="${(0.4 + val * 0.5).toFixed(2)}" font-family="var(--font)" letter-spacing=".06em">${label}</text>`
  }
  return html
}

export function drawBrainProfiles(brain) {
  const step = brain._step !== undefined ? brain._step : '—'
  const total = brain._total || '—'
  const label = document.getElementById('brainStepLabel')
  if (label) label.textContent = step + ' / ' + total + ' timesteps'

  const a = {
    frontal: brain.contemplation || 0,
    temporal: brain.auditory || 0,
    parietal: brain.memory || 0,
    occipital: Math.max(brain.contemplation || 0, 0.1),
    limbic: brain.emotion || 0
  }

  // SIDE PROFILE
  const side = document.getElementById('brainSide')
  if (side) {
    side.innerHTML = `
      <path d="M150,20 C200,20 250,50 260,100 C270,150 265,180 250,210 C240,230 220,255 200,270 C180,280 160,285 140,280 C120,275 100,270 80,265 C60,255 50,240 45,220 C40,200 42,170 50,140 C55,120 65,90 80,60 C95,35 120,20 150,20Z" fill="none" stroke="rgba(80,70,55,.2)" stroke-width="1.5"/>
      <ellipse cx="42" cy="185" rx="12" ry="20" fill="none" stroke="rgba(80,70,55,.12)" stroke-width="1"/>
      <path d="M260,180 C270,190 272,210 265,220" fill="none" stroke="rgba(80,70,55,.12)" stroke-width="1"/>
      <ellipse cx="240" cy="170" rx="10" ry="5" fill="none" stroke="rgba(80,70,55,.1)" stroke-width="1"/>
      ${ellipse(200, 80, 55, 45, a.frontal, 'FRONTAL')}
      ${ellipse(120, 180, 50, 30, a.temporal, 'TEMPORAL')}
      ${ellipse(140, 70, 40, 35, a.parietal, 'PARIETAL')}
      ${ellipse(80, 120, 30, 40, a.occipital, 'OCCIPITAL')}
      ${ellipse(160, 150, 25, 20, a.limbic, 'LIMBIC')}
      <text x="150" y="295" font-size="9" fill="rgba(80,70,55,.35)" text-anchor="middle" font-family="var(--font)" letter-spacing=".1em">SIDE</text>
    `
  }

  // FRONT PROFILE
  const front = document.getElementById('brainFront')
  if (front) {
    front.innerHTML = `
      <ellipse cx="125" cy="130" rx="90" ry="110" fill="none" stroke="rgba(80,70,55,.2)" stroke-width="1.5"/>
      <ellipse cx="95" cy="165" rx="12" ry="6" fill="none" stroke="rgba(80,70,55,.1)" stroke-width="1"/>
      <ellipse cx="155" cy="165" rx="12" ry="6" fill="none" stroke="rgba(80,70,55,.1)" stroke-width="1"/>
      <line x1="125" y1="170" x2="125" y2="200" stroke="rgba(80,70,55,.08)" stroke-width="1"/>
      <ellipse cx="33" cy="160" rx="8" ry="18" fill="none" stroke="rgba(80,70,55,.1)" stroke-width="1"/>
      <ellipse cx="217" cy="160" rx="8" ry="18" fill="none" stroke="rgba(80,70,55,.1)" stroke-width="1"/>
      ${ellipse(90, 80, 40, 35, a.frontal, '')}
      ${ellipse(160, 80, 40, 35, a.frontal, '')}
      ${ellipse(55, 150, 25, 30, a.temporal, '')}
      ${ellipse(195, 150, 25, 30, a.temporal, '')}
      ${ellipse(125, 130, 20, 25, a.limbic, '')}
      <text x="125" y="295" font-size="9" fill="rgba(80,70,55,.35)" text-anchor="middle" font-family="var(--font)" letter-spacing=".1em">FRONT</text>
    `
  }

  // TOP VIEW
  const top = document.getElementById('brainTop')
  if (top) {
    top.innerHTML = `
      <ellipse cx="125" cy="125" rx="100" ry="80" fill="none" stroke="rgba(80,70,55,.2)" stroke-width="1.5"/>
      <line x1="125" y1="45" x2="125" y2="205" stroke="rgba(80,70,55,.08)" stroke-width="0.5"/>
      ${ellipse(125, 70, 60, 25, a.frontal, 'FRONTAL')}
      ${ellipse(70, 120, 35, 30, a.parietal, '')}
      ${ellipse(180, 120, 35, 30, a.parietal, '')}
      ${ellipse(125, 180, 45, 22, a.occipital, 'OCCIPITAL')}
      <text x="125" y="245" font-size="9" fill="rgba(80,70,55,.35)" text-anchor="middle" font-family="var(--font)" letter-spacing=".1em">TOP</text>
    `
  }
}
