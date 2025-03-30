// Function to extract date & time from email text
function extractDateTimeFromText(text) {
    const dateRegex = /\b(\d{1,2}(st|nd|rd|th)?\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}|\d{1,2}\/\d{1,2}\/\d{4})\b/gi;
    const timeRegex = /\b(\d{1,2}:\d{2}\s?(AM|PM)?)\b/gi;

    let dateMatch = text.match(dateRegex);
    let timeMatch = text.match(timeRegex);

    return { extractedDate: dateMatch ? dateMatch[0] : null, extractedTime: timeMatch ? timeMatch[0] : null };
}

// Function to check if email context suggests a meeting
function isMeetingContext(text) {
    const meetingKeywords = [
        "meeting", "schedule", "appointment", "call", "discussion", 
        "conference", "session", "sync", "catch up", "connect"
    ];
    
    return meetingKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

// Extract the open email
function extractOpenEmail() {
    try {
        console.log("Checking for an open email...");

        let subject = document.querySelector("h2[data-legacy-thread-id]")?.innerText || "No Subject";
        let sender = document.querySelector(".gD")?.innerText || "Unknown Sender";
        let body = document.querySelector(".a3s.aiL")?.innerText || "No Body Found";

        let { extractedDate, extractedTime } = extractDateTimeFromText(body);
        let isMeeting = isMeetingContext(body);

        let emailData = { subject, sender, body, extractedDate, extractedTime, isMeeting };

        chrome.runtime.sendMessage(emailData, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Error sending message:", chrome.runtime.lastError);
            } else {
                console.log("Email data sent to background:", response);
            }
        });
    } catch (error) {
        console.error("Error extracting email:", error);
    }
}

// Detect when a user opens an email
const observer = new MutationObserver(extractOpenEmail);
observer.observe(document.body, { childList: true, subtree: true });

// Handle "Get Reply" action
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "openReply") {
        try {
            console.log("Opening reply window...");

            let replyButton = document.querySelector('[aria-label="Reply"], [data-tooltip="Reply"]');
            if (replyButton) {
                replyButton.click();
                setTimeout(() => {
                    let replyBox = document.querySelector('.editable');
                    if (replyBox) {
                        replyBox.innerHTML = "Hello, how are you?";
                        console.log("Reply message added.");
                    } else {
                        console.warn("Reply box not found.");
                    }
                }, 2000);
            } else {
                console.warn("Reply button not found.");
            }
        } catch (error) {
            console.error("Error opening reply window:", error);
        }
    }
});
