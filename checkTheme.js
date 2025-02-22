// checkTheme.js
(function () {
  const log = (message, data = '') => {
    console.log(`[YT-SWITCHER] [INFO] ${message}`, data);
  };

  const isDarkTheme = () => {
    log('Starting theme detection');

    const indicators = {
      htmlDark: document.documentElement.hasAttribute('dark'),
      bodyDark: document.body.classList.contains('dark'),
      iconColor: (() => {
        const menuIcon = document.querySelector("ytd-masthead yt-icon.style-scope.ytd-masthead svg path");
        if (menuIcon) {
          const color = window.getComputedStyle(menuIcon).fill;
          log('Menu icon color:', color);
          return color.includes('255, 255, 255');
        }
        return false;
      })()
    };

    log('Theme indicators:', indicators);
    return indicators.htmlDark || indicators.bodyDark || indicators.iconColor;
  };

  const setTheme = (isDark) => {
    log('Setting theme to:', isDark ? 'dark' : 'light');

    try {
      // Get and parse PREF cookie
      const cookies = document.cookie.split('; ').reduce((acc, curr) => {
        const [key, value] = curr.split('=');
        acc[key] = value;
        return acc;
      }, {});

      let prefValues = {};
      if (cookies['PREF']) {
        prefValues = cookies['PREF'].split('&').reduce((acc, curr) => {
          const [key, value] = curr.split('=');
          if (key !== 'PREF') {
            acc[key] = value;
          }
          return acc;
        }, {});
      }

      // Calculate new theme value
      const currentF6 = parseInt(prefValues['f6'] || '0', 16);
      const newF6 = isDark
        ? (currentF6 | 0x400) & ~0x80000  // Dark theme
        : (currentF6 & ~0x400) | 0x80000; // Light theme

      // Update cookie
      prefValues['f6'] = newF6.toString(16);
      const newPrefValue = Object.entries(prefValues)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      document.cookie = `PREF=${newPrefValue};domain=.youtube.com;path=/;expires=${expiryDate.toUTCString()}`;

      // Save theme status and reload
      chrome.storage.local.set({ 'themeStatus': isDark }, () => {
        log('Theme status saved:', isDark);
        window.location.reload();
      });

    } catch (error) {
      log('Error during theme setting:', error);
    }
  };

  // Execute theme switch
  try {
    const currentTheme = isDarkTheme();
    log('Current theme:', currentTheme ? 'dark' : 'light');
    setTheme(!currentTheme);
  } catch (error) {
    log('Critical error:', error);
  }
})();