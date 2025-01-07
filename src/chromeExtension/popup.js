document.addEventListener('DOMContentLoaded', () => {
    const actionButton = document.getElementById('actionButton');
    const stopButton = document.getElementById('stopButton');
    const statusDiv = document.querySelector('.status');

    function updateStatus(message, type = 'normal') {
        statusDiv.textContent = `執行狀態: ${message}`;
        statusDiv.className = 'status ' + type;
    }

    function setRunningState() {
        actionButton.classList.add('running');
        actionButton.disabled = true;
        stopButton.disabled = false;
        updateStatus('Running auto-refresh...', 'running');
    }

    function setStoppedState() {
        actionButton.classList.remove('running');
        actionButton.disabled = false;
        stopButton.disabled = true;
        updateStatus('Stopped', 'stopped');
    }

    actionButton.addEventListener('click', () => {
        console.log('Sending message to content script...');
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) {
                updateStatus('Error: No active tab found', 'stopped');
                return;
            }

            // Set running state before sending message
            setRunningState();

            chrome.tabs.sendMessage(tabs[0].id, { action: "tryAddTicket" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error:', chrome.runtime.lastError);
                    updateStatus('Error: Could not connect to page', 'stopped');
                    setStoppedState();
                    return;
                }
                // Keep running state if successful
                if (response?.status) {
                    updateStatus(response.status, 'running');
                }
            });
        });
    });

    stopButton.addEventListener('click', () => {
        console.log('Stopping action...');
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) {
                updateStatus('Error: No active tab found', 'stopped');
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, { action: "stopAddingTicket" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error:', chrome.runtime.lastError);
                    updateStatus('Error: Could not connect to page', 'stopped');
                    return;
                }
                setStoppedState();
                if (response?.status) {
                    updateStatus(response.status, 'stopped');
                }
            });
        });
    });

    // Initialize stop button as disabled
    stopButton.disabled = true;
});