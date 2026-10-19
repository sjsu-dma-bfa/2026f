import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const edgeNav = document.querySelector('.edge-nav');
const navTab = document.querySelector('.nav-tab');
const preview = document.querySelector('.hover-preview');
const projectList = document.querySelector('#project-list');
const menuProjectList = document.querySelector('#menu-project-list');
const projectSearch = document.querySelector('#project-search');
const paperTexture = document.querySelector('#paper-texture');
const squareFrames = ['assets/square-1.png', 'assets/square-2.png', 'assets/square-3.png', 'assets/square-4.png'];
const paperFrames = ['assets/paper-1.png', 'assets/paper-2.png', 'assets/paper-3.png'];
const circleFrames = [
  { image: 'assets/circle-1.png', position: 'center', rotation: '-4deg', scale: '1' },
  { image: 'assets/circle-2.png', position: 'center', rotation: '2deg', scale: '1.06' },
  { image: 'assets/circle-3.png', position: 'center', rotation: '-1deg', scale: '.96' }
];

const projects = [
  ['01', 'Digital Room', 'web / interactive'], ['02', 'Soft Signal', 'image / motion'], ['03', 'Folder Memory', 'archive / web'],
  ['04', 'Afterimage Index', 'editorial / web'], ['05', 'Blue Screen', 'image / study'], ['06', 'Night Protocol', 'interface / motion'],
  ['07', 'Quiet System', 'web / research'], ['08', 'Open Circuit', 'interactive / code'], ['09', 'False Start', 'image / archive'],
  ['10', 'Remote Window', 'web / interface'], ['11', 'Low Resolution', 'image / study'], ['12', 'Second Surface', 'motion / web'],
  ['13', 'Soft Hardware', 'object / digital'], ['14', 'Memory Cache', 'archive / interface'], ['15', 'Static Bloom', 'image / motion'],
  ['16', 'Local Time', 'web / editorial'], ['17', 'Blue Folder', 'archive / web'], ['18', 'Signal Loss', 'image / study'],
  ['19', 'Temporary Room', 'interactive / space'], ['20', 'Slow Index', 'editorial / archive'], ['21', 'Night Shift', 'motion / interface'],
  ['22', 'Screen Test', 'image / web'], ['23', 'Soft Error', 'code / interactive'], ['24', 'Open Folder', 'archive / digital'],
  ['25', 'After Hours', 'web / motion'], ['26', 'Empty State', 'interface / study'], ['27', 'Low Battery', 'image / object'],
  ['28', 'Last Login', 'web / archive'], ['29', 'Future Memory', 'digital / research'], ['30', 'Endless Loop', 'motion / interactive']
];

function renderProjects(query = '') {
  const filtered = projects.filter((project) => project.join(' ').toLowerCase().includes(query.toLowerCase()));
  const placeholderTitle = 'PROJECT NAME';
  projectList.innerHTML = filtered.map(([number, title, meta]) => `
    <a class="project-row" id="project-${number}" href="#project-${number}" data-preview="asset-${number}">
      <img class="project-frame" src="assets/square-1.png" alt="">
      <span class="project-title">${placeholderTitle}</span>
      <span class="project-meta">${number} / ${meta}</span>
    </a>`).join('');
  menuProjectList.innerHTML = filtered.map(([number]) => `<a href="#project-${number}">${number} / ${placeholderTitle}</a>`).join('');
  document.querySelectorAll('.project-row').forEach((row) => {
    row.addEventListener('mouseenter', () => preview.classList.add('is-visible'));
    row.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
  });
}

renderProjects();
projectSearch.addEventListener('input', (event) => renderProjects(event.target.value));

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
    const offset = (circleFrameIndex + index) % circleFrames.length;
    const frame = circleFrames[offset];
      const art = link.querySelector('.circle-art');
      if (art) art.src = frame.image;
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
const threeStage = document.querySelector('#three-stage');
threeStage.appendChild(renderer.domElement);

const objectGroup = new THREE.Group();
scene.add(objectGroup);
const material = new THREE.MeshPhysicalMaterial({
  color: 0xdfe9e2,
  roughness: .15,
  metalness: .08,
  transmission: .62,
  transparent: true,
  opacity: .82,
  clearcoat: 1,
  clearcoatRoughness: .1
});
const ringMaterial = new THREE.MeshPhysicalMaterial({ color: 0xdfe9e2, roughness: .16, metalness: .08, transmission: .5, transparent: true, opacity: .86, clearcoat: 1 });
const ringOne = new THREE.Mesh(new THREE.TorusGeometry(1.15, .035, 18, 160), ringMaterial);
const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(1.15, .035, 18, 160), ringMaterial.clone());
const ringThree = new THREE.Mesh(new THREE.TorusGeometry(.86, .028, 18, 140), ringMaterial.clone());
ringTwo.rotation.x = Math.PI / 2.7;
ringTwo.rotation.y = Math.PI / 8;
ringThree.rotation.x = Math.PI / 3.2;
ringThree.rotation.z = -Math.PI / 5;
objectGroup.add(ringOne, ringTwo, ringThree);
const dotGroup = new THREE.Group();
const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x050706, transparent: true, opacity: .82 });
const dots = [
  [-1.7, 1.18, -.25, .055], [-1.28, .78, -.32, .035], [-.98, 1.46, -.18, .028],
  [.82, 1.42, -.24, .046], [1.42, 1.02, -.2, .032], [1.7, .35, -.3, .065],
  [-1.76, -.38, -.26, .04], [-1.42, -.98, -.22, .065], [-.72, -1.4, -.2, .032],
  [.1, -1.52, -.28, .05], [1.02, -1.2, -.25, .038], [1.7, -.78, -.32, .03],
  [-.3, .72, -.52, .026], [.36, -.72, -.5, .035]
];
dots.forEach(([x, y, z, radius]) => {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), dotMaterial);
  dot.position.set(x, y, z);
  dotGroup.add(dot);
});
scene.add(dotGroup);
scene.add(new THREE.HemisphereLight(0xf4f2ec, 0x708c86, 2.8));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(2, 3, 4);
scene.add(keyLight);
const fillLight = new THREE.PointLight(0xa9d4cc, 1.8, 6);
fillLight.position.set(-2, -1, 2);
scene.add(fillLight);
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
  ringOne.rotation.z += 0.004;
  ringTwo.rotation.x += 0.0025;
  ringTwo.rotation.y -= 0.003;
  ringThree.rotation.y += 0.0045;
  ringThree.rotation.z -= 0.002;
  dotGroup.rotation.y -= 0.0008;
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

function scheduleNavHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideNav, 900);
}

window.addEventListener('mousemove', (event) => {
  if (window.innerWidth > 700 && event.clientX > window.innerWidth - 80) showNav();
});

navTab.addEventListener('click', showNav);
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
