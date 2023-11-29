let selectedState = '';
let selectedYear = 2022;

let promises = [

    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"),
    d3.csv("data/2023-11-03-washington-post-police-shootings-export.csv")
];
Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });



function initMainPage(dataArray) {

    // Draw names background
    background = new Background('names-background', dataArray[1]);

    // Draw calendar
    calendarVis = new CalendarVis('calendarDiv', dataArray[1], selectedYear);

    // Draw monthly victims line chart
    monthlyVictimsLineChart = new MonthlyVictimsLineChart('monthlyVictimsDiv', dataArray[1], selectedYear);

    // Draw map vis
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1]);

    yearRaceVis = new YearRaceVis("yearRaceDiv", dataArray[1]);

    // Draw bar chart
    let barChart = new BloodDripBarChart('barChartDiv', dataArray[1], true);

    //draw age range bar
    myageRangeBarVis = new ageRangeBarVis('ageRangeBarDiv', dataArray[1]);


    // Event listener for year selection
    document.getElementById('calendarYearSelect').addEventListener('change', function () {
        selectedYear = +this.value;

        calendarVis.redrawCalendar(selectedYear);
        myMapVis.wrangleData(selectedYear);
        monthlyVictimsLineChart.selectedYear = selectedYear;
        monthlyVictimsLineChart.updateVis();
        myageRangeBarVis.wrangleData(selectedYear);
    });

    // Show sections
    showSections();

    // Lazy load video game
    lazyLoadVideoGame();
}

function showSections() {
    let sections = document.querySelectorAll('.snap-section');
    sections.forEach(section => {
        section.classList.add('visible');
    })
}

function lazyLoadVideoGame() {
    let gameLoaded = false;

    let observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !gameLoaded) {
                let iframe = document.createElement('iframe');
                iframe.src = "https://openprocessing.org/sketch/2067734/embed/?plusEmbedHash=74cbcc79&userID=398747&plusEmbedTitle=true&show=sketch";
                iframe.loading = "lazy";
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                entry.target.appendChild(iframe);

                gameLoaded = true;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: [0.5] }); // Adjust threshold as needed

    let gameDiv = document.getElementById('gameDiv');
    observer.observe(gameDiv);

    // Check if document is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(gameDiv);
        });
    } else {
        // Document is already loaded, observe immediately
        observer.observe(gameDiv);
        console.log('HIII')
    }
}

// BArs are fixed, neeed to fix color coding on the race chart
