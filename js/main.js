let selectedState = '';
let selectedYear = 2022;

let filters = {
    "temporal" : {
        "gender" : {
            "male" : true,
            "female" : true,
            "non-binary" : true,
            "unknown" : true
        },
        "race" : {
            "Black" : true,
            "White" : true,
            "Hispanic" : true,
            "Asian" : true,
            "Native American" : true,
            "Unknown" : true,
            "Other" : true
        },
        "armed_status" : {
            "armed" : true,
            "unarmed" : true,
            "unknown" : true
        }
    },
    "geographical" : {
    }
}

let promises = [

    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"),
    d3.csv("data/shootings_data_cleaned.csv")
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
    calendarVis = new CalendarVis('calendarDiv', dataArray[1], selectedYear, filters.temporal);

    // Draw monthly victims line chart
    monthlyVictimsLineChart = new MonthlyVictimsLineChart('monthlyVictimsDiv', dataArray[1], selectedYear, filters.temporal);

    // Draw map vis
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1], selectedYear, filters.temporal);

    yearRaceVis = new YearRaceVis("yearRaceDiv", dataArray[1]);

    // Draw bar chart
    let barChart = new BloodDripBarChart('barChartDiv', dataArray[1], true);

    //draw age range bar
    myageRangeBarVis = new ageRangeBarVis('ageRangeBarDiv', dataArray[1], selectedYear, filters.temporal);

    // Event listener for year selection on temporal charts
    document.getElementById('calendarYearSelect').addEventListener('change', temporalChartSelect);
    document.getElementById('monthlyVictimsYearSelect').addEventListener('change', temporalChartSelect);

    // Event listener for gender / racial / armed status filters
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
       btn.addEventListener('click', filterChart)
    });

    // Show sections
    showSections();

    // Lazy load video game
    lazyLoadVideoGame();
}

function temporalChartSelect() {
    selectedYear = +this.value;

    calendarVis.redrawCalendar(selectedYear, filters.temporal);
    monthlyVictimsLineChart.selectedYear = selectedYear;
    monthlyVictimsLineChart.wrangleData();
    myMapVis.redrawMavis(selectedYear, filters.temporal)
    myageRangeBarVis.redrewAgeRangeBarVis(selectedYear, filters.temporal)

    // Ensure both temporal chart select boxes have the same value
    document.getElementById('calendarYearSelect').value = selectedYear;
    document.getElementById('monthlyVictimsYearSelect').value = selectedYear;
    // myageRangeBarVis.wrangleData(selectedYear);
}

function filterChart() {
    this.classList.toggle('active');
    switch (this.dataset.chart) {
        case 'temporal':
            filters.temporal[this.dataset.filtertype][this.dataset.filtervalue] =
                !filters.temporal[this.dataset.filtertype][this.dataset.filtervalue];

            console.log(filters.temporal)
            calendarVis.redrawCalendar(selectedYear, filters.temporal);
            monthlyVictimsLineChart.filters = filters.temporal;
            monthlyVictimsLineChart.wrangleData();
            myMapVis.redrawMavis(selectedYear, filters.temporal)
            myageRangeBarVis.redrewAgeRangeBarVis(selectedYear, filters.temporal)

            break;
    }
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
