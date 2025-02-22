// background.js

// Function to handle the tab reload and icon update
function reloadTabAndUpdateIcon(tabId) {
    chrome.tabs.reload(tabId, {}, () => {
        // Retrieve the theme status from local storage immediately after the tab reloads
        chrome.storage.local.get(['themeStatus'], function (result) {
            const storedThemeStatus = result.themeStatus;
            console.log("[background.js] Theme status from storage:", storedThemeStatus);

            // Set the extension icon based on the stored theme status
            const iconName = storedThemeStatus ? 'icon2.png' : 'icon.png';
            chrome.action.setIcon({
                path: iconName
            });
        });
    });

    setTimeout(() => {
        // Execute themeCheckScript.js after a delay
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['themeCheckScript.js'],
        }, (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error executing themeCheckScript:", chrome.runtime.lastError);
            } else {
                const themeStatusAfterReload = result[0].result;
            }
        });
    }, 7000); // Wait for 7 seconds after reloading before executing themeCheckScript.js
}

chrome.action.onClicked.addListener((tab) => {
    handleThemeToggle(tab);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleTheme") {
        handleThemeToggle(sender.tab);
        return true;
    }
});

function handleThemeToggle(tab) {
    if (tab.url && tab.url.includes('youtube.com')) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['checkTheme.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error executing theme switch:", chrome.runtime.lastError);
                return;
            }

            // Update the extension icon based on stored theme
            chrome.storage.local.get(['themeStatus'], function (result) {
                const iconName = result.themeStatus ? 'icon2.png' : 'icon.png';
                chrome.action.setIcon({ path: iconName });
            });
        });
        // Reload the tab and update the icon
        reloadTabAndUpdateIcon(tab.id);
    }
}

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
        for (let tab of tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['contentScript.js']
            });
        }
    });
});