// Helper function to find and select an option
function findSel(sel, name) {
    return [...sel.querySelectorAll("option")].filter(e => e.value == name)[0];
}

// Function to change the favicon
function changeFavicon(value) {
    setFavicon(value);
    localStorage.setItem("shuttle||favicon", value);
}

// Function to change the title
function changeTitle(value) {
    document.title = value;
    localStorage.setItem("shuttle||title", value);
}

// Function to change the theme color
function changeTheme(value) {
    localStorage.setItem("shuttle||themehex", value);
    document.body.style.backgroundColor = value;
}

// Function to reset the theme to default
function resetTheme() {
    localStorage.removeItem("shuttle||themehex");
    document.body.style.backgroundColor = "#0b0b0b";
    document.querySelector("#colorPicker").value = "#0b0b0b";
}

// Function to handle background URL change
function changeBackgroundUrl(url) {
    if (url) {
        document.getElementById('mystery-background').style.backgroundImage = `url(${url})`;
        localStorage.setItem('shuttle||backgroundImage', url);
    } else {
        document.getElementById('mystery-background').style.backgroundImage = '';
        localStorage.removeItem('shuttle||backgroundImage');
    }
}

// Function to reset the custom background
function resetBackground() {
    document.getElementById('mystery-background').style.backgroundImage = '';
    localStorage.removeItem('shuttle||backgroundImage');
    document.querySelector('#backgroundUrl').value = '';
}

// Load saved settings from localStorage on page load
window.addEventListener("load", () => {
    const searchSelector = document.getElementById("se");
    const proxySelector = document.getElementById("proxy");
    try {
        const themeColor = localStorage.getItem("shuttle||themehex");
        if (themeColor) document.querySelector("#colorPicker").value = themeColor;
        if (localStorage.getItem("shuttle||search")) findSel(searchSelector, localStorage.getItem("shuttle||search")).selected = true;
        if (localStorage.getItem("shuttle||proxy")) findSel(proxySelector, localStorage.getItem("shuttle||proxy")).selected = true;
        const backgroundImage = localStorage.getItem('shuttle||backgroundImage');
        if (backgroundImage) {
            document.getElementById('mystery-background').style.backgroundImage = `url(${backgroundImage})`;
            document.querySelector('#backgroundUrl').value = backgroundImage;
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }

    searchSelector.addEventListener("change", e => localStorage.setItem("shuttle||search", e.target.value));
    proxySelector.addEventListener("change", e => localStorage.setItem("shuttle||proxy", e.target.value));
    document.querySelector("#reset-theme").addEventListener("click", resetTheme);
    document.querySelector("#abc").addEventListener("click", abc);
    document.querySelector("#reset-background").addEventListener("click", resetBackground);
    document.querySelector("#backgroundUrl").addEventListener("input", e => changeBackgroundUrl(e.target.value));
});
