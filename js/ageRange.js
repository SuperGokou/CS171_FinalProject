class AgeRangeVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set dimensions and margins for the graph
        vis.margin = {top: 10, right: 30, bottom: 40, left: 50};
        vis.width = 460 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // Append SVG object to the specified parent element
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;



        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // X axis: scale and draw
        vis.x = d3.scaleLinear()
            .domain([0, d3.max(vis.data, d => d.age)])  // The age data is now numeric
            .range([0, vis.width]);

        let histogram = d3.histogram()
            .value(d => d.age)
            .domain(vis.x.domain())
            .thresholds(vis.x.ticks(20));  // Adjust the number of bins

        let bins = histogram(vis.data);

        vis.y = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)])
            .range([vis.height, 0]);

        vis.svg.append("g")
            .call(d3.axisLeft(vis.y));

        vis.svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("x", d => vis.x(d.x0) + 1)
            .attr("y", d => vis.y(d.length))
            .attr("width", d => vis.x(d.x1) - vis.x(d.x0) - 1)
            .attr("height", d => vis.height - vis.y(d.length))
            .style("fill", "#69b3a2");

    }
}
