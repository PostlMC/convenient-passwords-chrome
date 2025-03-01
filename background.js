// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle popup resize request
    if (message.action === 'resize_popup') {
        // This approach doesn't work well for popups in Manifest V3
        // Chrome popups can't be resized directly in Manifest V3
        // Instead, we'll return a response to let the popup adjust its internal layout
        sendResponse({ success: true });
    }
    return true;
});
