const SHOW_DATE_TO_PURCHASE = "2025/02/14";
const TARGET_KEYWORDS = ["2300", "3980", "A1區", "2280"];
const TICKET_QUANTITY = 1;
const RELOAD_DELAY = 1000;

function isShowSelectionPage() {
    return window.location.href.includes('/activity/detail/');
}

function isAreaSelectionPage() {
    return window.location.href.includes('/ticket/area/');
}

function isTicketQuantityPage() {
    return window.location.href.includes('/ticket/ticket/');
}

async function clickInitialPurchaseButton() {
    try {
        const purchaseButton = document.querySelector('.tab-func li.buy a');
        if (purchaseButton) {
            purchaseButton.click();
            setTimeout(() => {
                selectShowAndProceed(SHOW_DATE_TO_PURCHASE);
            }, 500);
            return true;
        }
        console.log('Initial purchase button not found');
        return false;
    } catch (error) {
        console.error('Error clicking initial purchase button:', error);
        return false;
    }
}

async function selectShowAndProceed(targetDate) {
    try {
        const dateRows = document.querySelectorAll('.table tbody tr');
        
        for (const row of dateRows) {
            const dateText = row.querySelector('td:nth-child(1)').textContent.trim();
            
            if (dateText.includes(targetDate)) {
                const purchaseButton = row.querySelector('button[data-href*="/ticket/area/"]');
                if (purchaseButton) {
                    if (row.textContent.includes('售完') || row.textContent.includes('已售完')) {
                        console.log(`Show date ${targetDate} is sold out. Reloading page in ${RELOAD_DELAY/1000} seconds...`);
                        setTimeout(() => {
                            window.location.reload();
                        }, RELOAD_DELAY);
                        return false;
                    }
                    purchaseButton.click();
                    return true;
                }
            }
        }
        
        console.log(`Show date ${targetDate} not found or not available`);
        return false;
    } catch (error) {
        console.error('Error in selectShowAndProceed:', error);
        return false;
    }
}

async function selectAreaAndProceed() {
    try {
        const autoSelectRadio = document.getElementById('select_form_auto');
        if (autoSelectRadio && !autoSelectRadio.checked) {
            autoSelectRadio.click();
        }

        const allAreas = document.querySelectorAll('.area-list li');
        let allSoldOut = true;
        
        for (const keyword of TARGET_KEYWORDS) {
            console.log(`Searching for keyword: ${keyword}`);
            for (const area of allAreas) {
                const areaText = area.textContent.trim();
                
                if (areaText.includes(keyword)) {
                    console.log(`Found matching area: ${areaText}`);
                    if (!areaText.includes('已售完')) {
                        allSoldOut = false;
                        if (area.classList.contains('select_form_a') || area.classList.contains('select_form_b')) {
                            console.log(`Clicking area: ${areaText}`);
                            area.querySelector('a').click();
                            return true;
                        }
                    }
                }
            }
        }
        
        if (allSoldOut) {
            console.log(`All target areas are sold out. Reloading page in ${RELOAD_DELAY/1000} seconds...`);
            setTimeout(() => {
                window.location.reload();
            }, RELOAD_DELAY);
        }
        return false;
        
    } catch (error) {
        console.error('Error in selectAreaAndProceed:', error);
        return false;
    }
}

async function selectTicketQuantityAndProceed() {
    try {
        const ticketSelect = document.querySelector('select[id^="TicketForm_ticketPrice_"]');
        if (ticketSelect) {
            ticketSelect.value = TICKET_QUANTITY || 1;
        }

        const agreeCheckbox = document.getElementById('TicketForm_agree');
        if (agreeCheckbox && !agreeCheckbox.checked) {
            agreeCheckbox.click();
        }

        // stop here and wait for manual input
        const captchaInput = document.getElementById('TicketForm_verifyCode');
        if (captchaInput) {
            captchaInput.focus();
        }

        return true;
    } catch (error) {
        console.error('Error in selectTicketQuantityAndProceed:', error);
        return false;
    }
}


async function proceedToNextStep() {
    if (isShowSelectionPage()) {
        return await clickInitialPurchaseButton();
    }
    if (isAreaSelectionPage()) {
        return await selectAreaAndProceed();
    }
    if (isTicketQuantityPage()) {
        return await selectTicketQuantityAndProceed();
    }
    return false;
}

// Start the process
proceedToNextStep();