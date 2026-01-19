console.log("[Localhost UI Commentor] Loaded.");

if (window.__uiCommentorOverlayLoaded) {
    console.log("[Localhost UI Commentor] Already loaded.");
} else {
    window.__uiCommentorOverlayLoaded = true;
    init();
}

function init() {
    console.log("[Localhost UI Commentor] Initializing Batch UI...");

    // Create the Shadow Host
    const host = document.createElement('div');
    host.id = 'ui-commentor-overlay-host';
    Object.assign(host.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '2147483647', // Max Z-Index
    });
    document.body.appendChild(host);

    // Create Shadow Root
    const shadow = host.attachShadow({ mode: 'open' });

    // Styles
    const style = document.createElement('style');
    style.textContent = `
        /* Box Model Highlight */
        .highlight-container {
            position: absolute;
            pointer-events: none;
            z-index: 1000;
            display: none;
            top: 0; left: 0;
            overflow: visible;
        }
        .highlight-container.active {
            display: block;
        }
        .highlight-margin {
            position: absolute;
            background-color: rgba(249, 204, 157, 0.3); /* Orange */
        }
        .highlight-border {
            position: absolute;
            background-color: rgba(243, 213, 129, 0.3); /* Yellow */
        }
        .highlight-padding {
            position: absolute;
            background-color: rgba(195, 230, 203, 0.3); /* Green */
        }
        .highlight-content {
            position: absolute;
            background-color: rgba(159, 188, 240, 0.3); /* Blue */
        }

        .pinned-reticle {
            position: absolute;
            border: 2px dashed #f59e0b;
            background-color: rgba(245, 158, 11, 0.1);
            pointer-events: none;
            border-radius: 4px;
            box-sizing: border-box;
            z-index: 999;
        }
        .pinned-badge {
            position: absolute;
            top: -12px;
            right: -12px;
            background: #f59e0b;
            color: white;
            font-size: 10px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .comment-box {
            position: absolute;
            background: white;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            padding: 12px;
            border-radius: 8px;
            width: 300px;
            pointer-events: auto;
            display: none;
            font-family: system-ui, -apple-system, sans-serif;
            z-index: 1001;
        }
        .comment-box textarea {
            width: 100%;
            height: 80px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            margin-bottom: 8px;
            padding: 8px;
            box-sizing: border-box;
            resize: none;
            font-family: inherit;
        }
        .comment-box button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        .comment-box button:hover {
            background-color: #2563eb;
        }
        .comment-box .actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        .comment-box button.cancel {
            background-color: transparent;
            color: #6b7280;
        }
        .comment-box button.cancel:hover {
            background-color: #f3f4f6;
        }
        
        .debug-badge {
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: #22c55e;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0.8;
            z-index: 2001;
        }

        .box-model-legend {
            position: fixed;
            bottom: 40px;
            left: 10px;
            background: white;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            padding: 8px;
            border-radius: 6px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 11px;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            gap: 4px;
            pointer-events: none;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #374151;
        }
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }


        .sidebar {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-radius: 12px;
            overflow: hidden;
            display: none;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            pointer-events: auto;
            z-index: 2000;
            display: flex;
            flex-direction: column;
        }
        .sidebar-header {
            background: #f9fafb;
            padding: 10px 15px;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .sidebar-content {
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
        }
        .sidebar-item {
            font-size: 13px;
            color: #374151;
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .sidebar-item:last-child {
            border-bottom: none;
        }
        .status-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            margin-top: 5px;
            flex-shrink: 0;
        }
        .status-sending { background-color: #9ca3af; animation: pulse 1.5s infinite; }
        .status-working { background-color: #3b82f6; animation: pulse 1.5s infinite; }
        .status-done { background-color: #10b981; }
        .status-failed { background-color: #ef4444; }
        
        .item-content { flex: 1; }
        .item-text { font-weight: 500; margin-bottom: 2px; }
        .item-meta { font-size: 11px; color: #9ca3af; }

        @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
        .sidebar-item:last-child {
            border-bottom: none;
        }
        .sidebar-footer {
            padding: 10px 15px;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
        }
        .btn-primary {
            background-color: #3b82f6 !important;
            color: white;
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            font-weight: 500;
            border: none;
            cursor: pointer;
        }
        .btn-primary:hover {
             background-color: #2563eb !important;
        }
    `;
    shadow.appendChild(style);

    // --- HTML STUCTURES ---

    // 1. Hover Reticle
    const reticle = document.createElement('div');
    reticle.className = 'reticle';
    shadow.appendChild(reticle);

    // 2. Container for Pinned Reticles (Visuals for queued comments)
    const pinsContainer = document.createElement('div');
    // Change to absolute so we can transform it based on scroll
    pinsContainer.style.position = 'absolute';
    pinsContainer.style.top = '0';
    pinsContainer.style.left = '0';
    pinsContainer.style.width = '100%';
    pinsContainer.style.height = '100%';
    pinsContainer.style.pointerEvents = 'none';
    shadow.appendChild(pinsContainer);

    // 3. Comment Input Box
    const commentBox = document.createElement('div');
    commentBox.className = 'comment-box';
    commentBox.innerHTML = `
        <textarea placeholder="Write a note..."></textarea>
        <div class="actions">
            <button class="cancel">Cancel</button>
            <button class="submit">Send to Agent</button>
        </div>
    `;
    shadow.appendChild(commentBox);

    // 4. Sidebar (Review Panel)
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <span>Activity Log</span>
            <span class="count badge" style="display:none">0</span>
        </div>
        <div class="sidebar-content">
            <!-- Items go here -->
        </div>
        <!-- No footer needed for instant send -->
    `;
    shadow.appendChild(sidebar);

    // 5. Debug Badge
    const badge = document.createElement('div');
    badge.className = 'debug-badge';
    badge.textContent = 'UI Commentor';
    shadow.appendChild(badge);

    // 6. Box Model Legend
    const legend = document.createElement('div');
    legend.className = 'box-model-legend';
    legend.innerHTML = `
        <div class="legend-item"><div class="legend-color" style="background: rgba(249, 204, 157, 1)"></div>Margin</div>
        <div class="legend-item"><div class="legend-color" style="background: rgba(243, 213, 129, 1)"></div>Border</div>
        <div class="legend-item"><div class="legend-color" style="background: rgba(195, 230, 203, 1)"></div>Padding</div>
        <div class="legend-item"><div class="legend-color" style="background: rgba(159, 188, 240, 1)"></div>Content</div>
    `;
    shadow.appendChild(legend);

    // --- STATE ---

    let frozen = false;
    let currentTarget = null;
    let activityLog = []; // { id, text, status, context, ... }
    let pollingInterval = null;

    // --- POLLING ---

    function startPolling() {
        if (pollingInterval) return;
        console.log("Starting polling...");
        pollingInterval = setInterval(pollStatus, 2000);
    }

    function stopPolling() {
        if (!pollingInterval) return;
        console.log("Stopping polling...");
        clearInterval(pollingInterval);
        pollingInterval = null;
    }

    function pollStatus() {
        // Only poll if we have pending items
        const pending = activityLog.some(item => item.status === 'working' || item.status === 'sending');
        if (!pending) {
            stopPolling();
            return;
        }

        fetch('http://localhost:3001/api/status')
            .then(res => res.json())
            .then(data => {
                const tasks = data.tasks;
                let changed = false;
                activityLog.forEach(item => {
                    if (item.status === 'working' && tasks[item.id]) {
                        const serverStatus = tasks[item.id].status;
                        if (serverStatus !== item.status) {
                            item.status = serverStatus;
                            changed = true;
                        }
                    }
                });
                if (changed) renderSidebar();
            })
            .catch(err => {
                console.error("Polling error:", err);
                // If failed consecutively, maybe mark items as failed? 
                // For now just logging, but let's make sure we retry.
                // Actually, if connection refused, we should probably warn user.
            });
    }

    // --- RENDERERS ---

    function renderSidebar() {
        if (activityLog.length === 0) {
            sidebar.style.display = 'none';
            return;
        }
        sidebar.style.display = 'flex';
        // shadow.querySelector('.sidebar .count').textContent = activityLog.length;

        const list = shadow.querySelector('.sidebar-content');
        list.innerHTML = '';

        // Show newest first
        [...activityLog].reverse().forEach((item) => {
            const el = document.createElement('div');
            el.className = 'sidebar-item';

            let statusClass = 'status-sending';
            if (item.status === 'working') statusClass = 'status-working';
            if (item.status === 'done') statusClass = 'status-done';
            if (item.status === 'failed') statusClass = 'status-failed';

            el.innerHTML = `
                <div class="status-dot ${statusClass}"></div>
                <div class="item-content">
                    <div class="item-text">${item.text}</div>
                    <div class="item-meta">${item.status === 'done' ? 'Done' : item.status === 'working' ? 'Agent Working' : item.status === 'failed' ? 'Failed' : 'Sending...'}</div>
                </div>
            `;
            list.appendChild(el);
        });
    }

    function renderBoxModel(rect, styles) {
        // Parse computed styles
        const mt = parseFloat(styles.marginTop) || 0;
        const mr = parseFloat(styles.marginRight) || 0;
        const mb = parseFloat(styles.marginBottom) || 0;
        const ml = parseFloat(styles.marginLeft) || 0;

        const bt = parseFloat(styles.borderTopWidth) || 0;
        const br = parseFloat(styles.borderRightWidth) || 0;
        const bb = parseFloat(styles.borderBottomWidth) || 0;
        const bl = parseFloat(styles.borderLeftWidth) || 0;

        const pt = parseFloat(styles.paddingTop) || 0;
        const pr = parseFloat(styles.paddingRight) || 0;
        const pb = parseFloat(styles.paddingBottom) || 0;
        const pl = parseFloat(styles.paddingLeft) || 0;

        // Coordinates relative to viewport (since container is fixed/absolute to viewport? No, container is absolute 0,0)
        // Actually, reticle container logic needs to handle scroll?
        // In previous code, reticle was absolute.
        // Let's use getBoundingClientRect + scrollY for absolute positioning overlay

        const top = rect.top + window.scrollY;
        const left = rect.left + window.scrollX;
        const w = rect.width;
        const h = rect.height;

        // Container
        // We will just position the container at the top-left of the Margin Box and use relative children?
        // Or simpler: Just 4 absolute divs in the shadow root.

        // Remove old container if exists? No, we reuse.
        let container = shadow.querySelector('.highlight-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'highlight-container';
            container.innerHTML = `
                <div class="highlight-margin"></div>
                <div class="highlight-border"></div>
                <div class="highlight-padding"></div>
                <div class="highlight-content"></div>
            `;
            shadow.appendChild(container);
        }

        // Margin Box (Outer)
        // Margin extends OUTSIDE the element rect (which is usually border-box)
        const marginEl = container.querySelector('.highlight-margin');
        marginEl.style.top = `${top - mt}px`;
        marginEl.style.left = `${left - ml}px`;
        marginEl.style.width = `${w + ml + mr}px`;
        marginEl.style.height = `${h + mt + mb}px`;

        // Border Box (The element rect)
        const borderEl = container.querySelector('.highlight-border');
        borderEl.style.top = `${top}px`;
        borderEl.style.left = `${left}px`;
        borderEl.style.width = `${w}px`;
        borderEl.style.height = `${h}px`;

        // Padding Box (Inside border)
        const paddingEl = container.querySelector('.highlight-padding');
        paddingEl.style.top = `${top + bt}px`;
        paddingEl.style.left = `${left + bl}px`;
        paddingEl.style.width = `${w - bl - br}px`;
        paddingEl.style.height = `${h - bt - bb}px`;

        // Content Box (Inside padding)
        const contentEl = container.querySelector('.highlight-content');
        contentEl.style.top = `${top + bt + pt}px`;
        contentEl.style.left = `${left + bl + pl}px`;
        contentEl.style.width = `${w - bl - br - pl - pr}px`;
        contentEl.style.height = `${h - bt - bb - pt - pb}px`;

        container.classList.add('active');
    }

    function hideBoxModel() {
        const container = shadow.querySelector('.highlight-container');
        if (container) container.classList.remove('active');
    }


    // --- HIGHLIGHTER ---

    document.addEventListener('mousemove', (e) => {
        if (frozen) return;
        // Don't highlight overlay itself
        if (e.target === host || e.target.closest('#ui-commentor-overlay-host')) return;
        // Don't highlight body/html
        if (e.target === document.body || e.target === document.documentElement) return;


        currentTarget = e.target;
        const rect = currentTarget.getBoundingClientRect();
        const styles = window.getComputedStyle(currentTarget);

        renderBoxModel(rect, styles);
    }, { passive: true });

    // --- CLICKS ---

    document.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey) return;

        const path = e.composedPath();
        if (path.includes(commentBox) || path.includes(sidebar)) return;

        if (frozen) return;
        if (!currentTarget) return;
        // Check exclusion
        if (e.target === host || e.target.closest('#ui-commentor-overlay-host')) return;

        e.preventDefault();
        e.stopPropagation();

        startCommentMode(currentTarget);

    }, { capture: true });

    function startCommentMode(el) {
        frozen = true;
        // Hide hover highlight while editing
        hideBoxModel();

        const rect = el.getBoundingClientRect();
        const boxWidth = 320; // Approx max width including padding
        const boxHeight = 160; // Approx height

        // Horizontal Positioning
        let left = rect.left;
        // If fits on right, fine. If not, align to right edge.
        if (left + boxWidth > window.innerWidth) {
            left = window.innerWidth - boxWidth - 20;
        }
        // Ensure not off-left
        if (left < 10) left = 10;

        // Vertical Positioning
        let top = rect.bottom + 10;
        // If not enough space below, try above
        if (top + boxHeight > window.innerHeight) {
            // Check if space above
            if (rect.top - boxHeight - 10 > 0) {
                top = rect.top - boxHeight - 10;
            } else {
                // If neither fits well, just stick to bottom of viewport or top of viewport?
                // Prefer showing it even if it overlaps element
                top = window.innerHeight - boxHeight - 10;
            }
        }

        commentBox.style.top = `${top}px`;
        commentBox.style.left = `${left}px`;
        commentBox.style.display = 'block';

        const boxRect = document.createElement('div');
        boxRect.className = 'pinned-reticle'; // Reuse pinned style for active edit target
        boxRect.style.top = `${rect.top + window.scrollY}px`;
        boxRect.style.left = `${rect.left + window.scrollX}px`;
        boxRect.style.width = `${rect.width}px`;
        boxRect.style.height = `${rect.height}px`;
        boxRect.id = 'temp-edit-rect';
        shadow.appendChild(boxRect);

        setTimeout(() => shadow.querySelector('textarea').focus(), 50);
    }

    function cancelComment() {
        shadow.querySelector('textarea').value = '';
        commentBox.style.display = 'none';
        frozen = false;

        const temp = shadow.getElementById('temp-edit-rect');
        if (temp) temp.remove();
    }

    // --- ACTIONS ---

    shadow.querySelector('.cancel').addEventListener('click', cancelComment);

    // "Send to Agent"
    // "Send to Agent"
    const submitComment = () => {
        const text = shadow.querySelector('textarea').value;
        if (!text) return;

        const rect = currentTarget.getBoundingClientRect();
        const absTop = rect.top + window.scrollY;
        const absLeft = rect.left + window.scrollX;

        // Create Activity Item
        const item = {
            id: Date.now(),
            text: text,
            status: 'sending', // sending, sent, failed
            context: currentTarget.outerHTML.slice(0, 300),
            selector: currentTarget.tagName.toLowerCase(),
            location: window.location.pathname,
            targetRect: {
                top: absTop,
                left: absLeft,
                width: rect.width,
                height: rect.height
            }
        };

        activityLog.push(item);
        renderSidebar();
        cancelComment(); // Close box immediately

        // Send API Request
        const payload = {
            batch: [item] // Send as single-item batch to reuse endpoint
        };

        fetch('http://localhost:3001/api/batch-comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (res.ok) {
                    item.status = 'working';
                    renderSidebar();
                    startPolling();
                } else {
                    item.status = 'failed';
                }
                renderSidebar();
            })
            .catch(err => {
                console.error(err);
                item.status = 'failed';
                renderSidebar();
            });
    };

    shadow.querySelector('.submit').addEventListener('click', submitComment);

    // Enter to Send
    shadow.querySelector('textarea').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitComment();
        }
    });
}
