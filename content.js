// click back/next buttons
function shiftToResponse(response_num_div, diff) {
    // Get references to navigation buttons
    let prevButton = response_num_div.parentElement.querySelector('button[aria-label="Previous response"]');
    let nextButton = response_num_div.parentElement.querySelector('button[aria-label="Next response"]');

    // Function to perform clicks with a delay
    function performClicks(button, times) {
        if (times === 0) return; // Base case: No more clicks needed
        button.click(); // Click the button once
        // Call performClicks recursively with a delay
        setTimeout(() => {
            performClicks(button, times - 1);
        }, 15) // Delay of 15 milliseconds (.015 second) .. adjust as needed
    }
    // Determine whether to click 'Previous' or 'Next'
    if (diff > 0) {
        // click the 'Next' button `diff` times
        performClicks(nextButton, diff);
    } else if (diff < 0) {
        // to click the 'Previous' button 'diff' times
        performClicks(prevButton, Math.abs(diff));
    }
}

// change edit button icon (pencil/confirm)
function changeBtnTextIcon(btn, btn_on) {
    if (btn_on) btn.innerText = "✔️";
    else btn.innerText = "✏️";
}

// reset to init state
function hideInputElements(jumpElements, response_num_div) {
    // show original response num div
    if (response_num_div.classList.contains("hidden")) response_num_div.classList.remove("hidden");
    let prevButton = response_num_div.parentElement.querySelector('button[aria-label="Previous response"]');
    if (prevButton.classList.contains("hidden")) prevButton.classList.remove("hidden");
    let nextButton = response_num_div.parentElement.querySelector('button[aria-label="Next response"]');
    if (nextButton.classList.contains("hidden")) nextButton.classList.remove("hidden");

    // hide custom jump elements    
    jumpElements.forEach(element => {
        if (element.id == "edit_button") {
            // btn in init state (pencil icon)
            changeBtnTextIcon(element, false);
        } else if (!element.classList.contains("hidden")) {
            element.classList.add("hidden");
        }
    })
    
}

// show response when loaded (perf mode)
function responseWatchdog(response_num_div, target_num, qa_div, temp_loading_div) {
    // Extract the current response number and total from the string (e.g., "20/30")
    let [response_current, response_total] = response_num_div.innerText.split('/').map(num => parseInt(num, 10));
    if (response_current == target_num) {
        // Remove loading indicator from main content
        document.querySelector('main').removeChild(temp_loading_div);
        qa_div.classList.remove("hidden");
    } else {
        setTimeout(() => {
            // update loading div
            temp_loading_div.innerHTML = "<h1>Loading response..</h1>";
            temp_loading_div.innerHTML += `<h4>${response_current}/${response_total}</h4>`;
            // execute until requested response is loaded
            responseWatchdog(response_num_div, target_num, qa_div, temp_loading_div);
        }, 1500) // Delay of 1.5 seconds .. adjust as needed
    }
}

// shows jump to response HTML
function showInputElements(jumpElements, response_num_div) {
    // hide original response num div
    if (!response_num_div.classList.contains("hidden")) response_num_div.classList.add("hidden");
    let prevButton = response_num_div.parentElement.querySelector('button[aria-label="Previous response"]');
    if (!prevButton.classList.contains("hidden")) prevButton.classList.add("hidden");
    let nextButton = response_num_div.parentElement.querySelector('button[aria-label="Next response"]');
    if (!nextButton.classList.contains("hidden")) nextButton.classList.add("hidden");

    // show custom jump elements    
    jumpElements.forEach(element => {
        if (element.id == "edit_button") {
            // btn in edit state (confirm icon)
            changeBtnTextIcon(element, true);
        } else if (element.classList.contains("hidden")) {
            element.classList.remove("hidden");
        }
    })
}

function edit_btn_click_fn(jumpElements, response_num_div) {
    // Extract the current response number and total from the string (e.g., "20/30")
    let [response_current, response_total] = response_num_div.innerText.split('/').map(num => parseInt(num, 10));
    // Add max and current value to custom input
    custom_response_input = jumpElements.find(el => el.tagName == "INPUT");
    custom_response_input.max = `${response_total}`;
    
    // input element is hidden, show jump elements
    if (custom_response_input.classList.contains("hidden")) {
        showInputElements(jumpElements, response_num_div);
        custom_response_input.value = `${response_current}`;
        custom_response_input.focus();
        total_responses = jumpElements.find(el => el.tagName == "P");
        total_responses.innerText = `/${response_total}`;
    }
    else {
        // restrict response value range 
        let response_num = Math.min(Math.max(1, parseInt(custom_response_input.value, 10)), response_total);
        // Calculate how many clicks are needed to reach the target response
        let diff = response_num - response_current;
        // show/hide UI if perf_mode is ON/OFF
        if (window.chrome && window.chrome.storage) {
            chrome.storage.local.get('perf_mode', (data) => {
                if (data.perf_mode && data.perf_mode == "ON") {
                    console.log("perf mode is on .. hide UI");
                    // Hide questions & answers while shifting
                    let qaDivElement = document.querySelector('div[class^="react-scroll-to-bottom"][class*="h-full"]');
                    qaDivElement.classList.add("hidden");
                    // Create loading indicator
                    loading_div = document.createElement("div");
                    loading_div.style = "text-align: center; padding: 3em;";
                    loading_div.innerHTML = "<h1>Loading response..</h1>";
                    loading_div.innerHTML += `<h4>${response_current}/${response_total}</h4>`;
                    // Add loading indicator to top of main content
                    document.querySelector('main').prepend(loading_div);
                    // Show response when loaded
                    responseWatchdog(response_num_div, response_num, qaDivElement, loading_div);
                } else {
                    console.info("perf mode is off");
                }
                // revert to pencil icon w/ no input
                hideInputElements(jumpElements, response_num_div);
                // go to desired response
                shiftToResponse(response_num_div, diff);
            })
        }
    }
}

function addJumpElements(response_num_div) {
    const cancel_button = document.createElement("button");
    cancel_button.innerText = "✖️"; //Cancel icon
    cancel_button.classList.add("hidden");
    const edit_button = document.createElement("button");
    edit_button.innerText = "✏️"; //Pencil icon
    edit_button.id = "edit_button";
    const custom_response_input = document.createElement("input");
    custom_response_input.type = "number";
    custom_response_input.classList.add("hidden", "p-1", "text-center");
    custom_response_input.min = "1";
    custom_response_input.addEventListener('keydown', function (event) {
        // Check if the pressed key is Enter 
        if (event.key === 'Enter') {
            // Prevent the default action (if needed)
            event.preventDefault();
            // Simulate a click on the confirm button
            edit_button.click();
        }
        // Check if the pressed key is Escape
        else if (event.key === 'Escape') {
            // Prevent the default action (if needed)
            event.preventDefault();
            // Simulate a click on the cancel button
            cancel_button.click();
        }
    })
    const total_responses = document.createElement("p");
    total_responses.classList.add("hidden", "p-1");

    const jumpElements = [custom_response_input, total_responses, edit_button, cancel_button];
    jumpElements.forEach(element => {
        response_num_div.parentElement.appendChild(element);
    })

    cancel_button.addEventListener("click", () => hideInputElements(jumpElements, response_num_div));
    edit_button.addEventListener("click", () => edit_btn_click_fn(jumpElements, response_num_div));
}

const responseNumberClass = "tabular-nums";
function loopInputDivs() {
    const divs = document.querySelectorAll(`div.${responseNumberClass}`);
    for (const num_div of divs) {
        if (!num_div.classList.contains("mod-response")) {
            addJumpElements(num_div);
            num_div.classList.add("mod-response"); // mark as modified
        }
    }
}

// Observe changes to the DOM
const observer = new MutationObserver(loopInputDivs);
observer.observe(document.body, { childList: true, subtree: true });