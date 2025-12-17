

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
    let dateStr = document.getElementById("scheduleBtn").dataset.date;
    let timeStr = document.getElementById("scheduleBtn").dataset.time;
    let isMeeting = document.getElementById("scheduleBtn").dataset.isMeeting === "true";

    if (!isMeeting) {
        alert("No meeting detected in email!");
        return;
    }

    if (!dateStr) {
        alert("No valid date found in email!");
        return;
    }

    // Function to normalize date from various formats to YYYYMMDD
    function normalizeDate(dateInput) {
        let parsedDate;
        
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateInput)) { 
            // Format: DD/MM/YYYY or MM/DD/YYYY (Ambiguous)
            let parts = dateInput.split("/");
            let day = parseInt(parts[0], 10);
            let month = parseInt(parts[1], 10);
            let year = parseInt(parts[2], 10);
            
            // If month > 12, then it's in DD/MM/YYYY format, swap day & month
            if (month > 12) [day, month] = [month, day];

            parsedDate = new Date(year, month - 1, day);
        } 
        else if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) { 
            // Format: YYYY-MM-DD
            parsedDate = new Date(dateInput);
        } 
        else if (/\b\d{1,2}(st|nd|rd|th)?\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}\b/i.test(dateInput)) {
            // Format: "6th May, 2024" or "6 May 2024"
            parsedDate = new Date(dateInput.replace(/(st|nd|rd|th),?/i, ""));
        } 
        else {
            parsedDate = new Date(dateInput);
        }

        if (isNaN(parsedDate.getTime())) return null; // Invalid date handling

        let year = parsedDate.getFullYear();
        let month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
        let day = parsedDate.getDate().toString().padStart(2, "0");

        return `${year}${month}${day}`; // Final format: YYYYMMDD
    }

    let formattedDate = normalizeDate(dateStr);
    if (!formattedDate) {
        alert("Invalid date format!");
        return;
    }

    // Function to convert time to Google Calendar format (HHMMSS)
    function convertTo24Hour(timeString) {
        if (!timeString) return "100000"; // Default to 10:00 AM if no time

        let match = timeString.match(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i);
        if (!match) return "100000"; // Default to 10:00 AM if format is unrecognized

        let hours = parseInt(match[1], 10);
        let minutes = match[2];
        let period = match[3] ? match[3].toUpperCase() : null;

        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        let formattedHours = hours.toString().padStart(2, "0");
        return `${formattedHours}${minutes}00`; // HHMMSS format
    }

    let formattedTime = convertTo24Hour(timeStr);

    let startDateTime = `${formattedDate}T${formattedTime}`;
    let endDateTime = `${formattedDate}T${(parseInt(formattedTime) + 10000).toString().padStart(6, "0")}`;

    let eventTitle = document.getElementById("subject").innerText || "Meeting";
    let eventDescription = document.getElementById("body").innerText.slice(0, 100) || "Discussion";

    let calendarURL = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&details=${encodeURIComponent(eventDescription)}&dates=${startDateTime}/${endDateTime}`;

    console.log("Opening Google Calendar:", calendarURL);
    chrome.tabs.create({ url: calendarURL });
});