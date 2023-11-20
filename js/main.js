let selectedState = '';

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
    // Process and prepare data
    let geoData = dataArray[0];
    let shootingData = dataArray[1];

    // Convert numerical fields from strings to numbers
    shootingData.forEach(d => {
        d.age = +d.age;  // Convert the age field to a number

    ageRangeVis = new AgeRangeVis('ageHistogramDiv', shootingData);
}
