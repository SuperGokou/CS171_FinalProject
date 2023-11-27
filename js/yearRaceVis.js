
class YearRaceVis {
    constructor(parentElement, shootingData) {
        this.parentElement = parentElement;

        shootingData.forEach(d => {
            d.age = +d.age;  // Convert age to a number if needed
            d.date = d.date.split("-")[0]; // Extract year from the date
        });

        this.shootingData = shootingData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.color = d3.scaleOrdinal(d3.schemeCategory10);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        let yearRaceMap = d3.rollup(vis.shootingData, v => v.length, d => d.date, d => d.race);

        vis.processedData = Array.from(yearRaceMap, ([year, races]) => {
            let raceCounts = { year };
            for (let [race, count] of races) {
                raceCounts[race] = count;
            }
            return raceCounts;
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.05)
            .align(0.1);

        vis.y = d3.scaleLinear()
            .rangeRound([vis.height, 0]);

        vis.stack = d3.stack()
            .keys(["White", "Black", "Asian", "Hispanic", "Other", "Unknown"]);

        vis.series = vis.stack(vis.processedData);

        vis.x.domain(vis.processedData.map(d => d.year));
        vis.y.domain([0, d3.max(vis.series, d => d3.max(d, d => d[1]))]);

        vis.svg.append("g")
            .selectAll("g")
            .data(vis.series)
            .enter().append("g")
            .attr("fill", d => vis.color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("x", d => vis.x(d.data.year))
            .attr("y", d => vis.y(d[1]))
            .attr("height", d => {
                let height = vis.y(d[0]) - vis.y(d[1]);
                return isNaN(height) ? 0 : height;  // Use 0 height for NaN cases
            })
            .attr("width", vis.x.bandwidth());

        vis.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x));

        vis.svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(vis.y));

        // Legend
        let legend = vis.svg.selectAll(".legend")
            .data(vis.color.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", vis.width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", vis.color);

        legend.append("text")
            .attr("x", vis.width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("fill", "white")
            .text(d => d);
    }
}