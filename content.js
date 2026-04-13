/**
 * VDH Replica - Content Script (Udemy Autoskip)
 * Injected into Udemy pages. Listens for skip commands from the background worker
 * and clicks the "next lesson" button.
 */

(function () {
  let reloadTimer = null;

  // Listen for messages from the background worker
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'AUTOSKIP_TRIGGER') {
      console.log('[VDH Autoskip] Received skip trigger, clicking next lesson...');
      clickNextLesson();
      sendResponse({ ok: true });
    }

    if (msg.type === 'AUTOSKIP_RELOAD') {
      console.log('[VDH Autoskip] No downloads for 10s, reloading page...');
      location.reload();
    }

    if (msg.type === 'AUTOSKIP_START_RELOAD_TIMER') {
      // Background tells us to start counting 10s of inactivity
      resetReloadTimer();
      sendResponse({ ok: true });
    }

    if (msg.type === 'AUTOSKIP_CANCEL_RELOAD_TIMER') {
      clearReloadTimer();
      sendResponse({ ok: true });
    }
  });

  function clickNextLesson() {
    // Try multiple selectors for the next lesson button
    const btn =
      document.querySelector('[data-purpose="go-to-next"]') ||
      document.getElementById('go-to-next-item') ||
      document.querySelector('svg[aria-label="Sonraki derse git"]')?.closest('[role="link"], button, a');

    if (btn) {
      btn.click();
      console.log('[VDH Autoskip] Clicked next lesson button.');
    } else {
      console.warn('[VDH Autoskip] Next lesson button not found.');
    }
  }

  function resetReloadTimer() {
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      console.log('[VDH Autoskip] 10s inactivity, reloading...');
      location.reload();
    }, 10000);
  }

  function clearReloadTimer() {
    if (reloadTimer) {
      clearTimeout(reloadTimer);
      reloadTimer = null;
    }
  }

  console.log('[VDH Autoskip] Content script loaded on Udemy page.');
})();
