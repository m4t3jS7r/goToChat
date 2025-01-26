// Enable/Disable performance mode (show/hide DOM when loading response)
enDis_btn = document.getElementById('enDisPerfMode');
popup_element = document.getElementById('perf_mode_el');

function set_popup_content(perf_mode_on){
    if (perf_mode_on) {
        popup_element.innerText = "ON";
        popup_element.style.color = "red";
        enDis_btn.innerText = "Disable";
    }else{
        popup_element.innerText = "OFF";
        popup_element.style.color = "blue";
        enDis_btn.innerText = "Enable";
    }
}

enDis_btn.addEventListener('click', () => {
    if (popup_element.innerText == "OFF") {
        set_popup_content(true);
    }else{
        set_popup_content(false);
    }
    // Save the value to chrome.storage 
    chrome.storage.local.set({ perf_mode: popup_element.innerText }, () => {
        console.log('Perf mode:', popup_element.innerText);
    })
})

// Code to run when the popup is opened 
document.addEventListener('DOMContentLoaded', () => {
    // Load perf_mode value from chrome.storage 
    chrome.storage.local.get('perf_mode', (data) => {
        if (data.perf_mode && data.perf_mode == "ON") {
            popup_element.innerText = "ON";
            popup_element.style.color = "red";
            enDis_btn.innerText = "Disable";
        }
    })
})