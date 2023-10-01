(function() {
// Merged checkTheme.js - Theme detection based on the search icon's fill color with diagnostic logs for theme switching

const YTStyle = 'color: red; font-weight: bold;'; // Added bold styling
const SWITCHERStyle = 'color: black; font-weight: bold;'; // Added bold styling
const INFOStyle = 'color: white; background-color: #ab68ff; padding: 2px;';

const isDarkTheme = () => {
  // Attempt to target the search icon
  const searchIcon = document.querySelector("ytd-app ytd-masthead #search-icon svg");
  if (!searchIcon) {
    console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Search icon not found.");
    return false;  // Default to light theme if search icon is not found
  }

  // Get the fill color of the search icon
  const iconFillColor = window.getComputedStyle(searchIcon).fill;
  console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Search icon fill color -", YTStyle, SWITCHERStyle, '', INFOStyle, '', iconFillColor);
  
  // Check if the fill color is white (indicating dark theme)
  if (iconFillColor.includes('rgb(255, 255, 255)')) {
    console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Detected dark theme based on search icon fill color.", YTStyle, SWITCHERStyle, '', INFOStyle, '');
    return true;
  } else {
    console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Detected light theme based on search icon fill color.", YTStyle, SWITCHERStyle, '', INFOStyle, '');
    return false;
  }
};


const setTheme = (isDark) => {
  let expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  // Extract the f6 value from the PREF cookie, if it exists
  const prefCookie = document.cookie.split('; ').find(row => row.startsWith('PREF'));
  const f6Value = (prefCookie && prefCookie.split('&').find(part => part.startsWith('f6'))) 
                  ? prefCookie.split('&').find(part => part.startsWith('f6')).split('=')[1]
                  : '0';

  console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Previous f6 value:", YTStyle, SWITCHERStyle, '', INFOStyle, '', f6Value);

  // Convert the f6 value from hexadecimal to decimal
  const decimalValue = parseInt(f6Value, 16);

  if (isDark) {
    // Turn dark theme on using bitwise operations
    const newValue = (decimalValue & ~524288 | 1024).toString(16);
    document.cookie = "PREF=f6=" + newValue + "&f5=30000;domain=.youtube.com;path=/;expires=" + expiryDate.toUTCString();
    console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Attempting to set dark theme using value:", YTStyle, SWITCHERStyle, '', INFOStyle, '', newValue);
  } else {
    // Turn dark theme off using bitwise operations
    const newValue = (decimalValue & ~1024 | 524288).toString(16);
    document.cookie = "PREF=f6=" + newValue + "&f5=30000;domain=.youtube.com;path=/;expires=" + expiryDate.toUTCString();

    console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Attempting to set light theme using value:", YTStyle, SWITCHERStyle, '', INFOStyle, '', newValue);
  }

  // Store the set theme in extension's local storage
  chrome.storage.local.set({ 'themeStatus': isDark }, function() {
    console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Theme status saved to local storage.", YTStyle, SWITCHERStyle, '', INFOStyle, '', isDark ? "Dark" : "Light");
  });

  // Log the current cookies for youtube.com
  console.log("%c[YT%cSWITCHER%c] %c[INFO]%c Diagnostic: Current cookies after attempt:", YTStyle, SWITCHERStyle, '', INFOStyle, '', document.cookie);
};




const themeStatus = isDarkTheme();
// Switch to the opposite theme
setTheme(!themeStatus);
})();
