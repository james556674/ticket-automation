
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "performAction") {
        console.log("Action performed:", request.data);
        sendResponse({ status: "success", message: "Action completed!" });
    }
});
