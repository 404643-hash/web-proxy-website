// DOM Elements
const urlInput = document.getElementById('urlInput');
const proxyBtn = document.getElementById('proxyBtn');
const closeBtn = document.getElementById('closeBtn');
const proxyContainer = document.getElementById('proxyContainer');
const proxyFrame = document.getElementById('proxyFrame');
const currentUrlDisplay = document.getElementById('currentUrl');
const errorMessage = document.getElementById('error');
const loading = document.getElementById('loading');

// Event Listeners
proxyBtn.addEventListener('click', handleProxy);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleProxy();
});
closeBtn.addEventListener('click', closeProxy);

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        new URL(string.startsWith('http') ? string : 'https://' + string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Normalize URL - add protocol if missing
 */
function normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

/**
 * Clear error message
 */
function clearError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

/**
 * Show loading state
 */
function showLoading(show = true) {
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

/**
 * Handle proxy request
 */
async function handleProxy() {
    const url = urlInput.value.trim();

    // Validate input
    if (!url) {
        showError('Please enter a URL');
        return;
    }

    if (!isValidUrl(url)) {
        showError('Please enter a valid URL (e.g., example.com or https://example.com)');
        return;
    }

    clearError();
    showLoading(true);

    try {
        const normalizedUrl = normalizeUrl(url);

        // Show the proxy container
        proxyContainer.classList.remove('hidden');
        currentUrlDisplay.textContent = normalizedUrl;

        // Fetch and display content
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: normalizedUrl })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `Error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Display content in iframe
        if (contentType && contentType.includes('text/html')) {
            proxyFrame.src = blobUrl;
        } else {
            // For non-HTML content, show a message
            proxyFrame.srcdoc = `
                <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                        <h2>Content Type: ${contentType || 'Unknown'}</h2>
                        <p>This content type cannot be displayed in the proxy.</p>
                        <p><a href="${normalizedUrl}" target="_blank">Open in new tab</a></p>
                    </body>
                </html>
            `;
        }

        showLoading(false);

    } catch (error) {
        showLoading(false);
        showError(`Failed to load: ${error.message}`);
        console.error('Proxy error:', error);
    }
}

/**
 * Close proxy view
 */
function closeProxy() {
    proxyContainer.classList.add('hidden');
    proxyFrame.src = '';
    urlInput.value = '';
    clearError();
}

/**
 * Handle focus on URL input
 */
urlInput.addEventListener('focus', clearError);

// Auto-focus input on page load
window.addEventListener('load', () => {
    urlInput.focus();
});

// Log page load
console.log('Web Proxy loaded successfully');
