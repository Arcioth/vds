# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VDH Replica (Arch Edition)** — A Chrome/Chromium extension (Manifest V3) that sniffs network traffic for video content and provides download/copy functionality. It detects HLS (.m3u8) streams and regular video files from browser tabs.

## Architecture

The extension has three layers:

1. **Background service worker** (`background.js`) — Listens to `chrome.webRequest.onHeadersReceived` to detect video content-types and HLS streams. Maintains an in-memory `mediaCache` keyed by `tabId`. Filters out small `.ts` segments to avoid flooding. Supports auto-download of HLS via `chrome.storage.local`.

2. **Popup UI** (`popup.html` + `popup.js` + `popup.css`) — The browser action popup. Uses a simple state object + `render()` pattern (no framework). Communicates with the background worker via `chrome.runtime.sendMessage({ type: 'GET_MEDIA' })`. Manages two views: main (media list) and settings (overlay panel toggled via CSS `.active` class).

3. **Standalone utility pages** — `index.html` (M3U8 date-based renamer) and `endex.html` (M3U8 custom renamer with Turkish UI) are independent single-file tools that use JSZip to batch-rename and zip `.m3u8` files. These are not part of the extension runtime.

### Key Design Details

- **Custom layout system**: CSS emulates XUL-style `<vbox>`, `<hbox>`, `<spacer>` elements with flexbox. These custom elements are used directly in HTML markup.
- **Theming**: Light/dark themes via `html[theme="..."]` attribute and CSS custom properties. Theme preference stored in `localStorage`.
- **Settings storage split**: UI preferences (theme, naming pattern, HLS action) use `localStorage`. Background-affecting settings (hlsAutoDownload) use `chrome.storage.local` so the service worker can access them.
- **Smart naming**: Popup supports filename patterns with tags `[title]`, `[original]`, `[date]`, `[ext]` — resolved at render time in `generateSmartName()`.
- **HLS copy feature**: Generates an `ffmpeg` command (`ffmpeg -i URL -c copy -bsf:a aac_adtstoasc FILE`) and copies to clipboard.

## Development

No build step. Load as an unpacked extension in Chrome/Chromium:

```
chrome://extensions → Enable Developer Mode → Load Unpacked → select this directory
```

After code changes, click the reload button on the extension card in `chrome://extensions`, then reopen the popup.

The `example/` directory contains a saved Udemy course page used for testing detection.
