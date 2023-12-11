let selectedState = '';
let temporalChartsSelectedYear = 2022;
let geographicalChartsSelectedYear = 0;
let geographicalChartsSelectedMetric = 'count';

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
    }
}

let promises = [

    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"),
    d3.csv("data/shootings_data_cleaned.csv"),
    d3.csv("data/populations.csv")
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
    calendarVis = new CalendarVis('calendarDiv', dataArray[1], temporalChartsSelectedYear, filters.temporal);

    // Draw monthly victims line chart
    monthlyVictimsLineChart = new MonthlyVictimsLineChart('monthlyVictimsDiv', dataArray[1], temporalChartsSelectedYear, filters.temporal);

    // Draw map vis
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1], restructurePopulationData(dataArray[2]), geographicalChartsSelectedMetric, geographicalChartsSelectedYear, filters.geographical);

    animatedBarChart = new AnimatedBarChart('yearRaceDiv');

    // Draw bar chart
    dripBarChart = new BloodDripBarChart('barChartDiv', dataArray[1], restructurePopulationData(dataArray[2]), true, geographicalChartsSelectedYear, filters.geographical);

    // Event listener for year selection on temporal charts
    document.getElementById('calendarYearSelect').addEventListener('change', temporalChartSelect);
    document.getElementById('monthlyVictimsYearSelect').addEventListener('change', temporalChartSelect);

    // Event listener for year selection on geographical charts
    document.getElementById('mapVictimsYearSelect').addEventListener('change', geographicalChartYearSelect);
    document.getElementById('dripVictimsYearSelect').addEventListener('change', geographicalChartYearSelect);

    // Event listener for metric selection geographical charts
    document.getElementById('mapVictimsMetricSelect').addEventListener('change', geographicalChartMetricSelect);
    document.getElementById('dripVictimsMetricSelect').addEventListener('change', geographicalChartMetricSelect);

    // Event listener for gender / racial / armed status filters
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.addEventListener('click', filterChart)
    });

    document.getElementById('animatedBarChartSelect').addEventListener('change', function() {
        animatedBarChart.displayMode = this.value;
        animatedBarChart.updateVis();
    })

    // Show sections
    showSections();

    // Lazy load video game & blood drip
    lazyLoadVideoGame();
    lazyLoadBloodDrip();
}

function restructurePopulationData(populationData) {
    let vis = this;

    let restructuredData = populationData.reduce((accumulator, current) => {
        const state = current.State;
        accumulator[state] = {
            "Total" : +current.Total,
            "Black" : +current.Black,
            "White" : +current.White,
            "Hispanic" : +current.Hispanic,
            "Asian" : +current.Asian,
            "Native American" : +current["Native American"],
            "Other" : +current.Other,
        };

        return accumulator;
    });

    return restructuredData;
}

function temporalChartSelect() {
    // Ensure both temporal chart select boxes have the same value
    calendarVis.redrawCalendar(temporalChartsSelectedYear, filters.temporal);
    monthlyVictimsLineChart.selectedYear = temporalChartsSelectedYear;
    monthlyVictimsLineChart.wrangleData();

    document.getElementById('calendarYearSelect').value = temporalChartsSelectedYear;
    document.getElementById('monthlyVictimsYearSelect').value = temporalChartsSelectedYear;
}

function geographicalChartYearSelect() {
    geographicalChartsSelectedYear = this.value === 'all' ? 0 : +this.value; // Convert 'all' to 0, otherwise use the numeric value
    myMapVis.redrawMapVis(geographicalChartsSelectedYear, filters.geographical, geographicalChartsSelectedMetric)
    dripBarChart.redrawdripbarchart(geographicalChartsSelectedYear, filters.geographical, geographicalChartsSelectedMetric);


    document.getElementById('mapVictimsYearSelect').value = this.value;
    document.getElementById('dripVictimsYearSelect').value = this.value;
}

function geographicalChartMetricSelect() {
    geographicalChartsSelectedMetric = this.value;
    myMapVis.redrawMapVis(geographicalChartsSelectedYear, filters.geographical, geographicalChartsSelectedMetric)
    dripBarChart.redrawdripbarchart(geographicalChartsSelectedYear, filters.geographical, geographicalChartsSelectedMetric);


    document.getElementById('mapVictimsMetricSelect').value = this.value;
    document.getElementById('dripVictimsMetricSelect').value = this.value;
}

function filterChart() {
    this.classList.toggle('active');
    switch (this.dataset.chart) {
        case 'temporal':
            filters.temporal[this.dataset.filtertype][this.dataset.filtervalue] =
                !filters.temporal[this.dataset.filtertype][this.dataset.filtervalue];

            console.log(filters.temporal)
            calendarVis.redrawCalendar(temporalChartsSelectedYear, filters.temporal);
            monthlyVictimsLineChart.filters = filters.temporal;
            monthlyVictimsLineChart.wrangleData();

            break;
        case 'geographical':
            filters.geographical[this.dataset.filtertype][this.dataset.filtervalue] =
                !filters.geographical[this.dataset.filtertype][this.dataset.filtervalue];

            console.log(filters.geographical)
            myMapVis.redrawMapVis(geographicalChartsSelectedYear, filters.geographical)
            dripBarChart.redrawdripbarchart(geographicalChartsSelectedYear, filters.geographical);
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
    }
}

function lazyLoadBloodDrip() {
    let dripping = false;

    let observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            console.log('hello?')
            if (entry.isIntersecting && !dripping) {
                dripping = true;
                dripBarChart.redrawdripbarchart(0, filters.geographical);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: [0.5] });

    let dripChartDiv = document.getElementById('section1');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(dripChartDiv);
        });
    } else {
        observer.observe(dripChartDiv);
    }
}
