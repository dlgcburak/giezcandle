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

// --- Admin panel (front-end only, stores edits in localStorage) ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'giez1234';
const STORAGE_KEY = 'giez-content';
const SESSION_KEY = 'giez-admin';

const editableEls = Array.from(document.querySelectorAll('[data-edit-key]'));
const defaults = {};
editableEls.forEach((el) => {
  const key = el.dataset.editKey;
  if (!key) return;
  defaults[key] = (el.textContent || '').trim();
});

const adminToggle = document.getElementById('adminToggle');
const adminOverlay = document.getElementById('adminOverlay');
const adminClose = document.getElementById('adminClose');
const loginForm = document.getElementById('loginForm');
const adminForm = document.getElementById('adminForm');
const adminLogin = document.getElementById('adminLogin');
const adminControls = document.getElementById('adminControls');
const adminError = document.getElementById('adminError');
const adminReset = document.getElementById('adminReset');
const adminLogout = document.getElementById('adminLogout');

function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('Kaydedilen içerik okunamadı:', err);
    return {};
  }
}

let overrides = loadOverrides();

function getValue(key) {
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    return overrides[key];
  }
  return defaults[key] ?? '';
}

function applyContent() {
  editableEls.forEach((el) => {
    const key = el.dataset.editKey;
    if (!key) return;
    el.textContent = getValue(key);
  });
}

applyContent();

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function showLogin() {
  if (!adminLogin || !adminControls) return;
  adminLogin.hidden = false;
  adminControls.hidden = true;
  if (adminError) adminError.hidden = true;
}

function renderAdminForm() {
  if (!adminForm) return;
  adminForm.innerHTML = '';

  editableEls.forEach((el) => {
    const key = el.dataset.editKey;
    if (!key) return;
    const label = el.dataset.editLabel || key;
    const type = el.dataset.editType === 'textarea' ? 'textarea' : 'text';

    const wrapper = document.createElement('label');
    wrapper.className = 'admin-field';

    const title = document.createElement('span');
    title.textContent = label;
    wrapper.appendChild(title);

    const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    if (type !== 'textarea') {
      input.type = 'text';
    } else {
      input.rows = 3;
    }
    input.name = key;
    input.value = getValue(key);
    wrapper.appendChild(input);

    adminForm.appendChild(wrapper);
  });

  const hiddenSubmit = document.createElement('button');
  hiddenSubmit.type = 'submit';
  hiddenSubmit.hidden = true;
  adminForm.appendChild(hiddenSubmit);
}

function showAdminForm() {
  if (!adminLogin || !adminControls) return;
  adminLogin.hidden = true;
  adminControls.hidden = false;
  renderAdminForm();
}

function openAdmin() {
  if (!adminOverlay) return;
  adminOverlay.classList.add('open');
  if (isLoggedIn()) {
    showAdminForm();
  } else {
    showLogin();
  }
}

function closeAdminPanel() {
  adminOverlay?.classList.remove('open');
}

adminToggle?.addEventListener('click', openAdmin);
adminClose?.addEventListener('click', closeAdminPanel);
adminOverlay?.addEventListener('click', (e) => {
  if (e.target === adminOverlay) {
    closeAdminPanel();
  }
});

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const user = String(formData.get('user') ?? '').trim();
  const pass = String(formData.get('pass') ?? '').trim();

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem(SESSION_KEY, '1');
    if (adminError) adminError.hidden = true;
    showAdminForm();
  } else if (adminError) {
    adminError.hidden = false;
  }
});

adminForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(adminForm);
  const next = {};

  editableEls.forEach((el) => {
    const key = el.dataset.editKey;
    if (!key) return;
    const value = String(formData.get(key) ?? '');
    if (defaults[key] === undefined && !value) {
      return;
    }
    if (value !== defaults[key]) {
      next[key] = value;
    }
  });

  overrides = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  applyContent();
});

adminReset?.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  overrides = {};
  applyContent();
  renderAdminForm();
});

adminLogout?.addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && adminOverlay?.classList.contains('open')) {
    closeAdminPanel();
  }
});
