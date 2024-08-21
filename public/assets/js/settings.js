document.addEventListener('DOMContentLoaded', () => {
    const searchSelector = document.getElementById("se");
    const proxySelector = document.getElementById("proxy");
    const colorPicker = document.getElementById("colorPicker");
    const backgroundUrlInput = document.getElementById("backgroundUrl");
    const setBackgroundButton = document.getElementById("set-background");

    // Function to set the favicon (assuming this function is defined elsewhere)
    function setFavicon(url) {
        const link = document.querySelector("link[rel='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = url;
        document.head.appendChild(link);
    }

    // Function to find the option by value
    function findSel(sel, value) {
        return [...sel.querySelectorAll("option")].find(option => option.value === value);
    }

    // Function to change the page title
    function changeTitle(value) {
        document.title = value;
        localStorage.setItem("shuttle||title", value);
    }

    // Function to change the favicon
    function changeFavicon(value) {
        setFavicon(value);
        localStorage.setItem("shuttle||favicon", value);
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
        colorPicker.value = "#0b0b0b";
    }

    // Function to set the custom background URL
    function setCustomBackground() {
        const url = backgroundUrlInput.value.trim();
        if (url) {
            document.body.style.backgroundImage = `url("${url}")`;
            localStorage.setItem("shuttle||backgroundUrl", url);
        } else {
            alert("Please enter a valid URL.");
        }
    }

    // Initialize settings on page load
    function initializeSettings() {
        const savedTheme = localStorage.getItem("shuttle||themehex");
        if (savedTheme) {
            colorPicker.value = savedTheme;
            document.body.style.backgroundColor = savedTheme;
        }

        const savedSearch = localStorage.getItem("shuttle||search");
        if (savedSearch) {
            const searchOption = findSel(searchSelector, savedSearch);
            if (searchOption) searchOption.selected = true;
        }

        const savedProxy = localStorage.getItem("shuttle||proxy");
        if (savedProxy) {
            const proxyOption = findSel(proxySelector, savedProxy);
            if (proxyOption) proxyOption.selected = true;
        }

        const savedBackgroundUrl = localStorage.getItem("shuttle||backgroundUrl");
        if (savedBackgroundUrl) {
            backgroundUrlInput.value = savedBackgroundUrl;
            document.body.style.backgroundImage = `url("${savedBackgroundUrl}")`;
        }
    }

    // Event listeners
    searchSelector.addEventListener("change", e => {
        localStorage.setItem("shuttle||search", e.target.value);
    });

    proxySelector.addEventListener("change", e => {
        localStorage.setItem("shuttle||proxy", e.target.value);
    });

    document.querySelector("#reset-theme").addEventListener("click", resetTheme);
    document.querySelector("#abc").addEventListener("click", () => {
        console.log("About:Blank Cloaking clicked");
    });
    document.querySelector("#mystery-button").addEventListener("click", () => {
        document.body.style.backgroundImage = "";
        localStorage.removeItem("shuttle||backgroundUrl");
    });
    setBackgroundButton.addEventListener("click", setCustomBackground);

    // Initialize settings on page load
    initializeSettings();
});
