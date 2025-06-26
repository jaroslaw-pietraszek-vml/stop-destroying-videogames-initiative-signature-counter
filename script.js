const apiUrl = 'https://eci.ec.europa.eu/045/public/api/report/progression';

const counterContainer = document.getElementById('counter');
const progressBarElement = document.getElementById('progress-bar');
const progressTextElement = document.getElementById('progress-text');

let isOdometerInitialized = false;

/**
* Creates the initial HTML structure for the odometer.
* @param {string} numberString - The target number string (e.g., "53,118").
*/
function initializeAndAnimateOdometer(numberString) {
   counterContainer.innerHTML = '';
   const characters = numberString.split('');
   const digitHeight = 9;

   characters.forEach(char => {
       if (!isNaN(parseInt(char))) {
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
   }, 100); // A 100ms delay is plenty
}

/**
* Updates the existing odometer reels to a new number.
* @param {string} numberString - The formatted number string.
*/
function updateOdometer(numberString) {
   const characters = numberString.split('');
   const digitHeight = 9;
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

/**
* Creates the odometer structure from scratch. Used when digit count changes.
* @param {string} numberString - The formatted number string.
*/
function createOdometerStructure(numberString) {
   counterContainer.innerHTML = '';
   initializeAndAnimateOdometer(numberString);
}

async function updateData() {
   try {
       const response = await fetch(apiUrl);
       if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
       
       const data = await response.json();
       const newCount = data.signatureCount;
       const goal = data.goal;
       const newCountString = newCount.toLocaleString('en-US');

       if (!isOdometerInitialized) {
           initializeAndAnimateOdometer(newCountString);
           isOdometerInitialized = true;
       } else {
           const currentLength = counterContainer.children.length;
           if (currentLength !== newCountString.length) {
               createOdometerStructure(newCountString);
           } else {
               updateOdometer(newCountString);
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
   const slot = document.createElement('div');
   slot.className = 'digit-slot';
   const reel = document.createElement('div');
   reel.className = 'digit-reel';
   const d = document.createElement('div');
   d.className = 'digit';
   d.textContent = '0';
   reel.appendChild(d);
   slot.appendChild(reel);
   counterContainer.appendChild(slot);
   updateData();
   setInterval(updateData, 5 * 1000);
}

initializePage();