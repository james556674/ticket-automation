const TARGET_PRICE = "4,600";
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const REFRESH_INTERVAL = 2000;
let isClicking = false;
let intervalId = null;
let notificationSound = null;
let attemptCount = 0;
let isRunning = true;
let enableReload = false;

function initializeSound() {
  notificationSound = new Audio(NOTIFICATION_SOUND_URL);
  notificationSound.volume = 0.5;
}

function playNotificationSound() {
  if (!notificationSound) {
    initializeSound();
  }
  notificationSound.play().catch(err => console.log("Sound playback failed:", err));
}

function findTargetTicket() {
  console.log("Looking for ticket units...");
  console.log("Target price we're looking for:", `TWD$${TARGET_PRICE}`);
  
  const ticketUnits = document.querySelectorAll('.ticket-unit');
  console.log("Found ticket units:", ticketUnits.length);
  
  for (const unit of ticketUnits) {
    const priceElement = unit.querySelector('.ticket-price .ng-binding');
    const priceText = priceElement?.textContent?.trim();
    const ticketName = unit.querySelector('.ticket-name')?.textContent?.trim();
    
    console.log({
      ticketName,
      priceText,
      expectedPrice: `TWD$${TARGET_PRICE}`,
      matches: priceText?.includes(`TWD$${TARGET_PRICE}`),
      rawPriceText: priceText ? JSON.stringify(priceText) : 'null'
    });

    if (priceText?.includes(`TWD$${TARGET_PRICE}`)) {
      const plusButton = unit.querySelector('button.plus');
      if (!plusButton || plusButton.disabled) {
        console.log(`Found target price ticket but button is not clickable`);
        continue;
      }
      
      console.log(`Found valid target price ticket: ${ticketName}`);
      return unit;
    }
  }
  
  console.log("Target price ticket not found");
  return null;
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found after ${timeout}ms`));
        return;
      }

      requestAnimationFrame(checkElement);
    };

    checkElement();
  });
}

async function tryAddTicket(shouldStartRefresh = true) {
  if (isRunning === false) {
    console.log("Ticket already added, stopping execution");
    return false;
  }

  try {
    await waitForElement('.ticket-unit');
    console.log("Ticket units loaded, proceeding with search...");
    
    const ticketUnit = findTargetTicket();
    if (!ticketUnit) {
      console.log("Couldn't find target ticket");
      if (shouldStartRefresh) startRefreshing();
      return false;
    }

    const soldOutText = ticketUnit.querySelector('.ticket-quantity')?.textContent?.trim();
    if (soldOutText === '已售完') {
      console.log("Ticket found but sold out");
      if (shouldStartRefresh) startRefreshing();
      return false;
    }

    const plusButton = ticketUnit.querySelector('button.plus');
    if (plusButton && !plusButton.disabled) {
      console.log("Found plus button, clicking...");
      playNotificationSound();
      plusButton.click();

      setTimeout(() => {
        const agreeCheckbox = document.querySelector('#person_agree_terms');
        if (agreeCheckbox && !agreeCheckbox.checked) {
          console.log("Clicking agreement checkbox...");
          agreeCheckbox.click();
        }

        const nextButton = document.querySelector('.register-new-next-button-area button.btn');
        if (nextButton && !nextButton.disabled) {
          console.log("Clicking next button...");
          nextButton.click();
          if (isClicking) toggleClicking();
          isRunning = false;
          enableReload = false;
          console.log("Ticket added successfully, stopping automation");
          return true;
        }
      }, 800);
    }

    if (shouldStartRefresh) startRefreshing();
    return false;
  } catch (error) {
    console.log("Error waiting for ticket content:", error);
    if (shouldStartRefresh) startRefreshing();
    return false;
  }
}

function startRefreshing() {
  if (isClicking) return;
  
  console.log("Starting refresh loop...");
  isClicking = true;

  intervalId = setInterval(() => {
    attemptCount++;
    console.log(`Attempt #${attemptCount}: Refreshing page...`);
    window.location.reload();
    
    setTimeout(() => {
      const result = tryAddTicket(false);
      if (!result) {
        console.log(`Attempt #${attemptCount}: Couldn't add ticket, will try again...`);
      }
    }, 1000);
  }, REFRESH_INTERVAL);
}

function toggleClicking() {
  if (isClicking) {
    clearInterval(intervalId);
    isClicking = false;
    console.log(`Stopped refreshing after ${attemptCount} attempts`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Page loaded, isRunning:", isRunning);
    tryAddTicket(false);
});

isRunning = true;
tryAddTicket(false);
initializeSound();

