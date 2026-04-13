# VDH Replica — Help & Documentation

## Getting Started

1. Install the extension (see [Installation](README.md#installation))
2. Navigate to a web page with video content
3. Play the video so the browser makes network requests
4. Click the VDH Replica icon in your browser toolbar
5. Detected videos appear in the popup — download or copy as needed

## Interface

### Main View

The main popup shows a list of all detected videos for the current tab.

Each video entry displays:
- **Thumbnail** — Shows "HLS" for `.m3u8` streams or a play icon for regular videos
- **Filename** — Generated based on your Smart Naming pattern
- **Type & Size** — MIME type and file size (or "Stream" for HLS)
- **Action Buttons**:
  - **⬇ Download** — Saves the file to your downloads folder
  - **📋 Copy** — Copies an `ffmpeg` command to your clipboard (HLS only)

### Toolbar

- **?** (Help) — Opens this documentation
- **Gear** (Settings) — Opens the settings panel

### Settings Panel

Access settings by clicking the gear icon. Settings are saved automatically.

## Features

### Smart Naming

Customize how downloaded files are named using pattern tags:

| Tag | Description | Example Output |
|-----|-------------|----------------|
| `[title]` | Page title of the tab | `My Course Lecture` |
| `[original]` | Original filename from the URL | `video_720p.m3u8` |
| `[date]` | Current date | `2026-04-13` |
| `[ext]` | File extension | `m3u8` |

**Examples:**
- Pattern: `[original]` → `master.m3u8`
- Pattern: `[title]` → `Lecture 5 - Introduction.m3u8`
- Pattern: `[title] - [date]` → `Lecture 5 - Introduction - 2026-04-13.m3u8`

The extension automatically appends the correct file extension if your pattern doesn't include it.

### HLS / Stream Handling

When an HLS (.m3u8) stream is detected, you have three action modes (configurable in Settings):

| Mode | Behavior |
|------|----------|
| **Show All Options** | Displays both Copy and Download buttons |
| **Auto-Copy Command** | Shows only the Copy button (generates `ffmpeg` command) |
| **Download Playlist** | Shows only the Download button (saves the .m3u8 file) |

#### The FFmpeg Command

When you copy an HLS stream, this command is placed on your clipboard:

```
ffmpeg -i "STREAM_URL" -c copy -bsf:a aac_adtstoasc "filename.mp4"
```

This command:
- Downloads the full video stream
- Copies audio and video without re-encoding (lossless)
- Applies the AAC bitstream filter for compatibility
- Saves as `.mp4`

**Requires:** [FFmpeg](https://ffmpeg.org/) installed on your system.

### Auto-Download

When enabled in Settings, the extension automatically downloads any newly detected HLS stream without requiring you to open the popup. Useful for batch downloading scenarios.

### Udemy Autoskip

When enabled, the extension automatically advances to the next Udemy lesson after two `.m3u8` downloads complete (Udemy typically serves two stream files per lesson — one for video, one for audio). If no downloads occur within 10 seconds, the page reloads to retry detection.

### Theming

Three theme options available in Settings:

- **System** — Follows your OS dark/light preference
- **Light** — Light background with dark text
- **Dark** — Dark background with light text (default)

## Troubleshooting

### No media detected

- **Refresh the page** after installing or enabling the extension. The extension can only detect videos from network requests that occur while it's running.
- **Play the video** — some sites only load video resources when playback begins.
- Some sites use DRM-protected streams that cannot be intercepted.

### Downloads not working

- Check that Chrome has permission to download files to your chosen directory.
- Some video URLs may expire. Try refreshing the page and downloading again.

### FFmpeg command not working

- Ensure [FFmpeg](https://ffmpeg.org/) is installed and available in your system PATH.
- Some stream URLs include authentication tokens that expire. Copy and run the command promptly.
- If the stream uses encryption (DRM), the `ffmpeg` copy will fail.

### Autoskip not triggering

- Ensure the autoskip toggle is enabled in Settings.
- The feature only works on `udemy.com` pages.
- Autoskip waits for exactly 2 completed `.m3u8` downloads before triggering.

## FAQ

**Q: Does this extension record my browsing history?**
A: No. The extension only inspects HTTP response headers to detect video content-types. It does not record, store, or transmit any browsing data. See the [Privacy Policy](PRIVACY.md).

**Q: Why does the extension need access to all websites?**
A: The `<all_urls>` permission is required so the network request listener can detect videos served from any domain. Videos are often hosted on CDN domains different from the page you're visiting.

**Q: Can this download DRM-protected content?**
A: No. DRM-protected streams (Widevine, FairPlay) encrypt the content at the browser level. This extension can detect the stream URL but cannot decrypt the content.

**Q: Does this work on Firefox?**
A: This extension is built for Chrome/Chromium using Manifest V3 APIs. It is not compatible with Firefox.

## Support

For bug reports, feature requests, or questions, please open an issue on the [GitHub repository](https://github.com/Arcioth/vds/issues).
