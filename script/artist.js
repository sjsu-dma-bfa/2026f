const artistVideo = document.querySelector('#artist-video');
const modeButtons = [...document.querySelectorAll('[data-mode]')];
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const modeSources = {
  light: '../../assets/spikes-bg.mp4',
  dark: '../../assets/liquid-metal-bg.mp4',
  blank: ''
};

document.querySelectorAll('.artist-video-card video').forEach((video) => {
  video.muted = false;
  video.defaultMuted = false;
  video.volume = 1;
});

function startGridTransition(href) {
  if (document.querySelector('.grid-transition')) return;
  sessionStorage.setItem('afterimage-grid-reveal', '1');
  const columns = Math.ceil(window.innerWidth / 72);
  const rows = Math.ceil(window.innerHeight / 72);
  const overlay = document.createElement('div');
  overlay.className = 'grid-transition';
  overlay.style.setProperty('--grid-columns', columns);
  overlay.style.setProperty('--grid-rows', rows);
  overlay.insertAdjacentHTML('beforeend', '<div class="grid-transition-status"><span>Loading</span></div>');
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const tile = document.createElement('span');
      tile.className = 'grid-transition-tile';
      tile.style.setProperty('--row', row);
      tile.style.setProperty('--col', col);
      const index = row * columns + col;
      const entryValues = [
        ['0px', '112vh', '0deg'],
        ['0px', '-112vh', '180deg'],
        ['-112vw', '0px', '-90deg'],
        ['112vw', '0px', '90deg']
      ][index % 4];
      tile.style.setProperty('--entry-x', entryValues[0]);
      tile.style.setProperty('--entry-y', entryValues[1]);
      tile.style.setProperty('--entry-rotate', entryValues[2]);
      overlay.appendChild(tile);
    }
  }
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-active'));
  window.setTimeout(() => window.location.assign(href), 1100);
}

function revealGridTransition() {
  if (sessionStorage.getItem('afterimage-grid-reveal') !== '1') return;
  sessionStorage.removeItem('afterimage-grid-reveal');
  const columns = Math.ceil(window.innerWidth / 72);
  const rows = Math.ceil(window.innerHeight / 72);
  const overlay = document.createElement('div');
  overlay.className = 'grid-transition is-active';
  overlay.style.setProperty('--grid-columns', columns);
  overlay.style.setProperty('--grid-rows', rows);
  overlay.insertAdjacentHTML('beforeend', '<div class="grid-transition-status"><span>Loading</span></div>');
  const exitDirections = [
    ['0px', '-112vh', '180deg'],
    ['0px', '112vh', '0deg'],
    ['-112vw', '0px', '-90deg'],
    ['112vw', '0px', '90deg']
  ];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const tile = document.createElement('span');
      tile.className = 'grid-transition-tile';
      tile.style.setProperty('--row', row);
      tile.style.setProperty('--col', col);
      const exitValues = exitDirections[(row * columns + col) % exitDirections.length];
      tile.style.setProperty('--entry-x', '0px');
      tile.style.setProperty('--entry-y', '0px');
      tile.style.setProperty('--entry-rotate', '0deg');
      tile.style.setProperty('--exit-x', exitValues[0]);
      tile.style.setProperty('--exit-y', exitValues[1]);
      tile.style.setProperty('--exit-rotate', exitValues[2]);
      overlay.appendChild(tile);
    }
  }
  document.body.appendChild(overlay);
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-revealing')));
  window.setTimeout(() => overlay.remove(), 1900);
}

revealGridTransition();

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || link.target === '_blank' || link.classList.contains('lightbox-trigger')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin || (destination.pathname === window.location.pathname && destination.hash)) return;
  if (destination.pathname === window.location.pathname) return;
  event.preventDefault();
  startGridTransition(destination.href);
});

function setArtistMode(mode) {
  const nextMode = modeSources[mode] ? mode : 'blank';
  document.body.classList.remove('mode-light', 'mode-dark', 'mode-blank');
  document.body.classList.add(`mode-${nextMode}`);
  if (artistVideo) {
    if (modeSources[nextMode]) {
      artistVideo.src = modeSources[nextMode];
      artistVideo.style.display = 'block';
      artistVideo.play().catch(() => {});
    } else {
      artistVideo.pause();
      artistVideo.removeAttribute('src');
      artistVideo.load();
      artistVideo.style.display = 'none';
    }
  }
  modeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.mode === nextMode));
  localStorage.setItem('afterimage-mode', nextMode);
}

modeButtons.forEach((button) => button.addEventListener('click', () => setArtistMode(button.dataset.mode)));
setArtistMode(localStorage.getItem('afterimage-mode') || 'light');

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('is-open');
  lightboxImage?.removeAttribute('src');
  document.body.style.overflow = '';
}

document.querySelectorAll('.lightbox-trigger').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = trigger.href;
    lightboxImage.alt = trigger.querySelector('img')?.alt || '';
    if (lightboxCaption) lightboxCaption.textContent = trigger.dataset.caption || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
});
lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});
