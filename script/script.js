import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import { createSculpture } from 'https://cdn.jsdelivr.net/npm/shader-park-core@0.2.8/dist/shader-park-core.esm.js';

const edgeNav = document.querySelector('.edge-nav');
const navTab = document.querySelector('.nav-tab');
const preview = document.querySelector('.hover-preview');
const projectList = document.querySelector('#project-list');
const menuProjectList = document.querySelector('#menu-project-list');
const projectSearch = document.querySelector('#project-search');
const paperTexture = document.querySelector('#paper-texture');
const afterimageTitle = document.querySelector('.afterimage-title');
const backgroundVideo = document.querySelector('#background-video');
const backgroundVideoSource = document.querySelector('#background-video-source');
const glassVideo = document.querySelector('#glass-video');
const glassVideoSource = document.querySelector('#glass-video-source');
const glassCanvas = document.querySelector('#glass-canvas');
const glassDisplacement = document.querySelector('#liquid-glass-displacement');
const modeButtons = [...document.querySelectorAll('[data-mode]')];
const iterationSlider = document.querySelector('#iteration-slider');
const iterationValue = document.querySelector('#iteration-value');
const squareFrames = ['assets/square-1.png', 'assets/square-2.png', 'assets/square-3.png', 'assets/square-4.png'];
const paperFrames = ['assets/paper-1.png', 'assets/paper-2.png', 'assets/paper-3.png'];
const circleFrames = ['assets/circle-1.png', 'assets/circle-2.png', 'assets/circle-3.png'];
let glassLensActive = false;
let glassLensMouse = [0, 0];
let glassLensTitle = null;
let resizeGlassLens = () => { };

function getStableTitleLeft(title) {
  let left = 0;
  let node = title;
  while (node && node !== projectList) {
    left += node.offsetLeft;
    node = node.offsetParent;
  }
  return left + 20;
}

function positionGlassLens(title = glassLensTitle) {
  if (!glassCanvas || !title || !projectList) return;
  const titleRect = title.getBoundingClientRect();
  const listRect = projectList.getBoundingClientRect();
  const padding = 0;
  glassCanvas.style.display = 'block';
  glassCanvas.style.left = `${getStableTitleLeft(title)}px`;
  glassCanvas.style.top = `${titleRect.top - listRect.top - padding}px`;
  glassCanvas.style.width = `${titleRect.width + padding * 2}px`;
  glassCanvas.style.height = `${titleRect.height + padding * 2}px`;
  resizeGlassLens();
  glassLensMouse = [glassCanvas.width * .5, glassCanvas.height * .5];
}
if (afterimageTitle) {
  afterimageTitle.innerHTML = [...afterimageTitle.textContent].map((character) => {
    const className = character === ' ' ? 'afterimage-char afterimage-space' : 'afterimage-char';
    return `<span class="${className}">${character}</span>`;
  }).join('');
  const characters = [...afterimageTitle.querySelectorAll('.afterimage-char:not(.afterimage-space)')];
  let gradientOrder = [];
  let previousCharacter;
  const shuffleCharacters = () => {
    gradientOrder = [...characters].sort(() => Math.random() - .5);
    if (gradientOrder[0] === previousCharacter) gradientOrder.push(gradientOrder.shift());
  };
  const animateGradient = () => {
    if (!gradientOrder.length) shuffleCharacters();
    const character = gradientOrder.shift();
    previousCharacter = character;
    character.classList.remove('is-gradient');
    void character.offsetWidth;
    character.classList.add('is-gradient');
    window.setTimeout(() => character.classList.remove('is-gradient'), 680);
  };
  animateGradient();
  window.setInterval(animateGradient, 260);
}

const projects = [
  ['01', 'AIDEN KHALEK', 'selected work'], ['02', 'ANDREA ARELLANO GARCÍA', 'selected work'], ['03', 'AUDREY WAI', 'selected work'],
  ['04', 'BRANDON VUONG', 'selected work'], ['05', 'DARIA OLKOVA', 'selected work'], ['06', 'DAVID PEREZ GARCIA', 'selected work'],
  ['07', 'DENIELLE SABILAY', 'selected work'], ['08', 'EMILY CHAING', 'selected work'], ['09', 'ETHAN KAMIGAKI', 'selected work'],
  ['10', 'EVELYN "EVEE" PALMENO', 'selected work'], ['11', 'JOCELYN MONREAL-VELAZQUEZ', 'selected work'], ['12', 'JOVANNY LICONA', 'selected work'],
  ['13', 'JUPITER KASLER', 'selected work'], ['14', 'KATY YURASH', 'selected work'], ['15', 'KYRA JONES', 'selected work'],
  ['16', 'LAUREN ANDERSON', 'selected work'], ['17', 'LIAH STEVENS', 'selected work'], ['18', 'NABEEHA AHSAN', 'selected work'],
  ['19', 'NGAN VU', 'selected work'], ['20', 'NHAT MINH LE', 'selected work'], ['21', 'NOAH FEKRE', 'selected work'],
  ['22', 'PHIN NGUYEN', 'selected work'], ['23', 'ROSALVA JIMÉNEZ MARTÍNEZ', 'selected work'], ['24', 'RYAN NIKOPOUR', 'selected work'],
  ['25', 'SEAN CRUZ-COLATRIANO', 'selected work'], ['26', 'SYDNEY ANN-ETQ', 'selected work'], ['27', 'SYDNEY SILVA', 'selected work'],
  ['28', 'TPISTA HUYH', 'selected work'], ['29', 'WENYU LIN', 'selected work'], ['30', 'YANHENG MA', 'selected work'], ['31', 'ZUKA ISTANBOOY', 'selected work']
];

function renderProjects(query = '') {
  const filtered = projects.filter((project) => project.join(' ').toLowerCase().includes(query.toLowerCase()));
  const glassLayers = [...projectList.querySelectorAll('.glass-canvas, .glass-video')];
  projectList.innerHTML = '';
  glassLayers.forEach((layer) => projectList.appendChild(layer));
  projectList.insertAdjacentHTML('beforeend', filtered.map(([number, title, meta]) => `
    <a class="project-row" id="project-${number}" href="#project-${number}" data-preview="asset-${number}">
      <img class="project-frame" src="assets/square-1.png" alt="">
      <span class="project-title">${title}</span>
      <span class="project-meta">${number} / ${meta}</span>
    </a>`).join(''));
  menuProjectList.innerHTML = filtered.map(([number, title]) => `<a href="#project-${number}">${number} / ${title}</a>`).join('');
  document.querySelectorAll('.project-row').forEach((row) => {
    row.addEventListener('mouseenter', () => preview.classList.add('is-visible'));
    row.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
  });
  document.querySelectorAll('.project-title').forEach((title) => {
    title.addEventListener('mouseenter', () => {
      glassLensTitle = title;
      glassLensActive = true;
      positionGlassLens(title);
    });
    title.addEventListener('mouseleave', () => {
      glassLensActive = false;
      glassLensTitle = null;
      glassLensMouse = [0, 0];
      if (glassCanvas) glassCanvas.style.display = 'none';
    });
  });
}

renderProjects();
projectSearch.addEventListener('input', (event) => renderProjects(event.target.value));

const modes = {
  dark: 'assets/liquid-metal-bg.mp4',
  light: 'assets/spikes-bg.mp4',
  blank: null
};

function setMode(mode) {
  if (!modes[mode]) {
    document.body.classList.remove('mode-dark', 'mode-light');
    document.body.classList.add('mode-blank');
    backgroundVideo.pause();
    backgroundVideo.removeAttribute('src');
    backgroundVideoSource.removeAttribute('src');
    backgroundVideo.load();
    glassVideo?.pause();
    glassVideoSource?.removeAttribute('src');
    glassVideo?.load();
  } else {
    document.body.classList.remove('mode-dark', 'mode-light', 'mode-blank');
    document.body.classList.add(`mode-${mode}`);
    backgroundVideoSource.src = modes[mode];
    backgroundVideo.load();
    backgroundVideo.play().catch(() => { });
    if (glassVideoSource) glassVideoSource.src = modes[mode];
    glassVideo?.load();
    glassVideo?.play().catch(() => { });
  }
  modeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  window.localStorage.setItem('afterimage-mode', mode);
}

modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
setMode(window.localStorage.getItem('afterimage-mode') || 'light');

let previousScrollY = window.scrollY;
let glassRipple = 12;
let glassRippleFrame;
let glassLensScroll = 0;
function applyGlassRipple() {
  if (glassDisplacement) glassDisplacement.setAttribute('scale', glassRipple.toFixed(2));
  glassLensScroll = Math.min(1.5, glassRipple / 60);
  if (glassVideo) {
    const driftX = Math.sin(window.scrollY * .018) * glassRipple * .12;
    const driftY = Math.cos(window.scrollY * .014) * glassRipple * .08;
    glassVideo.style.transform = `scale(${(1.04 + glassRipple * .002).toFixed(3)}) translate(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px)`;
  }
}
function settleGlassRipple() {
  glassRipple += (22 - glassRipple) * .08;
  applyGlassRipple();
  if (Math.abs(glassRipple - 12) > .1) glassRippleFrame = requestAnimationFrame(settleGlassRipple);
  else glassRippleFrame = 0;
}
window.addEventListener('scroll', () => {
  const scrollDelta = Math.abs(window.scrollY - previousScrollY);
  previousScrollY = window.scrollY;
  glassRipple = Math.min(88, 22 + scrollDelta * 2.2);
  glassLensScroll = Math.min(1.5, glassRipple / 42);
  if (glassLensTitle) positionGlassLens();
  applyGlassRipple();
  if (!glassRippleFrame) glassRippleFrame = requestAnimationFrame(settleGlassRipple);
}, { passive: true });

const glassVertexShader = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;
const glassFragmentShader = `
  precision mediump float;
  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec4 iMouse;
  uniform float iScroll;
  uniform vec4 iRect;
  uniform vec2 iViewport;
  uniform sampler2D iChannel0;

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    const float NUM_ZERO = 0.0;
    const float NUM_ONE = 1.0;
    const float NUM_HALF = 0.5;
    const float NUM_TWO = 2.0;
    const float POWER_EXPONENT = 6.0;
    const float MASK_MULTIPLIER_1 = 10000.0;
    const float MASK_MULTIPLIER_2 = 9500.0;
    const float MASK_MULTIPLIER_3 = 11000.0;
    const float LENS_MULTIPLIER = 5000.0;
    const float MASK_STRENGTH_1 = 8.0;
    const float MASK_STRENGTH_2 = 16.0;
    const float MASK_STRENGTH_3 = 2.0;
    const float MASK_THRESHOLD_1 = 0.95;
    const float MASK_THRESHOLD_2 = 0.9;
    const float MASK_THRESHOLD_3 = 1.5;
    const float SAMPLE_RANGE = 4.0;
    const float SAMPLE_OFFSET = 0.5;
    const float GRADIENT_RANGE = 0.2;
    const float GRADIENT_OFFSET = 0.1;
    const float GRADIENT_EXTREME = -1000.0;
    const float LIGHTING_INTENSITY = 0.3;

    vec2 uv = fragCoord / iResolution.xy;
    if (iMouse.z < 0.5) {
      fragColor = vec4(0.0);
      return;
    }
    vec2 screenPx = vec2(iRect.x + fragCoord.x, iRect.y + (iRect.w - fragCoord.y));
    vec2 baseUv = screenPx / iViewport;
    baseUv.y = NUM_ONE - baseUv.y;
    vec2 mouse = iMouse.xy;
    if (length(mouse) < NUM_ONE) mouse = iResolution.xy / NUM_TWO;
    vec2 m2 = uv - mouse / iResolution.xy;
    float scrollPulse = clamp(iScroll, NUM_ZERO, 1.2);
    m2 += vec2(sin(iTime * .8), cos(iTime * .65)) * .006 * scrollPulse;

    float roundedBox = pow(abs(m2.x * iResolution.x / iResolution.y), POWER_EXPONENT) + pow(abs(m2.y), POWER_EXPONENT);
    float rb1 = clamp((NUM_ONE - roundedBox * MASK_MULTIPLIER_1) * MASK_STRENGTH_1, NUM_ZERO, NUM_ONE);
    float rb2 = clamp((MASK_THRESHOLD_1 - roundedBox * MASK_MULTIPLIER_2) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE) - clamp(pow(MASK_THRESHOLD_2 - roundedBox * MASK_MULTIPLIER_2, NUM_ONE) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);
    float rb3 = clamp((MASK_THRESHOLD_3 - roundedBox * MASK_MULTIPLIER_3) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE) - clamp(pow(NUM_ONE - roundedBox * MASK_MULTIPLIER_3, NUM_ONE) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);

    fragColor = vec4(NUM_ZERO);
    float transition = NUM_ONE;
    if (transition > NUM_ZERO) {
      vec2 lens = uv + (uv - NUM_HALF) * (.08 + scrollPulse * .18) + vec2(sin(uv.y * 10.0 + iTime) * .012, cos(uv.x * 9.0 - iTime) * .012);
      vec2 warp = lens - uv;
      vec2 refractedUv = clamp(baseUv + warp, .01, .99);
      float total = NUM_ZERO;
      for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
        for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
          vec2 offset = vec2(x, y) * SAMPLE_OFFSET / iViewport;
          fragColor += texture2D(iChannel0, offset + refractedUv);
          total += NUM_ONE;
        }
      }
      fragColor /= total;
      float gradient = clamp((clamp(m2.y, NUM_ZERO, GRADIENT_RANGE) + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE) + clamp((clamp(-m2.y, GRADIENT_EXTREME, GRADIENT_RANGE) * rb3 + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE);
      vec4 lighting = clamp(fragColor + vec4(.035, .06, .07, .0) * (gradient + .45) + vec4(scrollPulse * .025), NUM_ZERO, NUM_ONE);
      fragColor = mix(texture2D(iChannel0, baseUv), lighting, .99);
    } else {
      fragColor = vec4(NUM_ZERO);
    }
  }

  void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
`;

function setupGlassShader() {
  if (!glassCanvas || !glassVideo) return;
  const gl = glassCanvas.getContext('webgl', { alpha: true, antialias: true });
  if (!gl) return;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, glassVertexShader));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, glassFragmentShader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = {
    resolution: gl.getUniformLocation(program, 'iResolution'),
    time: gl.getUniformLocation(program, 'iTime'),
    mouse: gl.getUniformLocation(program, 'iMouse'),
    scroll: gl.getUniformLocation(program, 'iScroll'),
    rect: gl.getUniformLocation(program, 'iRect'),
    viewport: gl.getUniformLocation(program, 'iViewport'),
    texture: gl.getUniformLocation(program, 'iChannel0')
  };
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const resize = () => {
    const rect = glassCanvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    glassCanvas.width = Math.max(1, Math.floor(rect.width * ratio));
    glassCanvas.height = Math.max(1, Math.floor(rect.height * ratio));
    gl.viewport(0, 0, glassCanvas.width, glassCanvas.height);
  };
  resizeGlassLens = resize;
  window.addEventListener('resize', () => {
    if (glassLensTitle) positionGlassLens();
    else resize();
  });
  if (window.ResizeObserver) new ResizeObserver(resize).observe(projectList);
  resize();
  const render = (now) => {
    const sourceVideo = backgroundVideo || glassVideo;
    if (sourceVideo && sourceVideo.readyState >= 2 && sourceVideo.videoWidth) {
      const rect = glassCanvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      gl.uniform3f(uniforms.resolution, glassCanvas.width, glassCanvas.height, 1);
      gl.uniform1f(uniforms.time, now * .001);
      gl.uniform4f(uniforms.mouse, glassLensMouse[0], glassLensMouse[1], glassLensActive ? 1 : 0, 0);
      gl.uniform1f(uniforms.scroll, glassLensScroll);
      gl.uniform4f(uniforms.rect, rect.left * ratio, rect.top * ratio, rect.width * ratio, rect.height * ratio);
      gl.uniform2f(uniforms.viewport, window.innerWidth * ratio, window.innerHeight * ratio);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceVideo);
      gl.uniform1i(uniforms.texture, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

if (glassVideo || backgroundVideo) {
  const sourceVideo = backgroundVideo || glassVideo;
  if (sourceVideo.readyState >= 2) setupGlassShader();
  else sourceVideo.addEventListener('canplay', setupGlassShader, { once: true });
}

let squareFrameIndex = 0;
let paperFrameIndex = 0;
let circleFrameIndex = 0;
setInterval(() => {
  squareFrameIndex = (squareFrameIndex + 1) % squareFrames.length;
  circleFrameIndex = (circleFrameIndex + 1) % circleFrames.length;
  document.querySelectorAll('.project-frame').forEach((frame, index) => {
    frame.src = squareFrames[(squareFrameIndex + index) % squareFrames.length];
  });
  document.querySelectorAll('.circle-link').forEach((link, index) => {
    const art = link.querySelector('.circle-art');
    if (art) art.src = circleFrames[(circleFrameIndex + index) % circleFrames.length];
  });
}, 240);
setInterval(() => {
  paperFrameIndex = (paperFrameIndex + 1) % paperFrames.length;
  paperTexture.style.backgroundImage = `url('${paperFrames[paperFrameIndex]}')`;
}, 320);

const backgroundStage = document.querySelector('.background-stage');
const backgroundSections = document.querySelectorAll('[data-background]');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0, 4.8);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.setClearAlpha(0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
const threeStage = document.querySelector('#three-stage');
threeStage.appendChild(renderer.domElement);
renderer.domElement.style.background = 'transparent';
scene.background = null;

const objectGroup = new THREE.Group();
scene.add(objectGroup);
const shaderMouse = new THREE.Vector3(.5, .5, .5);
let shaderMaxIterations = Number(iterationSlider?.value || 18);
const shaderSourceTemplate = function () {
  setMaxIterations(18);
  setStepSize(.9);
  rotateY(-0.1 * time);
  let n = noise(getSpace() * 40 + time + 10000000);
  let col = normal * .01 * (getRayDirection() + 1) + n * nsin(time);
  color(col);
  metal(5);
  rotateY(time * .5)
  rotateY(getRayDirection().y * 2 + time * .2)
  boxFrame(vec3(.6), .02);
  sphere(.2);
};
function buildShaderMesh(iterations) {
  const safeIterations = Math.max(4, Math.min(32, Math.round(Number(iterations) || 18)));
  const shaderSource = shaderSourceTemplate.toString().replace('setMaxIterations(18)', `setMaxIterations(${safeIterations})`);
  const shaderSculpture = Function(`return (${shaderSource});`)();
  const mesh = createSculpture(shaderSculpture, () => ({
    time: performance.now() / 1000,
    mouse: shaderMouse
  }), { radius: 1.05, segments: 64 });
  mesh.material.transparent = false;
  mesh.material.opacity = 1;
  mesh.material.depthWrite = true;
  mesh.material.needsUpdate = true;
  return mesh;
}
let shaderMesh = buildShaderMesh(shaderMaxIterations);
objectGroup.position.set(0, -.35, 0);
objectGroup.add(shaderMesh);
if (iterationSlider) {
  iterationSlider.addEventListener('input', () => {
    shaderMaxIterations = Number(iterationSlider.value);
    if (iterationValue) iterationValue.value = String(shaderMaxIterations);
    if (iterationValue) iterationValue.textContent = String(shaderMaxIterations);
    const nextMesh = buildShaderMesh(shaderMaxIterations);
    objectGroup.remove(shaderMesh);
    shaderMesh.geometry?.dispose();
    shaderMesh.material?.dispose();
    shaderMesh = nextMesh;
    objectGroup.add(shaderMesh);
  });
}
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;
controls.enableDamping = true;

function resizeThree() {
  const width = threeStage.clientWidth;
  const height = threeStage.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
resizeThree();
window.addEventListener('resize', resizeThree);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

const backgroundObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const isWork = entry.target.dataset.background === 'work';
    backgroundStage.classList.toggle('work-background', isWork);
  });
}, { threshold: .25 });
backgroundSections.forEach((section) => backgroundObserver.observe(section));

let hideTimer;

function showNav() {
  edgeNav.classList.remove('is-closed');
  edgeNav.classList.add('is-visible');
  navTab.setAttribute('aria-expanded', 'true');
  scheduleNavHide();
}

function hideNav() {
  if (!edgeNav.matches(':hover') && !edgeNav.matches(':focus-within')) {
    edgeNav.classList.remove('is-visible');
    navTab.setAttribute('aria-expanded', 'false');
  }
}

function closeNav() {
  clearTimeout(hideTimer);
  edgeNav.classList.remove('is-visible');
  edgeNav.classList.add('is-closed');
  navTab.setAttribute('aria-expanded', 'false');
}

function toggleNav() {
  if (edgeNav.classList.contains('is-visible')) {
    closeNav();
    return;
  }
  showNav();
}

function scheduleNavHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideNav, 900);
}

window.addEventListener('mousemove', (event) => {
  if (window.innerWidth > 700 && event.clientX > window.innerWidth - 80) showNav();
});

navTab.addEventListener('click', toggleNav);
edgeNav.addEventListener('mouseleave', scheduleNavHide);
edgeNav.addEventListener('mouseenter', () => clearTimeout(hideTimer));
document.addEventListener('pointerdown', (event) => {
  if (!edgeNav.contains(event.target)) hideNav();
});

document.querySelectorAll('.nav-panel a').forEach((link) => {
  link.addEventListener('click', () => {
    scheduleNavHide();
  });
});

window.addEventListener('mousemove', (event) => {
  if (preview.classList.contains('is-visible')) {
    preview.style.left = `${event.clientX}px`;
    preview.style.top = `${event.clientY}px`;
  }
});
