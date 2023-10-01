function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to inject the CSS into the page
function injectStyles(styles) {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

injectStyles(`
/* CSS for the toggle switch */
.switch {
    position: relative;
    display: inline-block;
    width: 42px;  /* 30% smaller */
    height: 23.8px; /* 30% smaller */
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 23.8px; /* 30% smaller */
}

.slider:before {
    position: absolute;
    content: "";
    height: 18.2px; /* 30% smaller */
    width: 18.2px; /* 30% smaller */
    left: 2.8px;  /* Adjusted for smaller size */
    bottom: 2.8px; /* Adjusted for smaller size */
    background-color: white;
    transition: background .4s, transform .4s;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;  /* Adjusted for better display of the emoji */
}

input:checked + .slider {
    background-color: #000; /* Changed to black */
}

input:checked + .slider:before {
    transform: translateX(18.2px); /* Adjusted for smaller size */
    background: 
            radial-gradient(circle at 4px 5px, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.0) 3px),
            radial-gradient(circle at 13px 4px, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.0) 2.5px),
            radial-gradient(circle at 9px 12px, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.0) 2px),
            radial-gradient(circle at 5px 14px, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.0) 2px),
            radial-gradient(circle at 11px 10px, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.0) 2.5px),
            radial-gradient(circle, white, black 90%);
    /* content: "\u{1F311}";  Removed or commented out */
}
`);



// Create the custom switch element
const switchContainer = document.createElement('label');
switchContainer.className = 'switch';

const switchCheckbox = document.createElement('input');
switchCheckbox.type = 'checkbox';

const switchSlider = document.createElement('span');
switchSlider.className = 'slider';

switchContainer.appendChild(switchCheckbox);
switchContainer.appendChild(switchSlider);

// Function to set the switch based on the stored theme status
function setSwitchBasedOnTheme() {
    chrome.storage.local.get(['themeStatus'], function(result) {
        switchCheckbox.checked = result.themeStatus;
    });
}

// Initial set switch
setSwitchBasedOnTheme();

// Listen to changes in storage and update the switch accordingly
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        if (key === 'themeStatus') {
            setSwitchBasedOnTheme();
        }
    }
});

// Create the container div element
const containerDiv = document.createElement('div');
containerDiv.id = 'my_extension_container';
containerDiv.className = 'my_extension_container tp-tooltip-container';
containerDiv.style.margin = '17px';
containerDiv.appendChild(switchContainer);

// Function to append the container div on the left of the notifications button
const placeContainerOnLeftOfIcons = () => {
    // Detect the icons container
    const iconsContainer = document.querySelector("ytd-masthead #end #buttons");
    if (iconsContainer) {
        // Insert the container div before the icons container
        iconsContainer.parentNode.insertBefore(containerDiv, iconsContainer);
    } else {
        console.log("[YT-SWITCHER] [INFO] Diagnostic: Icons container not found. Unable to position the extension container.");
    }
};

// Add click listener to the custom switch
switchContainer.addEventListener('click', debounce(function(event) {
    // Prevent the click event from propagating to other elements (like the YouTube menu)
    event.stopPropagation();
    // Toggle the theme by sending a message to the background script
    chrome.runtime.sendMessage({ action: 'toggleTheme' });
}, 300));

// Attempt to position the container div on the left of the notifications button
placeContainerOnLeftOfIcons();
    setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'executeThemeCheckScript' });
    }, 5000);  // 5 seconds delay
