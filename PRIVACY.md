# Privacy Policy

**VDH Replica** — Version 1.0.0
**Last Updated:** April 13, 2026

---

## Overview

VDH Replica is a browser extension that detects video content in network traffic and provides download/copy functionality. The extension operates entirely within the user's browser. It does not collect, store, transmit, or share any user data with external servers or third parties.

## Data Collection

**VDH Replica does not collect any user data.**

The extension does not collect:

- Personally identifiable information (name, email, address, age, identification numbers)
- Health information
- Financial or payment information
- Authentication information (passwords, credentials, PINs)
- Personal communications (emails, texts, chat messages)
- Location data (region, IP address, GPS coordinates)
- Web browsing history
- User activity data (clicks, mouse position, scroll, keystrokes)
- Website content (text, images, sounds, hyperlinks)

## Data Storage

The only data stored by the extension is **user preferences**, saved locally in the browser using `chrome.storage.local`:

- Theme preference (dark/light/system)
- File naming pattern
- HLS action preference (ask/copy/download)
- Auto-download toggle state
- Autoskip toggle state

These preferences never leave the browser. They are not transmitted, synced, or backed up to any external service.

## Data Transmission

VDH Replica makes **zero** outbound network requests. The extension only passively observes HTTP response headers that the browser is already processing. It does not:

- Send data to any server
- Phone home or check for updates via external endpoints
- Include analytics or telemetry of any kind
- Load remote scripts or resources at runtime

## Third-Party Services

The extension does not integrate with or transmit data to any third-party services.

## Certifications

- **I do not sell or transfer user data to third parties**, outside of the approved use cases.
- **I do not use or transfer user data for purposes that are unrelated to the extension's single purpose.**
- **I do not use or transfer user data to determine creditworthiness or for lending purposes.**

---

## Chrome Web Store Compliance

The following section provides the required disclosures for the Chrome Web Store Developer Program Policies.

### Single Purpose Description

Helping the user download videos from the internet in mainly .m3u8, .mkv, .mp4, .mov formats.

### Permission Justifications

#### `activeTab`

The `activeTab` permission is used to access the currently active tab's metadata (specifically the page title) when the user opens the extension popup. The page title is used by the Smart Naming feature to generate meaningful filenames for detected videos. For example, if the user is on a page titled "Lecture 5 - Introduction", the extension can name the download "Lecture 5 - Introduction.m3u8" instead of a cryptic URL-derived name. This permission is only exercised when the user actively interacts with the extension. No tab content, URL history, or browsing data is collected or stored.

#### `tabs`

The `tabs` permission is used by the background service worker to retrieve the page title of the tab where a video was detected. When the `chrome.webRequest` listener identifies a video content-type in a network response, it calls `chrome.tabs.get(tabId)` to read the page title and associate it with the detected media entry. This title is displayed in the popup and used for the Smart Naming feature. The extension does not read, record, or transmit tab URLs or browsing history. Only the page title is accessed, and it is held temporarily in memory for the duration of the browser session.

#### `storage`

The `storage` permission is used to persist user preferences across browser sessions via `chrome.storage.local`. Stored preferences include: theme selection (dark/light/system), file naming pattern, HLS action preference, auto-download toggle, and autoskip toggle. These are simple key-value pairs that control extension behavior. No user-generated content, browsing data, or personal information is stored. The storage is local to the browser and is never synced or transmitted externally.

#### `downloads`

The `downloads` permission is used to save detected video files to the user's local device via `chrome.downloads.download()`. When the user clicks the download button in the popup, or when auto-download is enabled for HLS streams, the extension initiates a download of the video URL directly to the user's default download directory. The extension also monitors `chrome.downloads.onChanged` to track download completion for the Udemy autoskip feature (counting completed .m3u8 downloads to determine when to advance to the next lesson). No download history or file contents are collected or transmitted.

#### `webRequest`

The `webRequest` permission is used to listen to `chrome.webRequest.onHeadersReceived` events, which allows the extension to inspect HTTP response headers for video content-types (e.g., `video/*`, `application/x-mpegurl`). This is the core detection mechanism — the extension identifies videos by checking the `Content-Type` header and URL file extensions in network responses. Only the content-type, content-length, and URL of detected video resources are extracted. The extension does not modify, block, or redirect any network requests. No request data, cookies, authentication headers, or non-video responses are accessed or stored.

#### `scripting`

The `scripting` permission supports the content script injection for the Udemy autoskip feature. The extension declares a content script in the manifest that runs on `*://*.udemy.com/*` pages. This content script listens for messages from the background worker and, when triggered, clicks the "next lesson" navigation button on the Udemy player page. The content script does not read page content, collect user data, or modify the page in any way beyond automating navigation. It only activates when the autoskip feature is enabled by the user and two consecutive .m3u8 downloads have completed.

#### Host Permission (`<all_urls>`)

The `<all_urls>` host permission is required because the `chrome.webRequest.onHeadersReceived` listener needs to observe HTTP responses from all origins to detect video content. Video hosting services use a wide variety of domains and CDN subdomains (e.g., video content on an educational site may be served from a completely different CDN domain). Restricting the listener to specific domains would make the extension unable to detect videos served from third-party CDNs, which is the majority of video content on the web. The extension uses this permission exclusively for passive observation of response headers — it does not modify, block, or redirect any requests, and does not access page content or cookies.

### Remote Code

**No, this extension does not use remote code.**

All JavaScript and resources are bundled within the extension package. There are no external `<script>` tags pointing to remote files, no dynamically loaded modules from external servers, and no use of `eval()` or equivalent dynamic code execution. The only external resource referenced is the Google Fonts stylesheet for the JetBrains Mono typeface, which is a CSS-only resource and does not execute any code.

### Data Usage

This extension does not collect any of the following categories of user data:

- Personally identifiable information
- Health information
- Financial and payment information
- Authentication information
- Personal communications
- Location data
- Web history
- User activity
- Website content

---

## Contact

For privacy-related questions or concerns, please open an issue on the [GitHub repository](https://github.com/Arcioth/vds).
