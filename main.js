// Function to toggle the visibility of the information overlay
function toggleInfoOverlay() {
    const overlay = document.getElementById('infoOverlay');
    overlay.style.display = (overlay.style.display === 'flex') ? 'none' : 'flex';
}

// Function to initialize the overlay visibility on page load
window.onload = function() {
    toggleInfoOverlay(); // Show the info overlay when the page loads
};

let tabs = [];
let uploadedScreenshot = null; // Store the uploaded screenshot

// Preview screenshot when uploaded
function previewScreenshot(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('screenshotPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadedScreenshot = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Validate URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

// Get website favicon
function getFavicon(url) {
    try {
        const urlObject = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=64`;
    } catch (error) {
        return "https://cdn-icons-png.flaticon.com/512/1042/1042280.png"; // Fallback icon
    }
}

// Get website title
async function getWebsiteTitle(url) {
    try {
        const urlObject = new URL(url);
        const hostname = urlObject.hostname;
        const title = hostname
            .replace('www.', '')
            .split('.')[0]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        return title;
    } catch (error) {
        return url;
    }
}

// Toggle Add Tab form
function toggleAddTab() {
    const addTabDiv = document.getElementById('addTab');
    addTabDiv.style.display = addTabDiv.style.display === 'block' ? 'none' : 'block';
}

// Add a new tab
async function addNewTab() {
    const input = document.getElementById('newTabInput');
    const dateAccessInput = document.getElementById('dateAccessInput');
    const dateAccess = dateAccessInput.value; // Use the raw input from datetime-local
    let url = input.value.trim();

    if (!url) return;

    // Add https:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    if (!isValidUrl(url)) {
        alert("Please enter a valid URL (e.g., example.com or https://example.com)");
        return;
    }

    try {
        // Disable inputs while processing
        input.disabled = true;
        dateAccessInput.disabled = true;

        const title = await getWebsiteTitle(url);
        const icon = getFavicon(url);

        tabs.push({
            title: title,
            icon: icon,
            url: url,
            screenshot: uploadedScreenshot, // Add screenshot
            dateAccess: dateAccess // Save the full date and time
        });

        // Clear inputs and reset state
        input.value = '';
        dateAccessInput.value = '';
        input.disabled = false;
        dateAccessInput.disabled = false;

        const preview = document.getElementById('screenshotPreview');
        preview.src = '';
        preview.style.display = 'none';
        uploadedScreenshot = null;

        renderTabs();
        toggleAddTab();
    } catch (error) {
        console.error('Error adding tab:', error);
        alert('Error adding tab. Please try again.');
        input.disabled = false;
        dateAccessInput.disabled = false;
    }
}

// Create a single tab element
function createTab(tab, index) {
    const tabElement = document.createElement('a');
    tabElement.className = 'tab';
    tabElement.href = tab.url;
    tabElement.target = '_blank';
    tabElement.innerHTML = `
        <img class="favicon" src="${tab.icon}" alt="">
        <span class="title">${tab.title}</span>
        <span class="transform-text">${tab.transform || ''}</span>
    `;

    // Create and append the close button
    const closeButton = document.createElement('span');
    closeButton.className = 'close';
    closeButton.textContent = '×';
    closeButton.onclick = (event) => {
        event.stopPropagation(); // Prevent the click from propagating to the link
        closeTab(index); // Call the closeTab function with the correct index
    };
    tabElement.appendChild(closeButton);

    if (tab.screenshot) {
        const screenshotImg = document.createElement('img');
        screenshotImg.src = tab.screenshot;
        screenshotImg.classList.add('tab-screenshot');
        tabElement.appendChild(screenshotImg);
    }

    return tabElement;
}

function closeTab(index) {
    if (index < 0 || index >= tabs.length) {
        console.error('Invalid index for tab:', index);
        return;
    }

    // Remove the tab from the array
    tabs.splice(index, 1);

    // Re-render the tabs
    renderTabs();
}

function renderTabs() {
    const container = document.getElementById('tabsContainer');
    container.innerHTML = ''; // Clear the container

    tabs.forEach((tab, index) => {
        const tabElement = createTab(tab, index);
        container.appendChild(tabElement);
    });
}

function printCatalog() {
    const catalogWindow = window.open('', '_blank');

    catalogWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;700&display=swap" rel="stylesheet">
            <title>My Tabs Citation</title>
            <style>
                @media print {
                    @page {
                        margin: 0;
                    }

                    body {
                        font-family: "Work Sans", sans-serif;
                        margin: 0;
                        padding: 4vw;
                        background-color: #fff;
                    }

                    .cover-page {
                        height: 80vh; /* Full height of the page */
                        display: flex;
                        flex-direction: column;
                        justify-content: center; /* Center the content vertically */
                        align-items: center; /* Center the content horizontally */
                        text-align: center;
                        position: relative; /* Positioning for the bottom text */
                    }

                    .cover-page h1 {
                        font-size: 6vw;
                        margin: 0;
                        color: black;
                        font-weight: bold;
                        align-self: center;
                    }

                    .cover-page h2 {
                        font-size: 3vw;
                        margin-top: 5vh;
                        color: black;
                        font-style: italic;
                    }

                    .cover-page p {
                        font-size: 2.5vw;
                        color: black;
                        margin: 0;
                        position: absolute;
                        bottom: 3vw; 
                        left: 50%;
                        transform: translateX(-50%); 
                        width: 80%;
                    }

                    .tab {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-top: 5vh;
                        margin-bottom: 3vh;
                        padding: 2vw;
                        border-bottom: 1px solid #ddd;
                        justify-content: center;
                        text-align: center;
                        page-break-inside: avoid;
                    }

                    .tab img {
                        max-width: 80%;
                        max-height: 70vh;
                        margin-bottom: 2vh;
                    }

                    .tab .title {
                        font-size: 3vw;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 1vh;
                    }

                    .tab .date-access {
                        font-size: 2vw;
                        color: #666;
                        margin-top: 1vh;
                    }

                    .tab .screenshot {
                        width: 90%; 
                        max-height: 70vh;
                        margin: 2vh 0;
                        object-fit: contain;
                        display: block;
                        border-radius: 0.5vw;
                    }

                    .page-break {
                        page-break-before: always;
                    }
                }
            </style>
        </head>
        <body>
            <div class="cover-page">
                <h1>My Tabs Citation</h1>
                <div class="bottom-content">
                <p>This document is a curated archive of my saved tabs, organized and captured through Tabs Manager website.</p>
                </div>
            </div>
            <div class="page-break"></div>
    `);

    // Iterate over tabs and add them to the print content
    tabs.forEach(tab => {
        const dateAccess = tab.dateAccess || 'Unknown Access Date';
        catalogWindow.document.write(`
            <div class="tab">
                <img src="${tab.icon}" alt="Favicon">
                <a href="${tab.url}" target="_blank" class="title">${tab.title}</a>
                ${tab.screenshot ? `<img src="${tab.screenshot}" alt="Screenshot" class="screenshot">` : ''}
                <div class="date-access">Accessed On: ${new Date(dateAccess).toLocaleString()}</div>
            </div>
            <div class="page-break"></div>
        `);
    });

    catalogWindow.document.write(`
        </body>
        </html>
    `);
    catalogWindow.document.close();
    catalogWindow.print();
}


