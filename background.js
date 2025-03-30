// background.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://hfduzkjpzvowjzrkeagp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZHV6a2pwenZvd2p6cmtlYWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzIzMjMyOSwiZXhwIjoyMDU4ODA4MzI5fQ.tcpxeMb245YtSAKAyhIPUCKFpPapNHwsothzbf90apA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client created in background service worker.');

// ---------- Google OAuth Setup ----------
let userEmail = null;

function doGoogleOAuth() {
  const clientId = '159280478946-7hhig5r48po3nhia56tnl8nsh09dakm6.apps.googleusercontent.com'; // Replace with your Google client ID
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth' +
    `?client_id=${clientId}` +
    '&response_type=token' +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.email')}` +
    '&prompt=select_account';

  chrome.identity.launchWebAuthFlow(
    { url: authUrl, interactive: true },
    async (redirectResponseUrl) => {
      if (chrome.runtime.lastError) {
        console.error('OAuth flow error:', chrome.runtime.lastError.message);
        return;
      }
      if (redirectResponseUrl) {
        const accessToken = getAccessTokenFromUrl(redirectResponseUrl);
        if (accessToken) {
          try {
            const userInfo = await fetchGoogleUserInfo(accessToken);
            userEmail = userInfo.email || null;
            console.log('User email fetched via OAuth:', userEmail);
          } catch (err) {
            console.error('Failed to fetch user info:', err);
          }
        }
      }
    }
  );
}

function getAccessTokenFromUrl(redirectUrl) {
  const hashFragment = redirectUrl.split('#')[1];
  if (!hashFragment) return null;
  const params = new URLSearchParams(hashFragment);
  return params.get('access_token');
}

async function fetchGoogleUserInfo(token) {
  const resp = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) {
    throw new Error(`Userinfo request failed: ${resp.status}`);
  }
  return await resp.json();
}

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
    const { data, error } = await supabase
      .from('browsing_history')
      .insert([{ email, url, title, duration }]);
    if (error) {
      console.error('Error inserting record:', JSON.stringify(error, null, 2));
    } else {
      console.log('Record inserted:', data);
    }
  } catch (err) {
    console.error('Insert failed:', err);
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
  doGoogleOAuth();
});
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed...');
  doGoogleOAuth();
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
  } else if (msg.command === 'getHistory') {
    try {
      const { data, error } = await supabase
        .from('browsing_history')
        .select('*')
        .eq('email', userEmail)
        .order('id', { ascending: false })
        .limit(20);
      if (error) {
        console.error('Error fetching history:', error);
        sendResponse({ history: [] });
      } else {
        sendResponse({ history: data });
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
