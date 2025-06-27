const apiUrl = 'https://eci.ec.europa.eu/045/public/api/report/progression';

const counterContainer = document.getElementById('counter');
const progressBarElement = document.getElementById('progress-bar');
const progressTextElement = document.getElementById('progress-text');

let isOdometerInitialized = false;
let lastKnownCountString = '0';

/**
 * Checks the media query to determine the correct digit height from CSS.
 * @returns {number} The height of a digit in 'rem' units.
 */
function getDigitHeight() {
    if (window.matchMedia("(max-width: 768px)").matches) {
        return 4.5;
    } else {
        return 9;
    }
}

/**
 * Creates the odometer structure and animates it from 0.
 * @param {string} numberString - The target number string.
 */
function initializeAndAnimateOdometer(numberString) {
    counterContainer.innerHTML = '';
    const characters = numberString.split('');
    const digitHeight = getDigitHeight();

    characters.forEach(char => {
        if (!isNaN(parseInt(char))) {
            const digit = parseInt(char);
            const slot = document.createElement('div');
            slot.className = 'digit-slot';
            const reel = document.createElement('div');
            reel.className = 'digit-reel';

            for (let i = 0; i <= 9; i++) {
                const d = document.createElement('div');
                d.className = 'digit';
                d.textContent = i;
                reel.appendChild(d);
            }

            reel.style.transition = 'none';
            reel.style.transform = `translateY(0rem)`;

            slot.appendChild(reel);
            counterContainer.appendChild(slot);
        } else {
            const comma = document.createElement('div');
            comma.className = 'comma';
            comma.textContent = char;
            counterContainer.appendChild(comma);
        }
    });

    setTimeout(() => {
        const reels = counterContainer.querySelectorAll('.digit-reel');
        let reelIndex = 0;
        characters.forEach(char => {
            if (!isNaN(parseInt(char))) {
                const digit = parseInt(char);
                const reel = reels[reelIndex];
                if (reel) {
                    reel.style.transition = 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
                    reel.style.transform = `translateY(-${digit * digitHeight}rem)`;
                }
                reelIndex++;
            }
        });
    }, 100);
}

/**
 * Updates the existing odometer reels to a new number.
 * @param {string} numberString - The formatted number string.
 */
function updateOdometer(numberString) {
    const characters = numberString.split('');
    const digitHeight = getDigitHeight();
    const reels = counterContainer.querySelectorAll('.digit-reel');
    let reelIndex = 0;

    characters.forEach(char => {
        if (!isNaN(parseInt(char))) {
            const digit = parseInt(char);
            const reel = reels[reelIndex];
            if (reel) {
                reel.style.transform = `translateY(-${digit * digitHeight}rem)`;
            }
            reelIndex++;
        }
    });
}

async function updateData() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const newCount = data.signatureCount;
        const goal = data.goal;
        lastKnownCountString = newCount.toLocaleString('en-US');

        if (!isOdometerInitialized) {
            initializeAndAnimateOdometer(lastKnownCountString);
            isOdometerInitialized = true;
        } else {
            const currentLength = counterContainer.children.length;
            if (currentLength !== lastKnownCountString.length) {
                initializeAndAnimateOdometer(lastKnownCountString);
            } else {
                updateOdometer(lastKnownCountString);
            }
        }

        const percentage = Math.min(100, (newCount / goal) * 100);
        progressBarElement.style.width = `${percentage}%`;
        progressTextElement.textContent = `${newCount.toLocaleString()} / ${goal.toLocaleString()} signatures (${percentage.toFixed(2)}%)`;

    } catch (error) {
        console.error("Could not fetch data:", error);
        progressTextElement.textContent = "Could not load progress data.";
    }
}

function initializePage() {
    counterContainer.innerHTML = `<div class="digit-slot"><div class="digit-reel" style="transform: translateY(0rem);"><div class="digit">0</div></div></div>`;

    updateData();
    setInterval(updateData, 10000);
}

function handleResize() {
    if (isOdometerInitialized) {
        const currentLength = counterContainer.children.length;
        if (currentLength !== lastKnownCountString.length) {
            initializeAndAnimateOdometer(lastKnownCountString);
        } else {
            updateOdometer(lastKnownCountString);
        }
    }
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
});

initializePage();