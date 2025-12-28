import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

inject();
injectSpeedInsights();

const yearEl = document.getElementById('y');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const lb = document.getElementById('lightbox');
const img = document.getElementById('lightImg');
const closeBtn = document.getElementById('close');

function openLightbox(src) {
  if (!lb || !img) {
    return;
  }

  img.src = src;
  lb.classList.add('open');
  if (closeBtn) {
    closeBtn.focus();
  }
}

function closeLightbox() {
  if (!lb || !img) {
    return;
  }

  lb.classList.remove('open');
  img.removeAttribute('src');
}

document.querySelectorAll('[data-img]').forEach((el) => {
  el.addEventListener('click', () => openLightbox(el.getAttribute('data-img')));
});

if (closeBtn) {
  closeBtn.addEventListener('click', closeLightbox);
}

if (lb) {
  lb.addEventListener('click', (e) => {
    if (e.target === lb) {
      closeLightbox();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lb?.classList.contains('open')) {
    closeLightbox();
  }
});
