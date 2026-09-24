// popup.js — UI logic for JSONtap extension

const $ = id => document.getElementById(id);

let endpoints = [];
let isEnabled = false;
let captureCount = 0;

// ── Storage helpers ──────────────────────────────────────────────────────────

function load(cb) {
  // The theme is handled by theme/theme-select.js (localStorage); drop the old NEO/RINK key.
  chrome.storage.local.remove('theme');
  chrome.storage.local.get(['endpoints', 'enabled', 'captureCount'], data => {
    endpoints    = data.endpoints    ?? [];
    isEnabled    = data.enabled      ?? false;
    captureCount = data.captureCount ?? 0;
    cb();
  });
}

function save() {
  chrome.storage.local.set({ endpoints, enabled: isEnabled, captureCount });
}

// ── Render ───────────────────────────────────────────────────────────────────

function render() {
  // Toggle
  $('masterToggle').checked = isEnabled;
  $('toggleLabel').textContent = isEnabled ? 'ON' : 'OFF';
  $('toggleLabel').classList.toggle('active', isEnabled);
  $('statusDot').classList.toggle('active', isEnabled);
  $('statusText').textContent = isEnabled
    ? 'Listening — open DevTools to capture'
    : 'Idle — open DevTools to capture';

  // Count
  $('captureCount').textContent = captureCount;

  // List
  const list = $('endpointList');
  if (endpoints.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⬡</div>
        <p>No filters yet.<br>Leave empty to capture <code>all JSON</code>,<br>or add URL patterns above.</p>
      </div>`;
    return;
  }

  list.innerHTML = endpoints.map((ep, i) => `
    <div class="endpoint-item ${ep.enabled ? '' : 'disabled'}" data-i="${i}">
      <button type="button" class="ep-toggle ${ep.enabled ? 'on' : ''}" role="switch" aria-checked="${ep.enabled}" aria-label="Enable filter" data-action="toggle" data-i="${i}" title="Enable/disable this filter"></button>
      <div class="ep-url fx-scroll">
        <span class="badge match-type">${ep.matchType ?? 'contains'}</span>${escHtml(ep.url)}
      </div>
      <div class="ep-actions">
        <button type="button" class="btn-icon" data-action="copy" data-i="${i}" title="Copy" aria-label="Copy filter">⎘</button>
        <button type="button" class="btn-icon" data-action="peek" data-i="${i}" title="Show full URL" aria-label="Show full URL" aria-expanded="false">⌕</button>
        <button type="button" class="btn-icon danger" data-action="delete" data-i="${i}" title="Remove" aria-label="Remove filter">✕</button>
      </div>
      <div class="value-tip" popover="manual">${escHtml(ep.url)}</div>
    </div>`).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Event handlers ───────────────────────────────────────────────────────────

$('masterToggle').addEventListener('change', () => {
  isEnabled = $('masterToggle').checked;
  save();
  render();
  toast(isEnabled ? '▶ Capturing enabled' : '■ Capturing paused');
});

$('addBtn').addEventListener('click', addEndpoint);
$('endpointInput').addEventListener('keydown', e => { if (e.key === 'Enter') addEndpoint(); });

function addEndpoint() {
  const raw = $('endpointInput').value.trim();
  if (!raw) return;

  // Deduplicate
  if (endpoints.some(ep => ep.url === raw)) {
    toast('⚠ Already in list');
    return;
  }

  // Guess match type hint
  let matchType = 'contains';
  if (raw.startsWith('^') || raw.endsWith('$')) matchType = 'regex';
  else if (raw.includes('*')) matchType = 'glob';

  endpoints.unshift({ url: raw, enabled: true, matchType, addedAt: Date.now() });
  $('endpointInput').value = '';
  save();
  render();
  toast('✓ Filter added');
}

// Delegate list clicks
$('endpointList').addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const i = parseInt(el.dataset.i, 10);
  const action = el.dataset.action;

  if (action === 'toggle') {
    endpoints[i].enabled = !endpoints[i].enabled;
    save(); render();
    if (e.detail === 0) focusFilter(i);
  } else if (action === 'delete') {
    endpoints.splice(i, 1);
    save(); render();
    toast('Removed');
    if (e.detail === 0) focusFilter(i);
  } else if (action === 'copy') {
    navigator.clipboard.writeText(endpoints[i].url).then(() => toast('⎘ Copied'));
  } else if (action === 'peek') {
    const row = el.closest('.endpoint-item');
    const tip = row.querySelector('.value-tip');
    const willShow = !tip.matches(':popover-open');
    closeValueTips();
    if (willShow) {
      // Float over the popup under the row, or above it if it won't fit below.
      const r = row.getBoundingClientRect();
      tip.style.left = `${r.left}px`;
      tip.style.width = `${r.width}px`;
      tip.showPopover();
      const below = r.bottom + 4;
      tip.style.top = `${below + tip.offsetHeight <= innerHeight ? below : Math.max(4, r.top - 4 - tip.offsetHeight)}px`;
      el.setAttribute('aria-expanded', 'true');
    }
  }
});

// Click-to-peek: hide every open full-URL box.
function closeValueTips() {
  $('endpointList').querySelectorAll('.value-tip:popover-open').forEach(t => t.hidePopover());
  $('endpointList').querySelectorAll('[data-action="peek"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
}

// A click anywhere outside the box (or its magnifier) dismisses it; so does Escape.
document.addEventListener('click', e => {
  if (!e.target.closest('.value-tip, [data-action="peek"]')) closeValueTips();
});
// The box floats in the top layer, so it would drift off its row if the list scrolled.
$('endpointList').addEventListener('scroll', closeValueTips);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const open = $('endpointList').querySelector('[data-action="peek"][aria-expanded="true"]');
  if (open) { closeValueTips(); open.focus(); }
});

// render() rebuilds the list, which drops keyboard focus (e.detail === 0 means
// the click came from the keyboard). Put it back on the same row's toggle, the
// next row after a delete, or the input once the list is empty.
function focusFilter(i) {
  const n = endpoints.length;
  const el = n
    ? $('endpointList').querySelector(`.ep-toggle[data-i="${Math.min(i, n - 1)}"]`)
    : $('endpointInput');
  el.focus();
}

$('clearCountBtn').addEventListener('click', () => {
  captureCount = 0;
  save(); render();
  toast('Count reset');
});

// ── Toast ────────────────────────────────────────────────────────────────────

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

// ── Listen for capture events from devtools ──────────────────────────────────

chrome.storage.onChanged.addListener(changes => {
  if (changes.captureCount) {
    captureCount = changes.captureCount.newValue ?? 0;
    $('captureCount').textContent = captureCount;
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────

load(render);
