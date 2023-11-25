

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

    // Draw bar chart
    let barChart = new BloodDripBarChart('barChartDiv', dataArray[1], true);

    document.getElementById('calendarYearSelect').addEventListener('change', function () {
        selectedYear = +this.value;

        calendarVis.redrawCalendar(selectedYear);
        monthlyVictimsLineChart.selectedYear = selectedYear;
        monthlyVictimsLineChart.updateVis();
    });

}
