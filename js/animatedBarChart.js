class AnimatedBarChart {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.data = [
            {demographic: 'Black', count: 2091, rate: 5.9, population: 40e6 },
            {demographic: 'Hispanic', count: 1370, rate: 2.5, population: 62e6 },
            {demographic: 'White', count: 3944, rate: 2.3, population: 192e6 },
            {demographic: 'Other', count: 293, rate: 0.9, population: 38e6 },
        ]

        this.initVis();
        this.displayMode = 'count';
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 50, right: 20, bottom: 50, left: 70};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom - document.getElementById("animatedBarChartButton").offsetHeight; // Will need to offset height for title

        // Create svg
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom - document.getElementById("dailyVictimsTitle").offsetHeight) // Will need to offset height for title
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // X Scale
        vis.xCount = d3.scaleBand()
            .range([vis.margin.left, vis.width])
            .padding(0.1)
            .domain(vis.data.map(d => d.demographic));

        vis.xRate = d3.scaleLinear()
            .range([0, vis.xCount.bandwidth()])
            .domain([0, d3.max(vis.data, d => d.population)]);

        // Y Scale for count
        vis.yCount = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis.data, d => d.count)]);

        // Y Scale for rate
        vis.yRate = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis.data, d => d.rate)]);

        // X Axis
        vis.xAxisCount = d3.axisBottom(vis.xCount)
            .tickFormat(d => d);

        // Y Axis for Count
        vis.yAxisCount = d3.axisLeft(vis.yCount);

        // Y Axis for Rate
        vis.yAxisRate = d3.axisLeft(vis.yRate);

        // Draw X Axis
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`)
            .call(vis.xAxisCount)
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("fill", "#ffffff")

        // Draw Y Axis (for default count mode)
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${vis.margin.left}, 0)`)

        vis.yAxisGroup.call(vis.yAxisCount)
            .selectAll("text")
            .style("fill", "#ffffff");

        // Draw Y Axis label (initially for count mode)
        vis.yAxisLabel = vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - vis.height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text('Mean Annual Number of Victims')
            .style("fill", "#ffffff");

        // Draw default vis
        vis.svg.selectAll('.bar')
            .data(vis.data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xCount(d.demographic))
            .attr('y', d => vis.yCount(d.count))
            .attr('width', vis.xCount.bandwidth())
            .attr('height', d => vis.height - vis.yCount(d.count))
            .attr('fill', '#ff1616')
    }

    updateVis() {
        switch (this.displayMode) {
            case 'count':
                this.transitionToRate();
                break;
            case 'rate':
                this.transitionToCount();
                break;
        }
    }

    transitionToRate() {
        let vis = this;

        // Update bars
        vis.svg.selectAll('.bar')
            .transition()
            .duration(1000)
            .attr('y', d => vis.yRate(d.rate))
            .attr('height', d => vis.height - vis.yRate(d.rate))
            .attr('x', d => vis.xCount(d.demographic) + vis.xCount.bandwidth() / 2 - vis.xRate(d.population) / 2)
            .attr('width', d => vis.xRate(d.population))

        // Update Y Axis Scale
        vis.yAxisRate.scale(vis.yRate);

        // Transition Y Axis
        vis.yAxisGroup.transition().duration(1000)
            .call(vis.yAxisRate);

        // Update Y Axis Label
        vis.yAxisLabel
            .transition()
            .duration(500)
            .style("opacity", 0)
            .on('end', function() {
                d3.select(this)
                    .text('Mean Rate of Victims per Million per Year')
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
            })

        // Change display mode
        vis.displayMode = 'rate';
    }

    transitionToCount() {
        let vis = this;

        // Update bars
        vis.svg.selectAll('.bar')
            .transition()
            .duration(1000)
            .attr('y', d => vis.yCount(d.count))
            .attr('height', d => vis.height - vis.yCount(d.count))
            .attr('x', d => vis.xCount(d.demographic))
            .attr('width', vis.xCount.bandwidth())

        // Update Y Axis Scale
        vis.yAxisCount.scale(vis.yCount);

        // Transition Y Axis
        vis.yAxisGroup.transition().duration(1000)
            .call(vis.yAxisCount);

        // Update Y Axis Label
        vis.yAxisLabel
            .transition()
            .duration(500)
            .style("opacity", 0)
            .on("end", function() {
                d3.select(this)
                    .text('Mean Number of Victims per Year')
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
            });

        // Change display mode
        vis.displayMode = 'count';
    }

    drawLegend() {

    }
}