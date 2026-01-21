document.addEventListener('DOMContentLoaded', function () {
    const extensionsList = document.getElementById('extensionsList');
    const searchInput = document.getElementById('searchInput');
    const bulkControls = document.getElementById('bulkControls');
    const extensionCount = document.getElementById('extensionCount');
    const currentExtensionId = chrome.runtime.id;
    const BATCH_STORAGE_KEY = 'lastSuspendedBatch';
    let allExtensions = [];
    let filteredExtensions = [];
    let lastSuspendedBatch = [];
    let bulkProcessing = false;

    // Load extensions when popup opens
    chrome.storage.local.get(BATCH_STORAGE_KEY, data => {
        const savedBatch = data[BATCH_STORAGE_KEY];
        if (Array.isArray(savedBatch)) {
            lastSuspendedBatch = savedBatch;
        }
        loadExtensions();
    });

    // Search functionality
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();
        filterExtensions(searchTerm);
    });

    function loadExtensions() {
        return new Promise(resolve => {
            chrome.management.getAll(function (extensions) {
                // Filter out themes and apps, keep only extensions
                allExtensions = extensions.filter(ext =>
                    ext.type === 'extension' || ext.type === 'packaged_app'
                );

                // Sort extensions: enabled first, then alphabetically
                allExtensions.sort((a, b) => {
                    if (a.enabled !== b.enabled) {
                        return b.enabled - a.enabled; // enabled first
                    }
                    return a.name.localeCompare(b.name);
                });

                filteredExtensions = [...allExtensions];
                syncBatchStateWithCurrentExtensions();
                renderExtensions();
                updateStats();
                renderBulkControls();
                resolve();
            });
        });
    }

    function filterExtensions(searchTerm) {
        if (!searchTerm) {
            filteredExtensions = [...allExtensions];
        } else {
            filteredExtensions = allExtensions.filter(ext =>
                ext.name.toLowerCase().includes(searchTerm) ||
                (ext.description && ext.description.toLowerCase().includes(searchTerm))
            );
        }
        renderExtensions();
    }

    function renderExtensions() {
        if (filteredExtensions.length === 0) {
            extensionsList.innerHTML = '<div class="no-results">No extensions found</div>';
            return;
        }

        extensionsList.innerHTML = filteredExtensions.map(ext => {
            const isCurrentExtension = ext.id === currentExtensionId;
            const iconUrl = getExtensionIcon(ext);

            return `
                <div class="extension-item ${ext.enabled ? '' : 'disabled'} ${isCurrentExtension ? 'self' : ''}" 
                     data-extension-id="${ext.id}">
                    <img class="extension-icon" 
                         src="${iconUrl}" 
                         alt="${ext.name}"
                         onerror="this.style.display='none'">
                    <div class="extension-info">
                        <div class="extension-name">${escapeHtml(ext.name)}</div>
                        <div class="extension-description">${escapeHtml(ext.description || 'No description')}</div>
                    </div>
                    <div class="extension-toggle">
                        <label class="toggle-switch">
                            <input type="checkbox" 
                                   ${ext.enabled ? 'checked' : ''} 
                                   ${!ext.mayDisable ? 'disabled' : ''}
                                   data-extension-id="${ext.id}">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to toggles
        const toggles = extensionsList.querySelectorAll('input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', function () {
                const extensionId = this.dataset.extensionId;
                const shouldEnable = this.checked;

                // Prevent disabling this extension
                if (extensionId === currentExtensionId && !shouldEnable) {
                    this.checked = true;
                    showTooltip('Cannot disable this extension');
                    return;
                }

                toggleExtension(extensionId, shouldEnable);
            });
        });
    }

    function toggleExtension(extensionId, enable) {
        chrome.management.setEnabled(extensionId, enable, function () {
            if (chrome.runtime.lastError) {
                console.error('Error toggling extension:', chrome.runtime.lastError);
                showTooltip('Error: ' + chrome.runtime.lastError.message);
                // Refresh to get current state
                loadExtensions();
            } else {
                // Update the extension in our local array
                const extension = allExtensions.find(ext => ext.id === extensionId);
                if (extension) {
                    extension.enabled = enable;
                }

                if (enable) {
                    removeFromBatch(extensionId);
                }

                // Re-render to show updated state
                filterExtensions(searchInput.value);
                updateStats();
                renderBulkControls();

                showTooltip(`${enable ? 'Enabled' : 'Disabled'} extension`);
            }
        });
    }

    function renderBulkControls() {
        if (!bulkControls) return;

        if (!allExtensions.length) {
            bulkControls.innerHTML = '<div class="extension-item aggregate loading">Preparing batch controls...</div>';
            return;
        }

        const eligibleActive = allExtensions.filter(ext =>
            ext.enabled && ext.id !== currentExtensionId && ext.mayDisable
        );
        const lockedActive = allExtensions.filter(ext =>
            ext.enabled && (ext.id === currentExtensionId || !ext.mayDisable)
        ).length;

        let description = '';
        let actionMarkup = '';

        if (bulkProcessing) {
            description = 'Working through the batch...';
        } else if (lastSuspendedBatch.length > 0) {
            const count = lastSuspendedBatch.length;
            description = `${count} paused extension${count === 1 ? '' : 's'} ready to restore.`;
            actionMarkup = '<button class="aggregate-button secondary" data-action="restore">Re-enable batch</button>';
        } else if (eligibleActive.length > 0) {
            const count = eligibleActive.length;
            description = `${count} enabled extension${count === 1 ? '' : 's'} can pause together.`;
            if (lockedActive) {
                description += ` ${lockedActive} protected extension${lockedActive === 1 ? ' stays' : 's stay'} on.`;
            }
            actionMarkup = '<button class="aggregate-button" data-action="disable">Pause active set</button>';
        } else {
            description = 'No pause-able extensions right now.';
            if (lockedActive) {
                description += ` ${lockedActive} protected extension${lockedActive === 1 ? ' remains' : 's remain'} on.`;
            }
        }

        bulkControls.innerHTML = `
            <div class="extension-item aggregate ${bulkProcessing ? 'processing' : ''}">
                <div class="aggregate-icon">∑</div>
                <div class="extension-info">
                    <div class="extension-name">Active Group Switch</div>
                    <div class="extension-description">${description}</div>
                </div>
                <div class="extension-toggle">
                    ${actionMarkup}
                </div>
            </div>
        `;

        const actionButton = bulkControls.querySelector('[data-action]');
        if (actionButton) {
            actionButton.disabled = bulkProcessing;
            actionButton.addEventListener('click', function () {
                const actionType = this.getAttribute('data-action');
                if (actionType === 'disable') {
                    handleBulkDisable();
                } else if (actionType === 'restore') {
                    handleBulkRestore();
                }
            });
        }
    }

    async function handleBulkDisable() {
        if (bulkProcessing) return;

        const targets = allExtensions
            .filter(ext => ext.enabled && ext.id !== currentExtensionId && ext.mayDisable)
            .map(ext => ext.id);

        if (!targets.length) {
            showTooltip('Nothing to disable');
            return;
        }

        bulkProcessing = true;
        renderBulkControls();

        const results = await toggleExtensionsBulk(targets, false);
        const successes = results.filter(result => result.success).map(result => result.id);
        const failures = results.filter(result => !result.success);

        persistBatchState(successes);
        bulkProcessing = false;

        if (successes.length) {
            showTooltip(`Disabled ${successes.length} extension${successes.length === 1 ? '' : 's'}`);
        }
        if (failures.length) {
            console.warn('Some extensions could not be disabled:', failures);
            showTooltip('Some extensions could not be disabled');
        }

        loadExtensions();
        renderBulkControls();
    }

    async function handleBulkRestore() {
        if (bulkProcessing || !lastSuspendedBatch.length) return;

        bulkProcessing = true;
        renderBulkControls();

        const results = await toggleExtensionsBulk(lastSuspendedBatch, true);
        const successes = results.filter(result => result.success).map(result => result.id);
        const failures = results.filter(result => !result.success).map(result => result.id);

        persistBatchState(failures);
        bulkProcessing = false;

        if (successes.length) {
            showTooltip(`Re-enabled ${successes.length} extension${successes.length === 1 ? '' : 's'}`);
        }
        if (failures.length) {
            console.warn('Some extensions could not be re-enabled:', failures);
            showTooltip('Some extensions could not be re-enabled');
        }

        loadExtensions();
        renderBulkControls();
    }

    function toggleExtensionsBulk(extensionIds, enable) {
        return Promise.all(extensionIds.map(extensionId => {
            return new Promise(resolve => {
                chrome.management.setEnabled(extensionId, enable, function () {
                    const lastError = chrome.runtime.lastError;
                    if (lastError) {
                        resolve({ id: extensionId, success: false, error: lastError.message });
                        return;
                    }

                    const extension = allExtensions.find(ext => ext.id === extensionId);
                    if (extension) {
                        extension.enabled = enable;
                    }

                    resolve({ id: extensionId, success: true });
                });
            });
        }));
    }

    function persistBatchState(ids) {
        lastSuspendedBatch = ids;
        if (ids.length) {
            chrome.storage.local.set({ [BATCH_STORAGE_KEY]: ids });
        } else {
            chrome.storage.local.remove(BATCH_STORAGE_KEY);
        }
    }

    function syncBatchStateWithCurrentExtensions() {
        if (!lastSuspendedBatch.length || !allExtensions.length) {
            return;
        }
        const stillDisabled = lastSuspendedBatch.filter(id => {
            const ext = allExtensions.find(ext => ext.id === id);
            return ext && !ext.enabled;
        });
        if (stillDisabled.length !== lastSuspendedBatch.length) {
            persistBatchState(stillDisabled);
        }
    }

    function removeFromBatch(extensionId) {
        if (!lastSuspendedBatch.length) return;
        if (!lastSuspendedBatch.includes(extensionId)) return;
        persistBatchState(lastSuspendedBatch.filter(id => id !== extensionId));
    }

    function getExtensionIcon(extension) {
        if (extension.icons && extension.icons.length > 0) {
            // Find the best size icon (prefer 24, 32, or 16)
            const preferredSizes = [24, 32, 16, 48, 64, 128];
            for (const size of preferredSizes) {
                const icon = extension.icons.find(icon => icon.size === size);
                if (icon) {
                    return icon.url;
                }
            }
            // Fallback to first available icon
            return extension.icons[0].url;
        }

        // Fallback to a default icon or empty
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0U1RTVFNSIvPgo8cGF0aCBkPSJNOSAxMkwxMS41IDE0LjVMMTUgMTEiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
    }

    function updateStats() {
        const enabledCount = allExtensions.filter(ext => ext.enabled).length;
        const totalCount = allExtensions.length;
        extensionCount.textContent = `${enabledCount}/${totalCount} extensions enabled`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showTooltip(message) {
        // Simple tooltip implementation
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: var(--text-primary);
            color: var(--bg-primary);
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            border: 1px solid var(--border-color);
            z-index: 1000;
            animation: fadeIn 0.3s;
        `;
        tooltip.textContent = message;
        document.body.appendChild(tooltip);

        setTimeout(() => {
            tooltip.style.animation = 'fadeOut 0.3s';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }, 2000);
    }

    // Add CSS for tooltip animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
});