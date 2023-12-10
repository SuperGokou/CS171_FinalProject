window.addEventListener('wheel', ({ deltaY }) => {
    let sections = document.querySelectorAll('.snap-section'); // Assuming your sections have the 'snap-section' class
    let currentSectionId = '';
    let closestSectionDistance = Infinity;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const distanceFromViewportTop = Math.abs(sectionTop);

        if (distanceFromViewportTop < closestSectionDistance) {
            closestSectionDistance = distanceFromViewportTop;
            currentSectionId = section.id;
        }
    });

    // Adjust 'stickyDiv' based on the current section
    if (currentSectionId === 'section1' && deltaY > 0 || currentSectionId === 'section3' && deltaY <0) {
        document.getElementById('stickyDiv').style.position = 'fixed';
        document.getElementById('stickyDiv').style.bottom = '-40px';
    } else {
        document.getElementById('stickyDiv').style.position = 'relative';
    }
});
