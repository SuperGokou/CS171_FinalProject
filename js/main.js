

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
    // log data
    // console.log('check out the data', dataArray);

    console.log(dataArray[0])
    // TODO - init map
    myMapVis = new MapVis('mapDiv', dataArray[0], dataArray[1]);
    myAgeBarVis = new ageRangeBarVis('ageRange',dataArray[1], "Victims Age Range");

}
