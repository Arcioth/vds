/**
 * VDH Replica - Background Worker
 * Sniffs network traffic for video content-types.
 */

// Store detected media: { tabId: [ { url, type, size, ... } ] }
const mediaCache = {};

// Settings Cache (synced with storage)
let settings = {
  hlsAutoDownload: false,
  autoskip: false
};

// Autoskip state: tracks completed downloads per tab for skip logic
// { tabId: { count: N, timer: timeoutId } }
const autoskipState = {};

// Initialize settings from storage
chrome.storage.local.get(['hlsAutoDownload', 'autoskip'], (result) => {
  if (result.hlsAutoDownload !== undefined) {
    settings.hlsAutoDownload = result.hlsAutoDownload;
  }
  if (result.autoskip !== undefined) {
    settings.autoskip = result.autoskip;
  }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.hlsAutoDownload) {
      settings.hlsAutoDownload = changes.hlsAutoDownload.newValue;
    }
    if (changes.autoskip) {
      settings.autoskip = changes.autoskip.newValue;
    }
  }
});

// 1. Listen for HTTP Response Headers
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId === -1) return; // Ignore background requests

    // Check for Content-Type header
    const headers = details.responseHeaders;
    const contentType = headers.find(h => h.name.toLowerCase() === 'content-type');
    
    // Check URL extension (fallback if content-type is generic binary)
    const url = details.url.toLowerCase();
    const isM3U8 = url.includes('.m3u8') || (contentType && contentType.value.includes('mpegurl'));
    const isTS = url.includes('.ts') || (contentType && contentType.value.includes('mp2t'));
    const isVideo = contentType && contentType.value.includes('video/');

    if (isM3U8 || isTS || isVideo) {
        
        // --- FILTERING LOGIC ---
        // Ignore small TS segments to prevent flooding
        if (isTS) return; 

        const typeLabel = isM3U8 ? 'HLS (m3u8)' : (contentType ? contentType.value.split(';')[0] : 'video/unknown');
        
        // Fetch Tab Info to get the Page Title for Smart Naming
        chrome.tabs.get(details.tabId, (tab) => {
            if (chrome.runtime.lastError) return; // Tab might have closed
            
            console.log(`[VDH] Detected: ${typeLabel} in Tab ${details.tabId}`);
            
            // Add to cache and check if it's new
            const isNew = addMediaToCache(details.tabId, details, typeLabel, isM3U8, tab.title);

            // --- AUTO DOWNLOAD LOGIC ---
            // Only download if it's a NEW detection (prevents loops on refresh)
            if (isNew && isM3U8 && settings.hlsAutoDownload) {
                console.log(`[VDH] Auto-downloading HLS: ${details.url}`);
                chrome.downloads.download({ url: details.url });
            }
        });
    }
  },
  { urls: ["<all_urls>"] }, // Listen to everything
  ["responseHeaders"]       // We need to see the headers
);

// 2. Helper: Add to storage
// Returns TRUE if the media was added (new), FALSE if it already existed
function addMediaToCache(tabId, details, mimeType, isHLS, pageTitle) {
  if (!mediaCache[tabId]) mediaCache[tabId] = [];

  // Avoid duplicates (same URL)
  const exists = mediaCache[tabId].find(m => m.url === details.url);
  if (exists) return false;

  // Calculate size if available
  const lengthHeader = details.responseHeaders.find(h => h.name.toLowerCase() === 'content-length');
  const sizeMB = lengthHeader ? (parseInt(lengthHeader.value) / 1024 / 1024).toFixed(1) + ' MB' : 'Stream';

  // Extract filename from URL
  let filename = details.url.split('/').pop().split('?')[0] || 'video';
  if (isHLS && !filename.endsWith('.m3u8')) filename += '.m3u8';

  mediaCache[tabId].push({
    url: details.url,
    originalFilename: decodeURIComponent(filename), // Keep original for reference
    pageTitle: pageTitle || "Unknown Page",         // Store page title
    mime: mimeType,
    size: sizeMB,
    isHLS: isHLS, 
    timestamp: Date.now()
  });

  return true;
}

// 3. Communication: Listen for the Popup asking for videos
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_MEDIA') {
    sendResponse(mediaCache[msg.tabId] || []);
  }
  return true; // Keep channel open
});

// 4. Cleanup
chrome.tabs.onRemoved.addListener((tabId) => {
  if (mediaCache[tabId]) delete mediaCache[tabId];
  if (autoskipState[tabId]) {
    clearTimeout(autoskipState[tabId].reloadTimer);
    delete autoskipState[tabId];
  }
});

// 5. Autoskip: Track completed downloads and trigger skip after 2 HLS downloads
chrome.downloads.onChanged.addListener((delta) => {
  if (!settings.autoskip) return;
  if (!delta.state || delta.state.current !== 'complete') return;

  // Get the download item to find which tab triggered it
  chrome.downloads.search({ id: delta.id }, (results) => {
    if (!results || results.length === 0) return;
    const item = results[0];

    // Only care about m3u8 files
    if (!item.filename.toLowerCase().includes('.m3u8')) return;

    // Find the active Udemy tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return;
      const tab = tabs[0];
      if (!tab.url || !tab.url.includes('udemy.com')) return;

      const tabId = tab.id;

      // Initialize state for this tab if needed
      if (!autoskipState[tabId]) {
        autoskipState[tabId] = { count: 0, reloadTimer: null };
      }

      const state = autoskipState[tabId];
      state.count++;

      // Reset the 10s inactivity reload timer on every download
      if (state.reloadTimer) clearTimeout(state.reloadTimer);
      state.reloadTimer = setTimeout(() => {
        console.log(`[VDH Autoskip] 10s no downloads on tab ${tabId}, reloading...`);
        chrome.tabs.sendMessage(tabId, { type: 'AUTOSKIP_RELOAD' }).catch(() => {});
        // Reset state for this tab
        delete autoskipState[tabId];
      }, 10000);

      console.log(`[VDH Autoskip] Download #${state.count} completed on tab ${tabId}`);

      // Skip after 2 downloads (Udemy serves 2 m3u8 files per lesson)
      if (state.count >= 2) {
        console.log(`[VDH Autoskip] 2 downloads done, triggering skip on tab ${tabId}`);

        // Clear the reload timer since we're skipping
        if (state.reloadTimer) clearTimeout(state.reloadTimer);

        // Reset download count for next lesson
        autoskipState[tabId] = { count: 0, reloadTimer: null };

        // Clear the media cache for this tab so the new page starts fresh
        delete mediaCache[tabId];

        // Tell content script to click next
        chrome.tabs.sendMessage(tabId, { type: 'AUTOSKIP_TRIGGER' }).catch(() => {
          console.warn('[VDH Autoskip] Could not reach content script.');
        });
      }
    });
  });
});