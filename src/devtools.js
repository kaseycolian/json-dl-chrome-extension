// devtools.js — intercepts network requests and downloads matching JSON responses

chrome.devtools.network.onRequestFinished.addListener(async (request) => {
  // Read current settings fresh on every request
  const data = await new Promise(resolve =>
    chrome.storage.local.get(['endpoints', 'enabled', 'captureCount'], resolve)
  );

  const isEnabled    = data.enabled      ?? false;
  const endpoints    = data.endpoints    ?? [];
  const captureCount = data.captureCount ?? 0;

  if (!isEnabled) return;

  const url         = request.request.url;
  const contentType = (request.response.content.mimeType || '').toLowerCase();
  const isJson      = contentType.includes('application/json')
                   || contentType.includes('text/json')
                   || url.includes('.json');

  if (!isJson) return;

  // ── Filter matching ────────────────────────────────────────────────────────
  // If there are no enabled endpoint filters, capture everything.
  const activeFilters = endpoints.filter(ep => ep.enabled);

  if (activeFilters.length > 0) {
    const matched = activeFilters.some(ep => matchesFilter(url, ep));
    if (!matched) return;
  }

  // ── Get response body ──────────────────────────────────────────────────────
  request.getContent((body) => {
    if (!body) return;

    // Validate JSON
    try { JSON.parse(body); } catch { return; }

    // Build a sensible filename
    let filename;
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      const last  = parts[parts.length - 1] || 'response';
      const ts    = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      filename = `jsontap/${last}_${ts}.json`;
    } catch {
      filename = `jsontap/response_${Date.now()}.json`;
    }

    // Download via background service worker
    chrome.runtime.sendMessage({
      type: 'DOWNLOAD_JSON',
      body,
      filename
    });

    // Bump counter
    chrome.storage.local.set({ captureCount: captureCount + 1 });
  });
});

// ── Filter logic ─────────────────────────────────────────────────────────────

function matchesFilter(url, ep) {
  const pattern = ep.url;
  const type    = ep.matchType ?? 'contains';

  try {
    if (type === 'regex') {
      return new RegExp(pattern).test(url);
    }
    if (type === 'glob') {
      // Simple glob: * becomes .*
      const re = new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      return re.test(url);
    }
    // Default: substring match
    return url.includes(pattern);
  } catch {
    return url.includes(pattern);
  }
}
