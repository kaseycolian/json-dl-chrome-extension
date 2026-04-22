// background.js — service worker, handles download requests from devtools

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'DOWNLOAD_JSON') return;

  const { body, filename } = msg;

  // Encode body as a data URL (service workers can't use URL.createObjectURL)
  const base64 = btoa(unescape(encodeURIComponent(body)));
  const dataUrl = `data:application/json;base64,${base64}`;

  chrome.downloads.download({
    url: dataUrl,
    filename: filename,
    saveAs: false,
    conflictAction: 'uniquify'
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('[JSONtap] Download failed:', chrome.runtime.lastError.message);
    } else {
      console.log(`[JSONtap] Downloaded → ${filename} (id: ${downloadId})`);
    }
  });

  sendResponse({ ok: true });
  return true;
});
