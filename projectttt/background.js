let lastEmailData = {}; // Stores extracted email data

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.subject && message.sender && message.body) {
        console.log("Background received email data:", message);
        lastEmailData = message;
        sendResponse({ status: "Email data stored in background" });
    }

    if (message.action === "getEmailData") {
        console.log("Popup requested email data:", lastEmailData);
        sendResponse(lastEmailData);
    }
});
