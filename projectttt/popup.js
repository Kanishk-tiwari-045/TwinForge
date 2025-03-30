chrome.runtime.sendMessage({ action: "getEmailData" }, (response) => {
    console.log("Popup received email data:", response);

    if (chrome.runtime.lastError) {
        console.error("Error fetching data from background:", chrome.runtime.lastError);
        return;
    }

    if (response && response.sender && response.subject && response.body) {
        document.getElementById("sender").innerText = response.sender;
        document.getElementById("subject").innerText = response.subject;
        document.getElementById("body").innerText = response.body;

        document.getElementById("scheduleBtn").dataset.date = response.extractedDate || "";
        document.getElementById("scheduleBtn").dataset.time = response.extractedTime || "";
        document.getElementById("scheduleBtn").dataset.isMeeting = response.isMeeting || "false";
    } else {
        document.getElementById("sender").innerText = "No email data found.";
        document.getElementById("subject").innerText = "";
        document.getElementById("body").innerText = "";
    }
});

// Handle "Get Reply" button
document.getElementById("replyBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "openReply" });
    });
});

// Handle "Schedule Meeting" button
document.getElementById("scheduleBtn").addEventListener("click", () => {
    let date = document.getElementById("scheduleBtn").dataset.date;
    let time = document.getElementById("scheduleBtn").dataset.time;
    let isMeeting = document.getElementById("scheduleBtn").dataset.isMeeting === "true";

    if (!isMeeting) {
        alert("No meeting detected in email!");
        return;
    }

    if (!date) {
        alert("No valid date found in email!");
        return;
    }

    let formattedDateTime = date + (time ? " " + time : " 10:00 AM");

    let eventTitle = document.getElementById("subject").innerText || "Meeting";
    let eventDescription = document.getElementById("body").innerText.slice(0, 100) || "Discussion";

    let calendarURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&details=${encodeURIComponent(eventDescription)}&dates=${encodeURIComponent(formattedDateTime)}`;

    console.log("Opening Google Calendar:", calendarURL);
    chrome.tabs.create({ url: calendarURL });
});
