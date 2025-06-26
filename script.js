const apiUrl = 'https://eci.ec.europa.eu/045/public/api/report/progression';

const counterElement = document.getElementById('counter');
const progressBarElement = document.getElementById('progress-bar');
const progressTextElement = document.getElementById('progress-text');

async function updateCounter() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const count = data.signatureCount;
        const goal = data.goal;
        const percentage = Math.min(100, (count / goal) * 100);
        counterElement.textContent = count.toLocaleString();
        progressBarElement.style.width = `${percentage}%`;
        progressTextElement.textContent = `${count.toLocaleString()} / ${goal.toLocaleString()} signatures (${percentage.toFixed(2)}%)`;

    } catch (error) {
        console.error("Could not fetch data:", error);
        counterElement.textContent = "Error";
        progressTextElement.textContent = "Could not load progress data.";
    }
}

updateCounter();

setInterval(updateCounter, 5 * 1000);