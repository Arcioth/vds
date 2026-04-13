/**
 * VDH Replica - UI Logic
 * Handles the popup interactions, state management, and media rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Element Mapping ---
    const elements = {
        mainView: document.getElementById('main'),
        settingsView: document.getElementById('settings'),
        mediaContainer: document.getElementById('media'), 
        noMediaState: document.getElementById('nomedia'),
        btnSettings: document.getElementById('button_settings'),
        btnBack: document.getElementById('button_back_settings'),
        
        // Settings Inputs
        themeSelect: document.getElementById('s_theme_select'),
        namingPatternInput: document.getElementById('s_naming_pattern'),
        hlsActionSelect: document.getElementById('s_hls_action'),
        hlsAutoDownloadCheckbox: document.getElementById('s_hls_autodownload'),
        autoskipCheckbox: document.getElementById('s_autoskip'),

        root: document.documentElement
    };

    // --- 2. State Management ---
    let state = {
        view: 'main', 
        theme: 'dark',
        namingPattern: '[original]', 
        hlsAction: 'ask',            
        hlsAutoDownload: false,
        autoskip: false,
        media: []
    };

    // --- 3. The Render Function ---
    function render() {
        if (state.view === 'settings') {
            elements.settingsView.classList.add('active');
        } else {
            elements.settingsView.classList.remove('active');
        }

        elements.root.setAttribute('theme', state.theme);
        
        // Sync UI inputs with State
        if (elements.themeSelect) elements.themeSelect.value = state.theme;
        if (elements.namingPatternInput) elements.namingPatternInput.value = state.namingPattern;
        if (elements.hlsActionSelect) elements.hlsActionSelect.value = state.hlsAction;
        if (elements.hlsAutoDownloadCheckbox) elements.hlsAutoDownloadCheckbox.checked = state.hlsAutoDownload;
        if (elements.autoskipCheckbox) elements.autoskipCheckbox.checked = state.autoskip;

        renderMediaList();
    }

    // --- 4. Helper: Smart Name Generator ---
    function generateSmartName(video) {
        let pattern = state.namingPattern || '[original]';
        
        // 1. Get raw values
        const originalName = video.originalFilename;
        // Clean up page title (remove illegal chars)
        const cleanTitle = (video.pageTitle || 'video').replace(/[<>:"/\\|?*]/g, '').trim(); 
        const ext = originalName.split('.').pop();
        const date = new Date().toISOString().split('T')[0];

        // 2. Replace tags
        let finalName = pattern
            .replace('[title]', cleanTitle)
            .replace('[original]', originalName)
            .replace('[date]', date)
            .replace('[ext]', ext);
        
        // 3. Ensure extension exists if user pattern forgot it
        if (!finalName.endsWith(`.${ext}`)) {
            finalName += `.${ext}`;
        }

        return finalName;
    }

    function renderMediaList() {
        elements.mediaContainer.innerHTML = '';

        if (state.media.length === 0) {
            elements.mediaContainer.appendChild(elements.noMediaState);
            elements.noMediaState.style.display = 'flex';
            elements.noMediaState.style.flexDirection = 'column';
            
            elements.noMediaState.innerHTML = `
                <div style="font-size: 40px; margin-bottom: 10px;">📹</div>
                <div style="font-weight: bold; margin-bottom: 5px;">No media detected</div>
                <div style="font-size: 0.8em; opacity: 0.7; text-align: center; max-width: 200px;">
                    Play a video and <b>refresh the page</b> to capture it.
                </div>
            `;
        } else {
            elements.noMediaState.style.display = 'none';

            // REVERSE the array so newest videos appear at the TOP
            [...state.media].reverse().forEach(video => {
                const item = document.createElement('div');
                item.className = `media-item ${video.isHLS ? 'type-hls' : ''}`;
                
                // Generate the Smart Name
                const smartName = generateSmartName(video);

                let buttonsHtml = '';

                if (video.isHLS) {
                    // HLS Handling based on Preference
                    if (state.hlsAction === 'copy') {
                         buttonsHtml = `<button class="icon-btn secondary copy-btn" data-url="${video.url}" data-filename="${smartName}" title="Copy FFmpeg">📋</button>`;
                    } else if (state.hlsAction === 'download') {
                         buttonsHtml = `<button class="icon-btn primary download-btn" data-url="${video.url}" data-filename="${smartName}" title="Download Playlist">⬇</button>`;
                    } else {
                        // Ask (Default): Show Both
                        buttonsHtml = `
                            <button class="icon-btn secondary copy-btn" data-url="${video.url}" data-filename="${smartName}" title="Copy FFmpeg">📋</button>
                            <button class="icon-btn primary download-btn" data-url="${video.url}" data-filename="${smartName}" title="Download Playlist">⬇</button>
                        `;
                    }
                } else {
                    // Regular Video
                    buttonsHtml = `
                        <button class="icon-btn primary download-btn" data-url="${video.url}" data-filename="${smartName}" title="Download File">⬇</button>
                    `;
                }

                const thumbContent = video.isHLS ? 'HLS' : '▶';

                item.innerHTML = `
                    <hbox style="height: 100%;">
                        <div class="media-thumb">${thumbContent}</div>
                        <vbox flex="1" pack="center" style="overflow: hidden;">
                            <div class="media-title" title="${smartName}">${smartName}</div>
                            <div class="media-info">${video.mime.split('/')[1] || 'Unknown'} • ${video.size}</div>
                        </vbox>
                        <hbox pack="center" xalign="center" style="gap: 8px; padding-left: 8px;">
                             ${buttonsHtml}
                        </hbox>
                    </hbox>
                `;
                elements.mediaContainer.appendChild(item);
            });

            // Listeners for Downloads
            document.querySelectorAll('.download-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const url = e.currentTarget.getAttribute('data-url');
                    const filename = e.currentTarget.getAttribute('data-filename');
                    chrome.downloads.download({ url: url, filename: filename });
                });
            });

            // Listeners for HLS Copy
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const url = e.currentTarget.getAttribute('data-url');
                    const filename = e.currentTarget.getAttribute('data-filename').replace('.m3u8', '.mp4');
                    
                    // Generate FFmpeg command (Arch Linux Style)
                    const command = `ffmpeg -i "${url}" -c copy -bsf:a aac_adtstoasc "${filename}"`;
                    
                    // Copy to clipboard
                    navigator.clipboard.writeText(command).then(() => {
                        const originalText = e.target.textContent;
                        e.target.textContent = "✅";
                        setTimeout(() => e.target.textContent = originalText, 1500);
                    });
                });
            });
        }
    }

    // --- 5. Event Listeners ---
    if (elements.btnSettings) elements.btnSettings.addEventListener('click', () => { state.view = 'settings'; render(); });
    
    // Save settings on Close of Settings Panel
    if (elements.btnBack) elements.btnBack.addEventListener('click', () => { 
        if(elements.namingPatternInput) state.namingPattern = elements.namingPatternInput.value;
        if(elements.hlsActionSelect) state.hlsAction = elements.hlsActionSelect.value;
        
        // Save to Chrome Storage for consistency across sessions
        chrome.storage.local.set({ 
            vdh_pattern: state.namingPattern,
            vdh_hls: state.hlsAction
        });
        
        state.view = 'main'; 
        render(); 
    });
    
    // Theme Change
    if (elements.themeSelect) elements.themeSelect.addEventListener('change', (e) => { 
        state.theme = e.target.value; 
        chrome.storage.local.set({ vdh_theme: state.theme });
        render(); 
    });

    // Auto Download Checkbox
    if (elements.hlsAutoDownloadCheckbox) {
        elements.hlsAutoDownloadCheckbox.addEventListener('change', (e) => {
            state.hlsAutoDownload = e.target.checked;
            chrome.storage.local.set({ hlsAutoDownload: state.hlsAutoDownload });
            render();
        });
    }

    // Autoskip Checkbox
    if (elements.autoskipCheckbox) {
        elements.autoskipCheckbox.addEventListener('change', (e) => {
            state.autoskip = e.target.checked;
            chrome.storage.local.set({ autoskip: state.autoskip });
            render();
        });
    }

    // --- About & Help Links ---
    const REPO_URL = 'https://github.com/Arcioth/vds';

    document.getElementById('about_version')?.addEventListener('click', () => {
        chrome.tabs.create({ url: REPO_URL + '/releases/tag/v1.0.0' });
    });
    document.getElementById('about_developer')?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/Arcioth' });
    });
    document.getElementById('about_privacy')?.addEventListener('click', () => {
        chrome.tabs.create({ url: REPO_URL + '/blob/main/PRIVACY.md' });
    });
    document.getElementById('about_help')?.addEventListener('click', () => {
        chrome.tabs.create({ url: REPO_URL + '/blob/main/HELP.md' });
    });
    document.getElementById('button_help')?.addEventListener('click', () => {
        chrome.tabs.create({ url: REPO_URL + '/blob/main/HELP.md' });
    });

    // --- 6. Initialization ---
    // Load ALL settings from chrome.storage.local
    chrome.storage.local.get([
        'vdh_theme', 
        'vdh_pattern', 
        'vdh_hls', 
        'hlsAutoDownload', 
        'autoskip'
    ], (result) => {
        if (result.vdh_theme) state.theme = result.vdh_theme;
        if (result.vdh_pattern) state.namingPattern = result.vdh_pattern;
        if (result.vdh_hls) state.hlsAction = result.vdh_hls;
        if (result.hlsAutoDownload !== undefined) state.hlsAutoDownload = result.hlsAutoDownload;
        if (result.autoskip !== undefined) state.autoskip = result.autoskip;
        
        render();
    });

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
            chrome.runtime.sendMessage({ type: 'GET_MEDIA', tabId: tabs[0].id }, (response) => {
                if (chrome.runtime.lastError) return;
                if (response && Array.isArray(response)) {
                    state.media = response;
                    render();
                } else {
                    render();
                }
            });
        }
    });
});