class YearRaceVis {
    constructor(parentElement, shootingData) {
        this.parentElement = parentElement;
        this.shootingData = shootingData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 30, left: 40};
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
    
        // Group data by year and race
        let yearRaceMap = d3.rollup(vis.shootingData, v => v.length, d => d.date, d => d.race);
    
        // Process data for stacked bar chart
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

        // Define scales
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.1);
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // Define the stack generator
        vis.stack = d3.stack()
            .keys(["White", "Black", "Asian", "Hispanic", "Other", "Unknown"]); 

        // Stack data
        vis.series = vis.stack(vis.processedData);

        // Set domains
        vis.x.domain(vis.processedData.map(d => d.year));
        vis.y.domain([0, d3.max(vis.series, d => d3.max(d, d => d[1]))]);

        // Draw bars
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
                .attr("height", d => vis.y(d[0]) - vis.y(d[1]))
                .attr("width", vis.x.bandwidth());

        vis.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x));
        vis.svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(vis.y));
    }
}
