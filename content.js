document.addEventListener('keydown', function (event) {
    if (event.key === 'PageUp') {
        nextButton = document.querySelector('button[aria-label="Next response"]');
        nextButton.click();

    } else if (event.key === 'PageDown') {
        prevButton = document.querySelector('button[aria-label="Previous response"]');
        prevButton.click();
    }
});

