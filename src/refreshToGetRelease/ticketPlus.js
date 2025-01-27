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
function openPriceSection() {
  console.log(`Looking for NT.${TARGET_PRICE} section...`);

  // Find all panels
  const allPanels = document.querySelectorAll(".v-expansion-panel");

  for (const panel of allPanels) {
    // Get the price text
    const priceText = panel.textContent;
    console.log("Checking panel:", priceText);

    if (priceText.includes(`NT.${TARGET_PRICE}`)) {
      console.log(`Found NT.${TARGET_PRICE} section!`);
      const headerButton = panel.querySelector(".v-expansion-panel-header");
      if (headerButton) {
        console.log("Clicking to open section...");
        headerButton.click();
        return panel;
      }
    }
  }

  console.log(`Could not find NT.${TARGET_PRICE} section`);
  return null;
}

// Step 2: Try to add ticket and proceed
function tryAddTicket(shouldStartRefresh = true) {
  const panel = openPriceSection();
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
      if (shouldStartRefresh) startRefreshing();
      return false;
    }
  }, 500);
}

// Step 4: Keep refreshing until we can add a ticket
function startRefreshing() {
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
        const result = tryAddTicket(false);
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
tryAddTicket(true);

// Initialize sound when the script starts
initializeSound();