document.getElementById('jumpBtn').addEventListener('click', () => {
    const responseNumber = parseInt(document.getElementById('responseNumber').value, 10);

    if (responseNumber) {
        // Ensure the script is running only on the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: jumpToResponse,
                args: [responseNumber]
            });
            window.close(); // Hide the extension popup
        });
    } else {
        alert('Please enter a valid response number');
    }
});

// Add event listener for Enter key
document.getElementById('responseNumber').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key action
        document.getElementById('jumpBtn').click(); // Trigger button click
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('responseNumber');
    if (inputField) {
        inputField.focus();
    }
});

// This function will run in the context of the active page
function jumpToResponse(responseNumber) {
    // Get references to navigation buttons and the current response info
    let prevButton = document.querySelector('button[aria-label="Previous response"]');
    let nextButton = document.querySelector('button[aria-label="Next response"]');
    let numbers = document.querySelector('div.tabular-nums');

    // Get references to question and answer elements
    answerElement = document.querySelector('article[data-testid="conversation-turn-3"]');
    questionElement = document.querySelector('article[data-testid="conversation-turn-2"]');
    questionElement = questionElement.querySelector('div[data-message-author-role="user"]');
    questionElement = questionElement.parentElement;

    if (!numbers) {
        alert('Could not find the response tracker on this page');
        return;
    }

    // Extract the current response number and total from the string (e.g., "20/30")
    let [current, total] = numbers.innerText.split('/').map(num => parseInt(num, 10));

    // Check if the responseNumber is within range
    if (responseNumber < 1 || responseNumber > total) {
        alert(`Response number is out of range. Please enter a number between 1 and ${total}`);
        return;
    }

    // Hide answer & question untill requested answer is reached (improves performance)
    answerElement.classList.add("hidden");
    questionElement.classList.add("hidden");

    // Calculate how many clicks are needed to reach the target response
    let diff = responseNumber - current;

    // Function to perform clicks with a delay
    function performClicks(button, times) {
        if (times === 0) {
            questionElement.classList.remove("hidden"); // show question
            answerElement.classList.remove("hidden"); // show answer

            return; // Base case: No more clicks needed
        }

        // Click the button once
        button.click();

        // Call performClicks recursively with a delay
        setTimeout(() => {
            performClicks(button, times - 1);
        }, 50); // Delay of 750 milliseconds (.75 second), adjust as needed
    }

    // Determine whether to click 'Previous' or 'Next'
    if (diff > 0) {
        // We need to click the 'Next' button `diff` times
        performClicks(nextButton, diff);
    } else if (diff < 0) {
        // We need to click the 'Previous' button `-diff` times
        performClicks(prevButton, -diff); // Use -diff to make it positive for click count
    }

}