// background.js
// Configuration
const BACKEND_URL = 'http://localhost:3000';
let userEmail = null;

// Get user email from storage or prompt
async function getUserEmail() {
  const result = await chrome.storage.local.get(['userEmail']);
  if (result.userEmail) {
    userEmail = result.userEmail;
    console.log('User email loaded:', userEmail);
  }
  return userEmail;
}

// Initialize
getUserEmail();

// ---------- Tracking Tab Durations ----------
let currentTabId = null;
let currentTabStartTime = null;
let currentTabUrl = '';
let currentTabTitle = '';

function finishTracking() {
  if (currentTabId && currentTabStartTime) {
    const durationSec = Math.floor((Date.now() - currentTabStartTime) / 1000);
    if (durationSec > 0 && userEmail && supabase && currentTabUrl) {
      insertHistoryRecord(userEmail, currentTabUrl, currentTabTitle, durationSec);
    }
  }
  currentTabId = null;
  currentTabStartTime = null;
  currentTabUrl = '';
  currentTabTitle = '';
}

async function insertHistoryRecord(email, url, title, duration) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        url,
        title,
        duration,
        last_visit_time: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('History record saved:', data);
    } else {
      console.error('Failed to save history:', response.status, response.statusText);
    }
  } catch (err) {
    console.error('Error saving history:', err);
  }
}

// ---------- Periodic Tracking via Alarm (Every 5 Seconds) ----------
chrome.alarms.create('trackingAlarm', { periodInMinutes: 5 / 60 }); // 5 seconds

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'trackingAlarm') {
    if (currentTabId && currentTabStartTime) {
      finishTracking();
      // Restart tracking for the same tab (if still active)
      chrome.tabs.get(currentTabId, (tab) => {
        if (!chrome.runtime.lastError && tab) {
          currentTabStartTime = Date.now();
          currentTabUrl = tab.url || '';
          currentTabTitle = tab.title || '';
          console.log('Periodic tracking resumed for tab:', currentTabUrl);
        }
      });
    }
  }
});

// ---------- Chrome Event Listeners ----------
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension starting...');
});
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed...');
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  finishTracking();
  // Ensure the tabId is a number.
  currentTabId = Number(activeInfo.tabId);
  currentTabStartTime = Date.now();
  if (!currentTabId) {
    console.error("Invalid tab id:", activeInfo.tabId);
    return;
  }
  chrome.tabs.get(currentTabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      console.error("Error fetching tab info for tabId", currentTabId);
      return;
    }
    currentTabUrl = tab.url || '';
    currentTabTitle = tab.title || '';
    console.log('New active tab:', currentTabUrl);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.url) {
    finishTracking();
    currentTabId = tabId;
    currentTabStartTime = Date.now();
    currentTabUrl = changeInfo.url;
    currentTabTitle = tab.title || '';
    console.log('Tab updated with new URL:', currentTabUrl);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    finishTracking();
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        currentTabId = tab.id;
        currentTabStartTime = Date.now();
        currentTabUrl = tab.url || '';
        currentTabTitle = tab.title || '';
        console.log('Window focus on tab:', currentTabUrl);
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === currentTabId) {
    finishTracking();
  }
});

// ---------- Popup Communication ----------
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.command === 'getEmail') {
    sendResponse({ email: userEmail || '' });
  } else if (msg.command === 'setEmail') {
    userEmail = msg.email;
    await chrome.storage.local.set({ userEmail: msg.email });
    console.log('User email set to:', userEmail);
    sendResponse({ success: true });
  } else if (msg.command === 'getHistory') {
    try {
      const response = await fetch(`${BACKEND_URL}/api/history?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const history = await response.json();
        sendResponse({ history });
      } else {
        sendResponse({ history: [] });
      }
    } catch (err) {
      console.error('Fetch history error:', err);
      sendResponse({ history: [] });
    }
  } else {
    sendResponse({});
  }
  return true; // Keep port open for async responses
});

console.log('Background service worker loaded.');
