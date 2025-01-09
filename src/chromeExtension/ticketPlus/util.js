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

  // First try the card-style ticket section
  const cardSections = document.querySelectorAll(".v-card.theme--light");
  for (const section of cardSections) {
    const priceElements = section.querySelectorAll(".text-center.col-sm-3.col-md-3.col-3");
    for (const priceEl of priceElements) {
      // Clean up the text content by removing extra spaces and newlines
      const priceText = priceEl.textContent.trim().replace(/\s+/g, "");
      if (priceText === `NT.${targetPrice}`) {
        console.log(`Found NT.${targetPrice} in card section!`);
        return section;
      }
    }
  }

  // If not found, try the expansion panels
  const allPanels = document.querySelectorAll(".v-expansion-panel");
  for (const panel of allPanels) {
    const priceText = panel.textContent;
    if (priceText.includes(`NT.${targetPrice}`)) {
      console.log(`Found NT.${targetPrice} in expansion panel!`);
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
  const section = openPriceSection(targetPrice);
  if (!section) {
    console.log("Couldn't find price section");
    if (shouldStartRefresh) startRefreshing(targetPrice);
    return false;
  }

  // Wait for panel to open or card to be ready
  setTimeout(() => {
    // Try card-style plus button first
    let plusButton = section.querySelector("button:has(i.mdi-plus.primary-1--text):not([disabled])");
    // If not found, try expansion panel plus button
    if (!plusButton) {
      plusButton = section.querySelector("button:has(i.mdi-plus):not([disabled])");
    }

    if (plusButton) {
      console.log("Found +1 button, clicking...");
      playNotificationSound();
      plusButton.click();

      // Step 3: Click next button after adding ticket
      setTimeout(() => {
        const nextButton = document.querySelector("button.nextBtn.v-btn--block");
        if (nextButton) {
          console.log("Clicking next button!");
          nextButton.click();
          if (isClicking) toggleClicking(); // Stop refresh loop if running
        }
      }, 800);
      return true;
    } else {
      console.log("No enabled tickets available to add");
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
