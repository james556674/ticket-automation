const TARGET_PRICE = "4,600";
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const REFRESH_INTERVAL = 2000;

let isClicking = false;
let intervalId = null;
let notificationSound = null;
let attemptCount = 0;

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

function tryAddTicket(shouldStartRefresh = true) {
  console.log("Attempting to add ticket...");
  
  const ticketUnits = document.querySelectorAll('.ticket-unit');
  console.log("Found ticket units:", ticketUnits.length);
  
  for (const unit of ticketUnits) {
    const priceElement = unit.querySelector('.ticket-price .ng-binding');
    const priceText = priceElement?.textContent?.trim();
    console.log("Price found:", priceText);

    if (priceText?.includes(`TWD$${TARGET_PRICE}`)) {
      console.log(`Found target price ticket!`);
      
      const soldOutText = unit.querySelector('.ticket-quantity')?.textContent?.trim();
      if (soldOutText === '已售完') {
        console.log("Ticket found but sold out");
        if (shouldStartRefresh) startRefreshing();
        return false;
      }
      
      const plusButton = unit.querySelector('button.plus');
      if (plusButton && !plusButton.disabled) {
        console.log("Found plus button, clicking...");
        playNotificationSound();
        plusButton.click();
        
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
          return true;
        }
      } else {
        console.log("Plus button not found or disabled");
        if (shouldStartRefresh) startRefreshing();
        return false;
      }
    }
  }
  
  console.log("Target price ticket not found");
  if (shouldStartRefresh) startRefreshing();
  return false;
}

function startRefreshing() {
  if (isClicking) return;
  
  console.log("Starting refresh loop...");
  isClicking = true;

  intervalId = setInterval(() => {
    attemptCount++;
    console.log(`Attempt #${attemptCount}: Refreshing page...`);
    // Note: Don't use reload() when running in console
    // as it will terminate the script. Use this only in
    // I will find a way to replace this window.location.reload()
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

console.log("Starting KKTIX ticket automation...");
initializeSound();
tryAddTicket(true);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    console.log("Escape pressed, stopping refresh...");
    toggleClicking();
  }
});
