document.addEventListener('DOMContentLoaded', () => {
    const emailSpan = document.getElementById('user-email');
    const emailInput = document.getElementById('email-input');
    const saveEmailBtn = document.getElementById('saveEmailBtn');
    const historyList = document.getElementById('history-list');
    const refreshBtn = document.getElementById('refreshBtn');
  
    function updateEmail() {
      chrome.runtime.sendMessage({ command: 'getEmail' }, (response) => {
        if (response && response.email) {
          emailSpan.textContent = response.email;
          emailInput.value = response.email;
        } else {
          emailSpan.textContent = 'Not set';
        }
      });
    }

    function saveEmail() {
      const email = emailInput.value.trim();
      if (!email) {
        alert('Please enter a valid email');
        return;
      }
      chrome.runtime.sendMessage({ command: 'setEmail', email }, (response) => {
        if (response && response.success) {
          alert('Email saved successfully!');
          updateEmail();
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
  
    // Update email on load
    updateEmail();
  
    // Save email button
    saveEmailBtn.addEventListener('click', saveEmail);

    // Refresh history manually
    refreshBtn.addEventListener('click', () => {
      updateHistory();
    });
  
    // Automatically refresh every 10 seconds
    setInterval(() => {
      updateHistory();
    }, 10000);
  });
  