class ageRangeBarVis {

    constructor(parentElement, usaShootingData, selectedYear, filters) {
        this.parentElement = parentElement;
        this.data = usaShootingData;
        this.displayData = usaShootingData;
        this.selectedYear = selectedYear;
        this.filters = filters;
        this.initVis();
    }

    initVis() {
        let vis = this;
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

        // Tooltip setup
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.selectedYear = selectedYear ? selectedYear : vis.selectedYear;

        let filteredData = vis.displayData.filter(d => {
            return parseInt(d.date.split('-')[0]) === parseInt(vis.selectedYear) && vis.checkFilters(d)
        });

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

        vis.updateVis();
    }

    checkFilters(d) {
        let vis = this;

        for (const category in vis.filters) {
            for (const filter in vis.filters[category]) {
                switch (filter) {

                    // Only filter out hispanic black people if both filters are off
                    case "Black":
                    case "Hispanic":
                        if (!vis.filters['race']['Black'] &&
                            !vis.filters['race']['Hispanic'] &&
                            d[category] == "Black,Hispanic") {
                            return false;
                        } else if (!vis.filters[category][filter] && d[category] == filter) {
                            return false;
                        }
                        break;

                    default:
                        if ((!vis.filters[category][filter] && d[category] == filter)) {
                            return false;
                        }
                }

            }
        }
        return true;
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
            .attr("fill", "darkred")
            .on("mouseover", function(event, d) {
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                vis.tooltip.html("Count: " + d.count)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        vis.bars.exit().remove();

        // Draw bar labels (if necessary)
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

    redrewAgeRangeBarVis(selectedYear, filters) {
        let vis = this;
        vis.selectedYear = selectedYear;
        vis.filters = filters;
        vis.wrangleData();
    }
}
