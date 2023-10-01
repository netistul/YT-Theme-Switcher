(function() {
// themeCheckScript.js

// Function to check if the theme is dark based on search icon's fill color
const checkThemeColor = () => {
    const searchIcon = document.querySelector("ytd-app ytd-masthead #search-icon svg");
    if (!searchIcon) {
      console.log("[YT-SWITCHER] [INFO] Diagnostic: Search icon not found.");
      return false;
    }
  
    const iconFillColor = window.getComputedStyle(searchIcon).fill;
    console.log("[YT-SWITCHER] [INFO] Diagnostic: Search icon fill color -", iconFillColor);
  
    if (iconFillColor.includes('rgb(255, 255, 255)')) {
      console.log("[YT-SWITCHER] [INFO] Diagnostic: Detected dark theme based on search icon fill color.");
      return true;
    } else {
      console.log("[YT-SWITCHER] [INFO] Diagnostic: Detected light theme based on search icon fill color.");
      return false;
    }
};

// Check the theme status after the page has been reloaded
const themeStatusAfterReload = checkThemeColor();
console.log("[themeCheckScript.js] Theme status after reload:", themeStatusAfterReload);

// Retrieve the theme status from local storage
chrome.storage.local.get(['themeStatus'], function(result) {
    const storedThemeStatus = result.themeStatus;
    console.log("[themeCheckScript.js] Theme status from storage:", storedThemeStatus);

    if (themeStatusAfterReload === storedThemeStatus) {
        console.log("[themeCheckScript.js] Theme status matches stored value.");
    } else {
        console.log("[themeCheckScript.js] Theme status does not match stored value.");
    }

    // Send the theme status to the background script
    chrome.runtime.sendMessage({ themeAfterReload: themeStatusAfterReload });
});

})();
