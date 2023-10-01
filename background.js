// Background Script (background.js)

// Function to handle the tab reload and icon update
function reloadTabAndUpdateIcon(tabId) {
    chrome.tabs.reload(tabId, {}, () => {
        // Retrieve the theme status from local storage immediately after the tab reloads
        chrome.storage.local.get(['themeStatus'], function(result) {
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
    console.log("[background.js] Full received message:", message);

    if (message.action === "toggleTheme") {
        handleThemeToggle(sender.tab);
        return true;
    }
    if (message.themeAfterReload !== undefined) {
        console.log(`[background.js] Theme detected from search icon fill color: ${message.themeAfterReload}`);
    }
});




function handleThemeToggle(tab) {
    // Check if the current tab is a YouTube tab
    if (tab.url && tab.url.includes('youtube.com')) {
        // Execute checkTheme.js in the current tab
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['checkTheme.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error executing checkTheme:", chrome.runtime.lastError);
                return;
            }

            // Reload the tab and update the icon
            reloadTabAndUpdateIcon(tab.id);
        });
    }
}

// New code: Handle the chrome.runtime.onInstalled event
chrome.runtime.onInstalled.addListener(() => {
    // Query for any open YouTube tabs
    chrome.tabs.query({url: "*://*.youtube.com/*"}, (tabs) => {
        for (let tab of tabs) {
            // Execute contentScript.js on each YouTube tab
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['contentScript.js']
            });
        }
    });
});


//TESTING PURPOSE, NOT USED IN EXTENSION, DEVELOPER LOGS ONLY/BACKGROUND
// Listening for changes in cookies related to YouTube's theme
/* chrome.cookies.onChanged.addListener(function(changeInfo) {
    // Check if the change is related to the PREF cookie on youtube.com
    if (changeInfo.cookie.name === "PREF" && changeInfo.cookie.domain.includes("youtube.com")) {
        
        const prefValue = changeInfo.cookie.value;
        const f6HexValue = (prefValue.match(/f6=([a-fA-F0-9]+)/) || [])[1];
        let theme = "Unknown";
        
        if (f6HexValue) {
            // Convert the f6 value from hexadecimal to decimal
            const f6DecimalValue = parseInt(f6HexValue, 16);
            
            // Use bitwise operations to determine the theme
            if (f6DecimalValue & 1024 && !(f6DecimalValue & 524288)) {
                theme = "Dark theme";
            } else if (!(f6DecimalValue & 1024) && f6DecimalValue & 524288) {
                theme = "Light theme";
            }
        }
        
        console.log("[background.js] Detected change in PREF cookie. Current theme:", theme);
        if (theme === "Unknown") {
            console.log("[background.js] Unknown PREF cookie value:", prefValue);
        }
    }
}); */



