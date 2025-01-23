chrome.runtime.onInstalled.addListener(() => {
    console.log("GPT Response Navigator installed");
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-open") {
        chrome.action.openPopup(); // Opens the popup
    }
});

