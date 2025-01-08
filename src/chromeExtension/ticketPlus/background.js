// ticket-automation/src/chromeExtension/background.js

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "performAction") {
        // Perform some action based on the request
        console.log("Action performed:", request.data);
        sendResponse({ status: "success", message: "Action completed!" });
    }
});

// Optional: You can add more event listeners or functions as needed
