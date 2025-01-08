const TARGET_PRICE = "4,800";
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
let isClicking = false;
let intervalId = null;
let notificationSound = null;
let attemptCount = 0;

function initializeSound() {
  notificationSound = new Audio(NOTIFICATION_SOUND_URL);
  notificationSound.volume = 0.5; // Adjust volume to 50%
}

function playNotificationSound() {
  if (!notificationSound) {
    initializeSound();
  }
  notificationSound.play().catch(err => console.log("Sound playback failed:", err));
}

// Step 1: Open the ticket section based on price
function openPriceSection(targetPrice) {
  console.log(`Looking for NT.${targetPrice} section...`);

  // Find all panels
  const allPanels = document.querySelectorAll(".v-expansion-panel");

  for (const panel of allPanels) {
    // Get the price text
    const priceText = panel.textContent;
    console.log("Checking panel:", priceText);

    if (priceText.includes(`NT.${targetPrice}`)) {
      console.log(`Found NT.${targetPrice} section!`);
      const headerButton = panel.querySelector(".v-expansion-panel-header");
      if (headerButton) {
        console.log("Clicking to open section...");
        headerButton.click();
        return panel;
      }
    }
  }

  console.log(`Could not find NT.${targetPrice} section`);
  return null;
}

// Step 2: Try to add ticket and proceed
function tryAddTicket(shouldStartRefresh = true, targetPrice = TARGET_PRICE) {
  const panel = openPriceSection(targetPrice);
  if (!panel) {
    console.log("Couldn't find price section");
    if (shouldStartRefresh) startRefreshing();
    return false;
  }

  // Wait for panel to open
  setTimeout(() => {
    const plusButton = panel.querySelector("button:has(i.mdi-plus)");
    if (plusButton) {
      console.log("Found +1 button, clicking...");
      playNotificationSound(); // Play sound when ticket is found
      plusButton.click();

      // Step 3: Click next button after adding ticket
      setTimeout(() => {
        const nextButton = document.querySelector("button.nextBtn.v-btn--block");
        if (nextButton) {
          console.log("Clicking next button!");
          nextButton.click();
          if (isClicking) toggleClicking(); // Stop refresh loop if running
          return true;
        }
      }, 800);
    } else {
      console.log("No tickets available to add");
      if (shouldStartRefresh) startRefreshing(targetPrice);
      return false;
    }
  }, 500);
}

// Step 4: Keep refreshing until we can add a ticket
function startRefreshing(targetPrice) {
  console.log("Starting refresh loop...");
  isClicking = true;

  intervalId = setInterval(() => {
    attemptCount++;
    const refreshButton = document.querySelector("button.float-btn.v-btn--rounded:has(.mdi-refresh)");
    if (refreshButton) {
      console.log(`Attempt #${attemptCount}: Clicking refresh...`);
      refreshButton.click();

      // Wait for content to load
      setTimeout(() => {
        const result = tryAddTicket(false, targetPrice);
        if (!result) {
          console.log(`Attempt #${attemptCount}: Couldn't add ticket, will try again...`);
        }
      }, 1000);
    }
  }, 2000);
}

function toggleClicking() {
  if (isClicking) {
    clearInterval(intervalId);
    isClicking = false;
    console.log(`Stopped refreshing after ${attemptCount} attempts`);
  }
}

// Initial attempt
console.log("Making first attempt to add ticket...");
// tryAddTicket(true);

// Initialize sound when the script starts
// Add a listener for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "tryAddTicket") {
      tryAddTicket(true, request.targetPrice);
      sendResponse({ status: "Ticket addition attempted." });
  } else if (request.action === "stopAddingTicket") {
      toggleClicking(); // Call the function to stop refreshing
      sendResponse({ status: "Ticket addition stopped." });
  }
});
initializeSound();
