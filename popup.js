document.addEventListener('DOMContentLoaded', () => {
    const emailSpan = document.getElementById('user-email');
    const historyList = document.getElementById('history-list');
    const refreshBtn = document.getElementById('refreshBtn');
  
    function updateEmail() {
      chrome.runtime.sendMessage({ command: 'getEmail' }, (response) => {
        if (response && response.email) {
          emailSpan.textContent = response.email;
        } else {
          emailSpan.textContent = 'Not logged in';
        }
      });
    }
  
    function updateHistory() {
      chrome.runtime.sendMessage({ command: 'getHistory' }, (response) => {
        historyList.innerHTML = '';
        if (response && response.history && response.history.length > 0) {
          response.history.forEach((item) => {
            const li = document.createElement('li');
            const visitedTime = new Date(item.last_visit_time).toLocaleString();
            const duration = item.duration ? `${item.duration} sec` : 'N/A';
            li.innerHTML = `
              <div><strong>Title:</strong> ${item.title || 'No Title'}</div>
              <div><strong>URL:</strong> ${item.url}</div>
              <div><strong>Duration:</strong> ${duration}</div>
              <div><strong>Visited:</strong> ${visitedTime}</div>
            `;
            historyList.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.textContent = 'No history found.';
          historyList.appendChild(li);
        }
      });
    }
  
    // Update email and history on load
    updateEmail();
    updateHistory();
  
    // Refresh history manually
    refreshBtn.addEventListener('click', () => {
      updateEmail();
      updateHistory();
    });
  
    // Automatically refresh every 5 seconds
    setInterval(() => {
      updateEmail();
      updateHistory();
    }, 5000);
  });
  