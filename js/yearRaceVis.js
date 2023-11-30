class YearRaceVis {
    constructor(parentElement, shootingData) {
        this.parentElement = parentElement;
        this.displayData = shootingData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 20, right: 100, bottom: 100, left: 40 }; // Adjusted right margin for legend
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.color = d3.scaleOrdinal()
            .domain(["White", "Black", "Asian", "Hispanic", "Other", "Unknown"])
            .range(["#f0f0f0", "#000000", "#ffd700", "#ff8c00", "#1e90ff", "#808080"]);

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        let yearRaceMap = d3.rollup(vis.displayData, v => v.length, d => new Date(d.date).getFullYear(), d => d.race);

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

        let bars = vis.svg.append("g")
            .selectAll("g")
            .data(vis.series)
            .enter().append("g")
                .attr("fill", d => vis.color(d.key));

        bars.selectAll("rect")
            .data(d => d)
            .enter().append("rect")
                .attr("x", d => vis.x(d.data.year))
                .attr("y", d => vis.y(d[1]))
                .attr("height", d => vis.y(d[0]) - vis.y(d[1]))
                .attr("width", vis.x.bandwidth())
                .on("mouseover", function(event, d) {
                    vis.tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    vis.tooltip.html("Count: " + (d[1] - d[0])) // Only displaying count
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    vis.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

        vis.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        vis.svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(vis.y));

        // Update or create color legend
        vis.svg.selectAll(".legend").remove();

        let legend = vis.svg.selectAll(".legend")
            .data(vis.color.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", vis.width - 24)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", vis.color);

        legend.append("text")
            .attr("x", vis.width - 30)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d);
    }
}
