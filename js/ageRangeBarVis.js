class ageRangeBarVis {

    constructor(parentElement, usaShootingData) {
        this.parentElement = parentElement;
        this.data = usaShootingData;
        this.displayData = usaShootingData;
        // console.log(this.displayData);
        this.initVis();
    }

    initVis() {
        let vis = this;
        // console.log(vis.parentElement);
        // console.log(vis.displayData);
        vis.selectedYear = 2022;
        vis.margin = { top: 80, right: 80, bottom: 80, left: 80 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        vis.svg = d3.select('#' + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.y = d3.scaleBand()
            .rangeRound([0, vis.height])
            .padding(0.5);

        vis.x = d3.scaleLinear()
            .rangeRound([0, vis.width - 80]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "y-axis");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    wrangleData(selectedYear) {
        let vis = this;

        vis.selectedYear = selectedYear ? selectedYear : vis.selectedYear;

        let filteredData = vis.displayData.filter(d => {
            return parseInt(d.date.split('-')[0]) === parseInt(vis.selectedYear);
        });

        console.log(vis.selectedYear)
        console.log(filteredData);

        let ShootingData = Array.from(d3.group(filteredData, d => d.age), ([key, value]) => ({key, value}))

        vis.agecount = [];

        ShootingData.forEach(age => {
            vis.agecount.push(
                {
                    age: age.key,
                    agecount: age.value.length,
                    year: vis.selectedYear
                }
            )
        });

        vis.groupedData = {};

        vis.agecount.forEach(item => {
            // Skip if age is not a number
            if (isNaN(item.age)) return;

            // Determine the age group
            let group = getAgeGroup(item.age);

            // Initialize the group in the result if it doesn't exist
            if (!vis.groupedData[group]) {
                vis.groupedData[group] = 0;
            }

            vis.groupedData[group] += item.agecount;
        });

        // Filter out the "NaN-NaN" age range
        delete vis.groupedData["NaN-NaN"];
        console.log(vis.groupedData);

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        vis.dataArray = Object.entries(vis.groupedData).map(([ageRange, count]) => ({ageRange, count}));

        vis.dataArray.sort((a, b) => getStartingAge(a.ageRange) - getStartingAge(b.ageRange));

        // Set domains for the scales
        vis.y.domain(vis.dataArray.map(d => d.ageRange));
        vis.x.domain([0, d3.max(vis.dataArray, d => d.count)*0.95]);

        // Draw Y axis
        vis.svg.select(".y-axis")
            .call(vis.yAxis)
            .selectAll("text")   // Select all text elements in the y-axis group
            .style("fill", "white")
            .style("font-size", 15);

        // Draw the bars
        vis.bars = vis.svg.selectAll(".bar")
            .data(vis.dataArray);

        vis.bars.enter()
            .append("rect")
            .attr("class", "bar")
            .merge(vis.bars)
            .attr("y", d => vis.y(d.ageRange))
            .attr("height", vis.y.bandwidth())
            .attr("x", 5)
            .attr("width", d => vis.x(d.count))
            .attr("fill", "darkred");
        vis.bars.exit().remove();

        let labels = vis.svg.selectAll(".bar-label")
            .data(vis.dataArray)

        labels.enter()
            .append("text")
            .attr("class", "bar-label")
            .merge(labels)
            .attr("x", d => vis.x(d.count) + 10)
            .attr("y", d => vis.y(d.ageRange) + vis.y.bandwidth() / 2)
            .attr("dy", ".35em")
            .text(d => d.count)
            .attr("fill", "white");
        labels.exit().remove();

    }

}

//edited, needs color correction on bars
