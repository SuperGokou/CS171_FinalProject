let ageRangeVis, yearRaceVis;

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
    let shootingData = dataArray[1];

    shootingData.forEach(d => {
        d.age = +d.age;  
        d.date = d.date.split("-")[0]; 
    });

    ageRangeVis = new AgeRangeVis("ageHistogramDiv", shootingData);

    yearRaceVis = new YearRaceVis("yearRaceDiv", shootingData);
}
