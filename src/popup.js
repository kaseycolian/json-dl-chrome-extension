// popup.js — UI logic for JSONtap extension

const $ = id => document.getElementById(id);

let endpoints = [];
let isEnabled = false;
let captureCount = 0;

// ── Storage helpers ──────────────────────────────────────────────────────────

function load(cb) {
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
      <div class="ep-toggle ${ep.enabled ? 'on' : ''}" data-action="toggle" data-i="${i}" title="Enable/disable this filter"></div>
      <div class="ep-url">
        <span class="match-type">${ep.matchType ?? 'contains'}</span>${escHtml(ep.url)}
      </div>
      <div class="ep-actions">
        <button class="ep-btn" data-action="copy" data-i="${i}" title="Copy">⎘</button>
        <button class="ep-btn delete" data-action="delete" data-i="${i}" title="Remove">✕</button>
      </div>
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
  } else if (action === 'delete') {
    endpoints.splice(i, 1);
    save(); render();
    toast('Removed');
  } else if (action === 'copy') {
    navigator.clipboard.writeText(endpoints[i].url).then(() => toast('⎘ Copied'));
  }
});

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
