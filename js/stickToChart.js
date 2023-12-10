window.addEventListener('wheel', () => {
    let sections = document.querySelectorAll('.snap-section'); // Assuming your sections are <section> tags
    let currentSectionId = '';

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.getBoundingClientRect().height;
        const sectionBottom = section.getBoundingClientRect().bottom;

        if (sectionBottom > sectionHeight && sectionTop <= window.innerHeight) {
            currentSectionId = section.id;
            if (currentSectionId === 'section1') {
                document.getElementById('stickyDiv').style.position = 'fixed';
                document.getElementById('stickyDiv').style.bottom = '-40px';
            } else {
                document.getElementById('stickyDiv').style.position = 'relative';
            }
        }
    });
    console.log('Current Section ID:', currentSectionId);
});
