# VDH Replica

A clean, privacy-focused Chrome/Chromium extension that detects video content from browser tabs and provides download and copy functionality. Supports HLS (.m3u8) streams, .mp4, .mkv, .mov, and other video formats.

## Features

- **Automatic Video Detection** — Monitors network responses to identify video content-types and HLS streams in real time
- **HLS Stream Support** — Detects `.m3u8` playlists and generates ready-to-use `ffmpeg` commands for lossless downloading
- **Smart File Naming** — Customizable filename patterns using `[title]`, `[original]`, `[date]`, and `[ext]` tags
- **Auto-Download** — Optionally auto-download detected HLS streams without manual interaction
- **Udemy Integration** — Auto-skip to the next lesson after downloads complete (content script for udemy.com)
- **Theming** — Dark and light themes with system preference detection
- **No Data Collection** — Fully local processing, no analytics, no telemetry, no external data transmission

## Installation

### Chrome Web Store

*(Coming soon)*

### Manual Installation (Developer Mode)

1. Download the latest release from [Releases](../../releases)
2. Extract the ZIP file
3. Open `chrome://extensions` in Chrome or Chromium
4. Enable **Developer Mode** (top-right toggle)
5. Click **Load Unpacked** and select the extracted folder
6. The extension icon appears in your toolbar

## Usage

1. Navigate to any page with video content
2. Play the video to trigger network requests
3. Click the VDH Replica icon in the toolbar
4. Detected videos appear in the popup list:
   - Click **⬇** to download a video file
   - Click **📋** to copy the `ffmpeg` command (HLS streams)
5. Open **Settings** (gear icon) to configure naming patterns, themes, and HLS behavior

### Smart Naming Tags

| Tag | Resolves To |
|-----|-------------|
| `[title]` | Page title of the source tab |
| `[original]` | Original filename from the URL |
| `[date]` | Current date (YYYY-MM-DD) |
| `[ext]` | File extension |

**Default pattern:** `[original]`
**Example:** `[title] - [date]` → `My Course Lecture - 2026-04-13.m3u8`

### HLS Copy Command

When you copy an HLS stream, the following `ffmpeg` command is placed on your clipboard:

```
ffmpeg -i "URL" -c copy -bsf:a aac_adtstoasc "filename.mp4"
```

This performs a lossless stream copy — no re-encoding, no quality loss.

## Permissions

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access the currently active tab to retrieve page title for smart naming |
| `storage` | Persist user preferences (theme, naming pattern, HLS action, autoskip) across sessions |
| `downloads` | Trigger file downloads to the user's local device |
| `webRequest` | Inspect HTTP response headers to detect video content-types |
| `<all_urls>` (host) | Required by `webRequest` to monitor network traffic across all websites |

Full permission justifications are available in the [Privacy Policy](PRIVACY.md).

## Privacy

VDH Replica does **not** collect, store, transmit, or share any user data. All video detection and processing happens entirely within the browser. No analytics, no telemetry, no external servers.

See the full [Privacy Policy](PRIVACY.md) for details and Chrome Web Store compliance disclosures.

## Version

**1.0.0** — Initial release

## License

This project is licensed under the [MIT License](LICENSE).

## Developer

Built by [Arcioth](https://github.com/Arcioth)
