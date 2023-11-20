class AgeRangeVis {
    constructor(parentElement, shootingData) {
        this.parentElement = parentElement;
        this.shootingData = shootingData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 30, bottom: 40, left: 50 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Define color scale for age ranges
        vis.ageColor = d3.scaleOrdinal()
            .domain(["0-20", "21-40", "41-60", "60+"])
            .range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00"]); // Example colors for each age group

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Data processing: convert age to a number, if necessary
        vis.shootingData.forEach(d => {
            d.age = +d.age;
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // X axis: scale and draw
        vis.x = d3.scaleLinear()
            .domain([0, d3.max(vis.shootingData, d => d.age)]) // Assuming age is a number
            .range([0, vis.width]);

        // Bin the data
        let histogram = d3.histogram()
            .value(d => d.age)
            .domain(vis.x.domain())
            .thresholds(vis.x.ticks(20)); // Adjust number of bins

        let bins = histogram(vis.shootingData);

        // Y axis: scale and draw
        vis.y = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .range([vis.height, 0]);

        // Append axes to SVG
        vis.svg.append("g").call(d3.axisLeft(vis.y));
        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x));

        vis.svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
                .attr("x", d => vis.x(d.x0) + 1)
                .attr("y", d => vis.y(d.length))
                .attr("width", d => vis.x(d.x1) - vis.x(d.x0) - 1)
                .attr("height", d => vis.height - vis.y(d.length))
                .style("fill", "#69b3a2"); // Default bar color, can be adjusted

        let ageLegend = vis.svg.selectAll(".ageLegend")
            .data(vis.ageColor.domain())
            .enter().append("g")
            .attr("class", "ageLegend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        ageLegend.append("rect")
            .attr("x", vis.width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", vis.ageColor);

        ageLegend.append("text")
            .attr("x", vis.width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .style("fill", "white")
            .text(d => d);
    }
}
